const nodemailer = require('nodemailer');
const https      = require('https');
const { google }  = require('googleapis');

// ── HTTPS POST helper (no fetch needed) ───────────────────────
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        else resolve(data);
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── Worksheet name per type ────────────────────────────────────
function sheetNameFor(type) {
  if (type === 'ticket')     return 'จองตั๋ว';
  if (type === 'car-rental') return 'รถเช่า';
  if (type === 'join-tour')  return 'จอยทัวร์';
  if (type === 'hotel')      return 'จองโรงแรม';
  return 'กรุ๊ปเหมา';
}

// ── SeqNo prefix per type ──────────────────────────────────────
function seqPrefixFor(type) {
  if (type === 'ticket')     return 'TK';
  if (type === 'car-rental') return 'RC';
  if (type === 'join-tour')  return 'JT';
  if (type === 'hotel')      return 'HT';
  return 'GI';
}

// ── Header row per worksheet (ใช้ตอนสร้างชีตใหม่อัตโนมัติ) ──────
const SHEET_HEADERS = {
  'จองโรงแรม': ['เลขที่', 'เวลา', 'ชื่อ', 'โทร', 'อีเมล', 'เมือง/ปลายทาง', 'โรงแรม', 'เช็คอิน', 'เช็คเอาท์', 'จำนวนคืน', 'ห้อง', 'ประเภทห้อง', 'ผู้ใหญ่', 'เด็ก', 'ระดับ', 'งบ/คืน', 'หมายเหตุ', 'ไฟล์แนบ'],
};

// ── สร้าง worksheet ให้อัตโนมัติถ้ายังไม่มี (self-healing) ─────────
async function ensureSheet(sheets, sheetId, sheetName) {
  if (!sheetName) return;
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
    if ((meta.data.sheets || []).some(s => s.properties.title === sheetName)) return;
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: sheetId, requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] } });
    const headers = SHEET_HEADERS[sheetName];
    if (headers) await sheets.spreadsheets.values.append({ spreadsheetId: sheetId, range: `${sheetName}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } });
    console.log('Created worksheet:', sheetName);
  } catch (e) { console.warn('ensureSheet failed:', e.message); }
}

// ── Generate sequence number: PREFIX-YYMMNN (พ.ศ.) ───────────
async function generateSeqNo(sheets, sheetId, sheetName, type) {
  const nowDate      = new Date();
  const buddhistYear = (nowDate.getFullYear() + 543).toString().slice(-2); // e.g. "69"
  const month        = String(nowDate.getMonth() + 1).padStart(2, '0');    // e.g. "05"
  const typePrefix   = seqPrefixFor(type);                                 // e.g. "TK"
  const datePrefix   = `${buddhistYear}${month}`;                          // e.g. "6905"
  const fullPrefix   = `${typePrefix}${datePrefix}`;                       // e.g. "TK6905"

  const range = sheetName ? `${sheetName}!A:A` : 'A:A';
  const meta = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  const allValues = meta.data.values || [];
  const countThisMonth = allValues.filter(r => r[0] && String(r[0]).startsWith(fullPrefix)).length;
  const runNo = String(countThisMonth + 1).padStart(2, '0');
  return `${fullPrefix}${runNo}`; // e.g. "TK690501"
}

// ── Send LINE push (plain text) — ส่งไปทั้ง User และ Group ───
async function sendLine(formData, seqNo, sheetUrl) {
  const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId  = process.env.LINE_OWNER_USER_ID;
  const groupId = process.env.LINE_GROUP_ID;

  if (!token) { console.log('LINE skipped: no token'); return; }
  if (!userId && !groupId) { console.log('LINE skipped: no userId or groupId'); return; }

  const f = formData;
  let text;

  if (f._type === 'ticket') {
    const airlineMap = { full: 'Full Service', low: 'Low Cost', other: f.airlineOther || 'อื่นๆ' };
    const seatMap = { economy: 'Economy', business: 'Business', first: 'First Class', flatbed: 'Flatbed' };
    text = [
      '🎫✈️ มาแล้วๆ!! คำขอจองตั๋ว!!',
      seqNo ? `🔢 หมายเลขอ้างอิง: ${seqNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      `👤 ชื่อ: ${f.fullName}`,
      '━━━━━━━━━━━━━━━━━━',
      `🛂 พาสปอร์ต: ${f.passportNo || '-'}  (หมดอายุ: ${f.passportExpiry || '-'})`,
      `📅 ขาไป: ${f.outboundDate}  ช่วงเวลา: ${f.outboundTime || '-'}`,
      f.returnDate ? `📅 ขากลับ: ${f.returnDate}  ช่วงเวลา: ${f.returnTime || '-'}` : null,
      `✈️ สายการบิน: ${airlineMap[f.airlineType] || f.airlineType}`,
      `💺 ที่นั่ง: ${seatMap[f.seatClass] || f.seatClass}`,
      `👥 ผู้โดยสาร: ผู้ใหญ่ ${f.adults} / เด็ก ${f.children} / ทารก ${f.infants} (รวม ${f.totalPax} คน)`,
      f.note ? `💬 หมายเหตุ: ${f.note}` : null,
      ...(f.driveFiles?.length
        ? ['━━━━━━━━━━━━━━━━━━', '📎 ไฟล์พาสปอร์ต:', ...f.driveFiles.map(d => `• ${d.name}\n  ${d.url}`)]
        : []),
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');

  } else if (f._type === 'car-rental') {
    text = [
      '🚗 มาแล้วๆ!! คำขอเช่ารถ!!',
      seqNo ? `🔢 หมายเลขอ้างอิง: ${seqNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      `👤 ชื่อ: ${f.fullName}`,
      `📞 โทร: ${f.phone}`,
      f.email ? `📧 อีเมล: ${f.email}` : null,
      '━━━━━━━━━━━━━━━━━━',
      `🚙 ประเภทรถเช่า: ${f.rentalLabel || f.rentalType}`,
      `📅 วันรับรถ: ${f.pickupDate}`,
      f.returnDate ? `📅 วันคืนรถ: ${f.returnDate}` : null,
      `📍 สถานที่รับ: ${f.pickupLocation}`,
      `🚗 ประเภทรถ: ${f.carLabel || f.carType}`,
      `👥 จำนวนผู้โดยสาร: ${f.passengers} คน`,
      f.note ? `💬 หมายเหตุ: ${f.note}` : null,
      ...(f.driveFiles?.length
        ? ['━━━━━━━━━━━━━━━━━━', '📎 เอกสาร (ใบขับขี่/พาสปอร์ต):', ...f.driveFiles.map(d => `• ${d.name}\n  ${d.url}`)]
        : []),
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');

  } else if (f._type === 'hotel') {
    text = [
      '🏨 มาแล้วๆ!! คำขอจองโรงแรม!!',
      seqNo ? `🔢 หมายเลขอ้างอิง: ${seqNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      `👤 ชื่อ: ${f.fullName}`,
      `📞 โทร: ${f.phone}`,
      f.email ? `📧 อีเมล: ${f.email}` : null,
      '━━━━━━━━━━━━━━━━━━',
      `📍 เมือง/ปลายทาง: ${f.destination || '-'}`,
      f.hotelName ? `🏨 โรงแรมที่สนใจ: ${f.hotelName}` : null,
      `📅 เช็คอิน: ${f.checkIn || '-'}  →  เช็คเอาท์: ${f.checkOut || '-'}${f.nights ? `  (${f.nights} คืน)` : ''}`,
      `🛏️ ห้อง: ${f.rooms || 1} ห้อง · ${f.roomType || '-'}`,
      `👥 ผู้เข้าพัก: ผู้ใหญ่ ${f.adults || 0} / เด็ก ${f.children || 0}`,
      f.stars ? `⭐ ระดับ: ${f.stars}` : null,
      f.budget ? `💰 งบ/คืน: ${f.budget}` : null,
      f.note ? `💬 หมายเหตุ: ${f.note}` : null,
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');

  } else if (f._type === 'join-tour') {
    // คำนวณระยะเวลา
    let duration = '';
    if (f.depDate && f.retDate) {
      const d1 = new Date(f.depDate), d2 = new Date(f.retDate);
      const days = Math.round((d2 - d1) / 86400000) + 1;
      if (!isNaN(days) && days > 0) duration = `${days} วัน`;
    }
    text = [
      '🎉🎊 มาแล้วๆๆ!!! จอยทัวร์ มาแล้ว!! ✈️',
      seqNo ? `🔢 หมายเลขอ้างอิง: ${seqNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      '👤 ข้อมูลผู้ติดต่อ',
      `ชื่อ: ${f.fullName}`,
      `โทร: ${f.phone}`,
      f.email   ? `อีเมล: ${f.email}`          : null,
      f.passportNo ? `🛂 พาสปอร์ต: ${f.passportNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      '✈️ รายละเอียดทัวร์',
      f.tourCode ? `🔖 รหัสทัวร์: ${f.tourCode}`  : null,
      f.tourName ? `📍 ปลายทาง: ${f.tourName}`    : null,
      f.depDate  ? `📅 วันเดินทาง: ${f.depDate}${f.retDate ? ` → ${f.retDate}` : ''}` : null,
      duration   ? `⏱️ ระยะเวลา: ${duration}`      : null,
      `👥 จำนวนผู้เดินทาง: ผู้ใหญ่ ${f.adults||0} / เด็ก ${f.children||0} / ทารก ${f.infants||0} (รวม ${f.totalPax||0} คน)`,
      f.note     ? `💬 หมายเหตุ: ${f.note}`        : null,
      ...(f.driveFiles?.length
        ? ['━━━━━━━━━━━━━━━━━━', '📎 ไฟล์แนบ:', ...f.driveFiles.map(d => `• ${d.name}\n  ${d.url}`)]
        : []),
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');

  } else {
    // Group quote (default)
    const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
      ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');
    text = [
      '🎉🎊 มาแล้วๆๆ!!! งานเหมา มาแล้ว!! ✈️',
      seqNo ? `🔢 หมายเลขอ้างอิง: ${seqNo}` : null,
      '━━━━━━━━━━━━━━━━━━',
      '👤 ข้อมูลผู้ติดต่อ',
      `ชื่อ: ${f.firstName} ${f.lastName}`,
      f.company   ? `บริษัท: ${f.company}`           : null,
      `โทร: ${f.phone}`,
      f.lineId    ? `LINE ID: ${f.lineId}`            : null,
      `อีเมล: ${f.email}`,
      f.emailAlt  ? `อีเมลสำรอง: ${f.emailAlt}`      : null,
      '━━━━━━━━━━━━━━━━━━',
      '✈️ รายละเอียดทัวร์',
      `📍 ปลายทาง: ${f.destination}`,
      f.pax       ? `👥 จำนวน: ${f.pax} คน`          : null,
      `📅 วันเดินทาง: ${f.travelDate}`,
      `⏱️ ระยะเวลา: ${f.duration}`,
      `🎒 รูปแบบ: ${tourTypeLabel}`,
      `🏨 โรงแรม: ${f.hotel}`,
      f.airline   ? `✈️ สายการบิน: ${f.airline}`     : null,
      f.budget    ? `💰 งบ/ท่าน: ${f.budget}`        : null,
      f.extraInfo ? `💬 เพิ่มเติม: ${f.extraInfo}`   : null,
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');
  }

  if (sheetUrl) {
    text += `\n━━━━━━━━━━━━━━━━━━\n📊 ดูข้อมูลใน Google Sheet:\n${sheetUrl}`;
  }

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // ส่งไปทุก recipient ที่ตั้งไว้ (userId และ/หรือ groupId)
  const recipients = [
    userId  ? { id: userId,  label: 'owner' } : null,
    groupId ? { id: groupId, label: 'group' } : null,
  ].filter(Boolean);

  await Promise.all(recipients.map(r =>
    httpsPost(
      'api.line.me',
      '/v2/bot/message/push',
      headers,
      JSON.stringify({ to: r.id, messages: [{ type: 'text', text }] })
    ).then(() => console.log(`LINE push OK → ${r.label} (${r.id.slice(0,8)}...)`))
     .catch(e  => console.error(`LINE push FAILED → ${r.label}:`, e.message))
  ));
}

// ── Push a friendly confirmation to the CUSTOMER's own LINE (จองผ่านไลน์) ──
async function sendCustomerLine(formData, seqNo) {
  const f = formData || {};
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = f.lineUserId;
  if (!token || !userId) { console.log('Customer LINE skipped: no token/userId'); return; }
  const pax = [];
  if (Number(f.adults))   pax.push(`ผู้ใหญ่ ${f.adults}`);
  if (Number(f.children)) pax.push(`เด็ก ${f.children}`);
  if (Number(f.infants))  pax.push(`ทารก ${f.infants}`);
  const text = [
    '✅ รับการจองของคุณเรียบร้อยแล้วครับ!',
    seqNo ? `เลขที่จอง: ${seqNo}` : null,
    '━━━━━━━━━━━━━━━━━━',
    f.tourName ? `🎫 ${f.tourName}` : null,
    f.tourCode ? `รหัส: ${f.tourCode}` : null,
    f.depDate  ? `📅 เดินทาง: ${f.depDate}${f.retDate ? ` - ${f.retDate}` : ''}` : null,
    pax.length ? `👥 ${pax.join(' · ')}` : null,
    '━━━━━━━━━━━━━━━━━━',
    'ทีมงานได้รับข้อมูลแล้ว จะติดต่อกลับเพื่อยืนยันรายละเอียดและการชำระเงินโดยเร็วที่สุดครับ',
    'ขอบคุณที่ใช้บริการ WeCraft Travel 🙏',
  ].filter(Boolean).join('\n');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  await httpsPost('api.line.me', '/v2/bot/message/push', headers,
    JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }))
    .then(() => console.log(`Customer LINE OK → ${userId.slice(0, 8)}...`))
    .catch(e  => console.error('Customer LINE FAILED:', e.message));
}

// ── บันทึกการจอง (จอยทัวร์/โรงแรม) ลง Supabase (ให้โผล่ในหลังบ้าน AdminPanel) ──
const BOOKING_TYPES = ['join-tour', 'hotel'];
async function insertBookingRow(formData, seqNo) {
  const f = formData || {};
  if (!BOOKING_TYPES.includes(f._type)) return;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) { console.log('Supabase booking skipped: no config'); return; }
  const channel = f.lineUserId ? 'LINE' : 'เว็บ';
  const num = (...v) => v.reduce((s, x) => s + (Number(x) || 0), 0);

  let title, tag, tourId, travelers, departure;
  if (f._type === 'hotel') {
    tag = 'จองโรงแรม';
    title = `🏨 ${f.destination || 'โรงแรม'}${f.hotelName ? ' · ' + f.hotelName : ''}${f.checkIn ? ` (${f.checkIn}${f.checkOut ? '→' + f.checkOut : ''})` : ''}`;
    tourId = '';
    travelers = num(f.adults, f.children) || 1;
    departure = f.checkIn || '';
  } else { // join-tour
    tag = 'จอยทัวร์';
    title = f.tourName || 'จอยทัวร์';
    tourId = f.tourCode || '';
    travelers = Number(f.totalPax) || num(f.adults, f.children, f.infants) || 1;
    departure = f.depDate || '';
  }

  const row = {
    name:         f.fullName || '',
    email:        f.email || '',
    phone:        f.phone || '',
    tour_id:      tourId,
    tour_name:    { th: title, en: title },
    tier:         `${tag} · ${channel}${seqNo ? ' · ' + seqNo : ''}`,
    travelers,
    departure_id: departure,
    total_price:  0,
    status:       'pending',
    date:         departure,
  };
  const r = await fetch(`${url}/rest/v1/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 160)}`);
}

// ── Send Email ─────────────────────────────────────────────────
async function sendEmail(subject, html, seqNo, sheetUrl) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) { console.log('Email skipped: no credentials'); return; }

  // Inject seqNo banner at top of email HTML
  const seqBanner = seqNo
    ? `<div style="background:#1a1a2e;color:#FFD700;text-align:center;padding:10px 16px;font-size:15px;font-weight:bold;letter-spacing:1px;border-radius:8px 8px 0 0;">
        🔢 หมายเลขอ้างอิง &nbsp;<span style="font-size:20px;color:#fff;">${seqNo}</span>
       </div>`
    : '';
  const sheetFooter = sheetUrl
    ? `<div style="text-align:center;padding:14px;background:#f0f4ff;border-top:1px solid #dde6ff;margin-top:8px;border-radius:0 0 8px 8px;">
        <a href="${sheetUrl}" target="_blank"
           style="display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:14px;font-weight:700;">
          📊 เปิด Google Sheet
        </a>
       </div>`
    : '';
  const finalHtml = seqBanner + html + sheetFooter;
  const finalSubject = seqNo ? `[${seqNo}] ${subject}` : subject;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from: `"WeCraft Travel" <${user}>`,
    to: 'wecraftabroad51@gmail.com, wecraft.sale@gmail.com',
    subject: finalSubject,
    html: finalHtml,
  });
  console.log('Email sent:', info.messageId);
}

// ── Send Customer Confirmation Email ──────────────────────────
async function sendCustomerConfirmation(customerEmail, seqNo, formData) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) { console.log('Customer email skipped: no credentials'); return; }

  const f = formData || {};
  const seqDisplay = seqNo
    ? `<div style="background:#fff8f0;border:2px solid #e65c00;border-radius:8px;padding:12px 20px;margin:16px 0;text-align:center;">
        <div style="font-size:11px;color:#888;margin-bottom:4px;letter-spacing:1px;">หมายเลขอ้างอิง</div>
        <div style="font-size:22px;font-weight:900;color:#e65c00;letter-spacing:2px;">${seqNo}</div>
       </div>`
    : '';

  // Build details table based on type
  let detailRows = '';
  if (f._type === 'ticket') {
    const airlineMap = { full: 'Full Service', low: 'Low Cost', other: f.airlineOther || 'อื่นๆ' };
    const seatMap    = { economy: 'Economy', business: 'Business', first: 'First Class', flatbed: 'Flatbed' };
    const rows = [
      ['ชื่อผู้โดยสาร',  f.fullName],
      ['เลขพาสปอร์ต',    f.passportNo || '-'],
      ['วันหมดอายุ',      f.passportExpiry || '-'],
      ['วันเดินทางไป',    f.outboundDate],
      ['ช่วงเวลา (ไป)',   f.outboundTime || '-'],
      f.returnDate ? ['วันเดินทางกลับ', f.returnDate]  : null,
      f.returnTime ? ['ช่วงเวลา (กลับ)', f.returnTime] : null,
      ['สายการบิน',       airlineMap[f.airlineType] || f.airlineType || '-'],
      ['ชั้นที่นั่ง',      seatMap[f.seatClass] || f.seatClass || '-'],
      ['จำนวนผู้โดยสาร',  `ผู้ใหญ่ ${f.adults||0} / เด็ก ${f.children||0} / ทารก ${f.infants||0}`],
      f.note ? ['หมายเหตุ', f.note] : null,
    ].filter(Boolean);
    detailRows = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 14px;color:#888;width:140px;vertical-align:top;font-size:13px;">${k}</td>
           <td style="padding:8px 14px;color:#333;font-weight:600;font-size:13px;">${v}</td></tr>`
    ).join('');

  } else if (f._type === 'car-rental') {
    const rows = [
      ['ชื่อผู้เช่า',       f.fullName],
      ['โทรศัพท์',          f.phone],
      ['ประเภทรถเช่า',       f.rentalLabel || f.rentalType || '-'],
      ['วันรับรถ',           f.pickupDate],
      f.returnDate ? ['วันคืนรถ', f.returnDate] : null,
      ['สถานที่รับรถ',       f.pickupLocation],
      ['ประเภทรถ',           f.carLabel || f.carType || '-'],
      ['จำนวนผู้โดยสาร',    `${f.passengers} คน`],
      f.note ? ['หมายเหตุ', f.note] : null,
    ].filter(Boolean);
    detailRows = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 14px;color:#888;width:140px;vertical-align:top;font-size:13px;">${k}</td>
           <td style="padding:8px 14px;color:#333;font-weight:600;font-size:13px;">${v}</td></tr>`
    ).join('');

  } else if (f._type === 'hotel') {
    const rows = [
      ['เมือง/ปลายทาง',   f.destination || '-'],
      f.hotelName ? ['โรงแรมที่สนใจ', f.hotelName] : null,
      ['เช็คอิน',          f.checkIn  || '-'],
      ['เช็คเอาท์',        f.checkOut || '-'],
      f.nights ? ['จำนวนคืน', `${f.nights} คืน`] : null,
      ['จำนวนห้อง',        `${f.rooms || 1} ห้อง`],
      ['ประเภทห้อง',       f.roomType || '-'],
      ['ผู้เข้าพัก',       `ผู้ใหญ่ ${f.adults||0} / เด็ก ${f.children||0}`],
      f.stars  ? ['ระดับโรงแรม', f.stars]  : null,
      f.budget ? ['งบประมาณ/คืน', f.budget] : null,
      ['ชื่อผู้ติดต่อ',    f.fullName],
      ['โทรศัพท์',         f.phone],
      f.note ? ['หมายเหตุ', f.note] : null,
    ].filter(Boolean);
    detailRows = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 14px;color:#888;width:140px;vertical-align:top;font-size:13px;">${k}</td>
           <td style="padding:8px 14px;color:#333;font-weight:600;font-size:13px;">${v}</td></tr>`
    ).join('');

  } else if (f._type === 'join-tour') {
    const rows = [
      ['รหัสทัวร์',          f.tourCode || '-'],
      ['โปรแกรมทัวร์',       f.tourName || '-'],
      ['วันเดินทางไป',       f.depDate  || '-'],
      f.retDate  ? ['วันเดินทางกลับ', f.retDate]  : null,
      ['ผู้ใหญ่',            `${f.adults||0} คน`],
      ['เด็ก',               `${f.children||0} คน`],
      ['ทารก',               `${f.infants||0} คน`],
      ['รวมผู้เดินทาง',      `${f.totalPax||0} คน`],
      ['ชื่อผู้ติดต่อ',      f.fullName],
      ['โทรศัพท์',           f.phone],
      f.passportNo ? ['เลขพาสปอร์ต', f.passportNo] : null,
      f.note ? ['หมายเหตุ', f.note] : null,
    ].filter(Boolean);
    detailRows = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 14px;color:#888;width:140px;vertical-align:top;font-size:13px;">${k}</td>
           <td style="padding:8px 14px;color:#333;font-weight:600;font-size:13px;">${v}</td></tr>`
    ).join('');

  } else if (f._type === 'group-quote') {
    const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
      ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');
    const rows = [
      ['ชื่อผู้ติดต่อ',      `${f.firstName || ''} ${f.lastName || ''}`.trim()],
      f.company    ? ['บริษัท/หน่วยงาน',     f.company]       : null,
      f.pax        ? ['จำนวนผู้เดินทาง',     `${f.pax} คน`]   : null,
      ['โทรศัพท์',            f.phone],
      f.lineId     ? ['LINE ID',              f.lineId]         : null,
      ['ปลายทาง',             f.destination],
      ['วันเดินทาง',          f.travelDate],
      ['ระยะเวลา',            f.duration],
      ['รูปแบบทัวร์',         tourTypeLabel],
      ['โรงแรม',              f.hotel],
      f.airline    ? ['สายการบิน',            f.airline]        : null,
      f.budget     ? ['งบประมาณ/ท่าน',        `฿${f.budget}`]   : null,
      f.extraInfo  ? ['ข้อมูลเพิ่มเติม',      f.extraInfo]      : null,
    ].filter(Boolean);
    detailRows = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 14px;color:#888;width:140px;vertical-align:top;font-size:13px;">${k}</td>
           <td style="padding:8px 14px;color:#333;font-weight:600;font-size:13px;">${v}</td></tr>`
    ).join('');
  }

  const detailSection = detailRows ? `
    <div style="margin-top:20px;text-align:left;">
      <div style="font-size:13px;font-weight:700;color:#555;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #eee;">
        📋 รายละเอียดคำขอของคุณ
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>
    </div>` : '';

  const isGroupQuote = f._type === 'group-quote';
  const headerColor  = isGroupQuote        ? 'linear-gradient(135deg,#e65c00,#ff8c00)'
                     : f._type === 'join-tour' ? 'linear-gradient(135deg,#0d7c5f,#1a5276)'
                     : 'linear-gradient(135deg,#1a5276,#1a8a6e)';
  const headerTitle  = isGroupQuote        ? '📋 ได้รับคำขอราคากรุ๊ปเหมาแล้ว!'
                     : f._type === 'ticket'     ? '🎫 ได้รับคำขอจองตั๋วแล้ว!'
                     : f._type === 'car-rental' ? '🚗 ได้รับคำขอเช่ารถแล้ว!'
                     : f._type === 'join-tour'  ? '🌏 ได้รับคำขอจองจอยทัวร์แล้ว!'
                     : f._type === 'hotel'      ? '🏨 ได้รับคำขอจองโรงแรมแล้ว!'
                     : '✅ ได้รับคำขอของคุณแล้ว!';

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:580px;margin:0 auto;background:#f7f7f7;padding:20px;">
      <div style="background:${headerColor};color:#fff;padding:28px 24px;border-radius:10px 10px 0 0;text-align:center;">
        <img src="https://www.wecraft-travel.com/logo.png" alt="WeCraft Travel"
             style="width:56px;height:56px;object-fit:contain;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
        <h2 style="margin:0;font-size:20px;font-weight:900;">WeCraft Travel</h2>
        <p style="margin:6px 0 0;opacity:.9;font-size:12px;letter-spacing:1px;">WE CRAFT TRAVEL · WE CRAFT HAPPINESS</p>
      </div>

      <div style="background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 10px 10px;padding:28px 24px;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:44px;margin-bottom:10px;">✅</div>
          <h3 style="margin:0 0 8px;font-size:19px;color:#222;font-weight:800;">${headerTitle}</h3>
          <p style="color:#555;font-size:14px;line-height:1.75;margin:0;">
            ขอบคุณที่ไว้วางใจ <strong>WeCraft Travel</strong><br/>
            ทีมงานจะติดต่อกลับภายใน <strong style="color:#e65c00;">24 ชั่วโมง</strong> ในวันทำการ (จันทร์–เสาร์)
          </p>
        </div>

        ${seqDisplay}
        ${detailSection}

        <div style="margin-top:24px;padding:16px;background:#f0fff4;border-radius:8px;border:1px solid #c6f6d5;text-align:center;">
          <div style="font-size:13px;color:#276749;font-weight:700;margin-bottom:8px;">📞 ติดต่อเราได้ที่</div>
          <a href="tel:0618686889" style="display:inline-block;color:#276749;text-decoration:none;font-size:14px;font-weight:700;margin-right:12px;">
            ☎️ 061-868-6889
          </a>
          <a href="https://line.me/R/ti/p/@wecrafttravel" style="display:inline-block;color:#06c755;text-decoration:none;font-size:14px;font-weight:700;">
            💚 LINE: @wecrafttravel
          </a>
          <div style="font-size:11px;color:#888;margin-top:6px;">จันทร์–เสาร์ 09:00–18:00 น.</div>
        </div>

        <p style="color:#bbb;font-size:11px;text-align:center;margin-top:20px;margin-bottom:0;">
          อีเมลนี้ส่งโดยอัตโนมัติจาก wecraft-travel.com — กรุณาอย่าตอบกลับอีเมลนี้
        </p>
      </div>
    </div>`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from: `"WeCraft Travel" <${user}>`,
    to: customerEmail,
    subject: seqNo ? `[${seqNo}] WeCraft Travel — ได้รับคำขอของคุณแล้ว` : 'WeCraft Travel — ได้รับคำขอของคุณแล้ว',
    html,
  });
  console.log('Customer confirmation email sent:', info.messageId);
}

// ── Append row to Google Sheet ────────────────────────────────
async function appendToSheet(formData, seqNo, sheets, sheetId, sheetName) {
  const f = formData;
  const now = new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  let row;

  if (f._type === 'ticket') {
    const airlineMap = { full: 'Full Service', low: 'Low Cost', other: f.airlineOther || 'อื่นๆ' };
    const seatMap = { economy: 'Economy', business: 'Business', first: 'First Class', flatbed: 'Flatbed' };
    row = [
      seqNo,
      now,
      f.fullName        || '',
      f.passportNo      || '',
      f.passportExpiry  || '',
      f.outboundDate    || '',
      f.outboundTime    || '',
      f.returnDate      || '',
      f.returnTime      || '',
      airlineMap[f.airlineType] || f.airlineType || '',
      seatMap[f.seatClass] || f.seatClass || '',
      f.adults          || 0,
      f.children        || 0,
      f.infants         || 0,
      f.totalPax        || (Number(f.adults||0) + Number(f.children||0) + Number(f.infants||0)),
      f.note            || '',
      (f.driveFiles || []).map(d => d.url).join('\n') || '',
    ];

  } else if (f._type === 'car-rental') {
    row = [
      seqNo,
      now,
      f.fullName        || '',
      f.phone           || '',
      f.email           || '',
      f.rentalLabel || f.rentalType || '',
      f.pickupDate      || '',
      f.returnDate      || '',
      f.pickupLocation  || '',
      f.carLabel || f.carType || '',
      f.passengers      || '',
      f.note            || '',
      (f.driveFiles || []).map(d => d.url).join('\n') || '',
    ];

  } else if (f._type === 'hotel') {
    row = [
      seqNo,
      now,
      f.fullName    || '',
      f.phone       || '',
      f.email       || '',
      f.destination || '',
      f.hotelName   || '',
      f.checkIn     || '',
      f.checkOut    || '',
      f.nights      || '',
      f.rooms       || '',
      f.roomType    || '',
      f.adults      || 0,
      f.children    || 0,
      f.stars       || '',
      f.budget      || '',
      f.note        || '',
      (f.driveFiles || []).map(d => d.url).join('\n') || '',
    ];

  } else if (f._type === 'join-tour') {
    row = [
      seqNo,
      now,
      f.fullName       || '',
      f.phone          || '',
      f.email          || '',
      f.tourCode       || '',
      f.tourName       || '',
      f.depDate        || '',
      f.retDate        || '',
      f.adults         || 0,
      f.children       || 0,
      f.infants        || 0,
      f.totalPax       || (Number(f.adults||0) + Number(f.children||0) + Number(f.infants||0)),
      f.passportNo     || '',
      f.passportExpiry || '',
      f.note           || '',
      (f.driveFiles || []).map(d => d.url).join('\n') || '',
    ];

  } else {
    // Group quote (default)
    const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
      ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');
    row = [
      seqNo,
      now,
      `${f.firstName} ${f.lastName}`,
      f.company    || '',
      f.phone      || '',
      f.lineId     || '',
      f.email      || '',
      f.emailAlt   || '',
      f.destination|| '',
      f.pax        || '',
      f.travelDate || '',
      f.duration   || '',
      tourTypeLabel,
      f.hotel      || '',
      f.airline    || '',
      f.budget     || '',
      f.extraInfo  || '',
    ];
  }

  const range = sheetName ? `${sheetName}!A1` : 'A1';
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  console.log(`Google Sheet row appended OK → ${sheetName || 'Sheet1'}`);
}

// ── Handler ────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subject, html, formData, customerEmail } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'missing fields' });

  const results = {};

  // ── Generate seqNo first (requires Sheet read) ────────────────
  let seqNo = null;
  let sheetsClient = null;
  const sheetId  = process.env.GOOGLE_SHEET_ID;
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  const sheetName = formData ? sheetNameFor(formData._type) : null;

  if (formData && sheetId && credJson) {
    try {
      const credentials = JSON.parse(credJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheetsClient = google.sheets({ version: 'v4', auth });
      await ensureSheet(sheetsClient, sheetId, sheetName); // สร้างชีตให้ถ้ายังไม่มี
      // ถ้า client ส่ง seqNo มาแล้ว (gen-seqno ทำไปก่อน) ให้ใช้เลย
      if (formData._seqNo) {
        seqNo = formData._seqNo;
        console.log('SeqNo from client:', seqNo, '| worksheet:', sheetName);
      } else {
        seqNo = await generateSeqNo(sheetsClient, sheetId, sheetName, formData._type);
        console.log('SeqNo generated:', seqNo, '| worksheet:', sheetName);
      }
    } catch (e) {
      console.error('SeqNo generation failed:', e.message);
    }
  }

  // ── Build Google Sheet URL ────────────────────────────────────
  const sheetUrl = sheetId
    ? `https://docs.google.com/spreadsheets/d/${sheetId}`
    : null;

  // ── Run email + LINE + Google Sheet in parallel ───────────────
  await Promise.allSettled([
    sendEmail(subject, html, seqNo, sheetUrl)
      .then(() => { results.email = 'ok'; })
      .catch(e => { results.email = e.message; console.error('Email:', e.message); }),

    formData
      ? sendLine(formData, seqNo, sheetUrl)
          .then(() => { results.line = 'ok'; })
          .catch(e => { results.line = e.message; console.error('LINE:', e.message); })
      : Promise.resolve(),

    (formData && sheetsClient && sheetId)
      ? appendToSheet(formData, seqNo, sheetsClient, sheetId, sheetName)
          .then(() => { results.sheet = 'ok'; })
          .catch(e => { results.sheet = e.message; console.error('Sheet:', e.message); })
      : Promise.resolve(),

    customerEmail
      ? sendCustomerConfirmation(customerEmail, seqNo, formData)
          .then(() => { results.customerEmail = 'ok'; })
          .catch(e => { results.customerEmail = e.message; console.error('CustomerEmail:', e.message); })
      : Promise.resolve(),

    (formData && formData.lineUserId)
      ? sendCustomerLine(formData, seqNo)
          .then(() => { results.customerLine = 'ok'; })
          .catch(e => { results.customerLine = e.message; console.error('CustomerLine:', e.message); })
      : Promise.resolve(),

    (formData && BOOKING_TYPES.includes(formData._type))
      ? insertBookingRow(formData, seqNo)
          .then(() => { results.booking = 'ok'; })
          .catch(e => { results.booking = e.message; console.error('Booking insert:', e.message); })
      : Promise.resolve(),
  ]);

  return res.status(200).json({ ok: true, results, seqNo });
};

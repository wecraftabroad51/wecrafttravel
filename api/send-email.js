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
  return 'กรุ๊ปเหมา';
}

// ── SeqNo prefix per type ──────────────────────────────────────
function seqPrefixFor(type) {
  if (type === 'ticket')     return 'TK';
  if (type === 'car-rental') return 'RC';
  return 'GI';
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

// ── Send LINE push (plain text) ────────────────────────────────
async function sendLine(formData, seqNo, sheetUrl) {
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_OWNER_USER_ID;
  if (!token || !userId) { console.log('LINE skipped: env vars not set'); return; }

  const f = formData;
  let text;

  if (f._type === 'ticket') {
    const airlineMap = { full: 'Full Service', low: 'Low Cost', other: f.airlineOther || 'อื่นๆ' };
    const seatMap = { economy: 'Economy', business: 'Business', first: 'First Class', flatbed: 'Flatbed' };
    text = [
      '🎫✈️ มาแล้วๆ!! คำขอจองตั๋ว!!',
      seqNo ? `🔢 ลำดับที่: ${seqNo}` : null,
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
      seqNo ? `🔢 ลำดับที่: ${seqNo}` : null,
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
      '━━━━━━━━━━━━━━━━━━',
      '⚡ รีบตอบกลับภายใน 24 ชั่วโมง!',
    ].filter(Boolean).join('\n');

  } else {
    // Group quote (default)
    const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
      ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');
    text = [
      '🎉🎊 มาแล้วๆๆ!!! งานเหมา มาแล้ว!! ✈️',
      seqNo ? `🔢 ลำดับที่: ${seqNo}` : null,
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

  const body = JSON.stringify({
    to: userId,
    messages: [{ type: 'text', text }],
  });

  await httpsPost(
    'api.line.me',
    '/v2/bot/message/push',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body
  );
  console.log('LINE text sent OK');
}

// ── Send Email ─────────────────────────────────────────────────
async function sendEmail(subject, html, seqNo, sheetUrl) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) { console.log('Email skipped: no credentials'); return; }

  // Inject seqNo banner at top of email HTML
  const seqBanner = seqNo
    ? `<div style="background:#1a1a2e;color:#FFD700;text-align:center;padding:10px 16px;font-size:15px;font-weight:bold;letter-spacing:1px;border-radius:8px 8px 0 0;">
        🔢 ลำดับที่ &nbsp;<span style="font-size:20px;color:#fff;">${seqNo}</span>
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

  const { subject, html, formData } = req.body || {};
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
      seqNo = await generateSeqNo(sheetsClient, sheetId, sheetName, formData._type);
      console.log('SeqNo generated:', seqNo, '| worksheet:', sheetName);
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
  ]);

  return res.status(200).json({ ok: true, results, seqNo });
};

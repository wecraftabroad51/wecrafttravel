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

// ── Generate sequence number: YYMMNN (พ.ศ.) ──────────────────
async function generateSeqNo(sheets, sheetId) {
  const nowDate     = new Date();
  const buddhistYear = (nowDate.getFullYear() + 543).toString().slice(-2); // e.g. "69"
  const month        = String(nowDate.getMonth() + 1).padStart(2, '0');    // e.g. "05"
  const prefix       = `${buddhistYear}${month}`;                          // e.g. "6905"

  const meta = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:A',
  });
  const allValues = meta.data.values || [];
  const countThisMonth = allValues.filter(r => r[0] && String(r[0]).startsWith(prefix)).length;
  const runNo = String(countThisMonth + 1).padStart(2, '0');
  return `${prefix}${runNo}`; // e.g. "690501"
}

// ── Send LINE push (plain text) ────────────────────────────────
async function sendLine(formData, seqNo) {
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_OWNER_USER_ID;
  if (!token || !userId) { console.log('LINE skipped: env vars not set'); return; }

  const f = formData;
  const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
    ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');

  const text = [
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
async function sendEmail(subject, html, seqNo) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) { console.log('Email skipped: no credentials'); return; }

  // Inject seqNo banner at top of email HTML
  const seqBanner = seqNo
    ? `<div style="background:#1a1a2e;color:#FFD700;text-align:center;padding:10px 16px;font-size:15px;font-weight:bold;letter-spacing:1px;border-radius:8px 8px 0 0;">
        🔢 ลำดับที่ &nbsp;<span style="font-size:20px;color:#fff;">${seqNo}</span>
       </div>`
    : '';
  const finalHtml = seqBanner + html;
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
async function appendToSheet(formData, seqNo, sheets, sheetId) {
  const f = formData;
  const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
    ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');

  const now = new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const row = [
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

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  console.log('Google Sheet row appended OK');
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

  if (formData && sheetId && credJson) {
    try {
      const credentials = JSON.parse(credJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheetsClient = google.sheets({ version: 'v4', auth });
      seqNo = await generateSeqNo(sheetsClient, sheetId);
      console.log('SeqNo generated:', seqNo);
    } catch (e) {
      console.error('SeqNo generation failed:', e.message);
    }
  }

  // ── Run email + LINE + Google Sheet in parallel ───────────────
  await Promise.allSettled([
    sendEmail(subject, html, seqNo)
      .then(() => { results.email = 'ok'; })
      .catch(e => { results.email = e.message; console.error('Email:', e.message); }),

    formData
      ? sendLine(formData, seqNo)
          .then(() => { results.line = 'ok'; })
          .catch(e => { results.line = e.message; console.error('LINE:', e.message); })
      : Promise.resolve(),

    (formData && sheetsClient && sheetId)
      ? appendToSheet(formData, seqNo, sheetsClient, sheetId)
          .then(() => { results.sheet = 'ok'; })
          .catch(e => { results.sheet = e.message; console.error('Sheet:', e.message); })
      : Promise.resolve(),
  ]);

  return res.status(200).json({ ok: true, results, seqNo });
};

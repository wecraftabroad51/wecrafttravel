const nodemailer = require('nodemailer');
const https      = require('https');

// ── Build LINE Flex Message ────────────────────────────────────
function buildFlexMessage(f) {
  const tourTypeLabel = (f.tourType === 'อื่นๆ' && f.tourTypeOther)
    ? `อื่นๆ: ${f.tourTypeOther}` : (f.tourType || '-');

  // colored row helper
  const row = (icon, label, value, valueColor) => value ? {
    type: 'box', layout: 'horizontal', spacing: 'sm',
    paddingTop: '5px', paddingBottom: '5px',
    contents: [
      { type: 'text', text: icon, size: 'sm', flex: 0, margin: 'none' },
      { type: 'text', text: label, size: 'xs', color: '#777777', flex: 3, margin: 'sm', wrap: true },
      { type: 'text', text: String(value), size: 'xs', color: valueColor || '#222222', flex: 5, wrap: true, weight: 'bold' },
    ],
  } : null;

  // section header box
  const sectionHeader = (emoji, title, bg, textColor) => ({
    type: 'box', layout: 'horizontal', spacing: 'sm',
    backgroundColor: bg, cornerRadius: '8px',
    paddingAll: '10px', margin: 'md',
    contents: [
      { type: 'text', text: emoji, size: 'md', flex: 0 },
      { type: 'text', text: title, size: 'sm', weight: 'bold', color: textColor, margin: 'sm' },
    ],
  });

  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'short', timeStyle: 'short' });

  return {
    type: 'flex',
    altText: `🎉 มาแล้วๆๆ!! งานเหมา — ${f.firstName} ${f.lastName} ไป ${f.destination}`,
    contents: {
      type: 'bubble',
      size: 'mega',

      // ── HEADER ──────────────────────────────────────────────
      header: {
        type: 'box', layout: 'vertical',
        paddingAll: '0px',
        contents: [
          // Top band: yellow excitement
          {
            type: 'box', layout: 'vertical',
            backgroundColor: '#FFD700', paddingAll: '14px',
            contents: [
              {
                type: 'text',
                text: '🎉🎊  มาแล้วๆๆ!!!  🎊🎉',
                weight: 'bold', size: 'xl', color: '#7B3F00',
                align: 'center',
              },
              {
                type: 'text',
                text: '💼  งานเหมา มาแล้ว!!  ✈️',
                weight: 'bold', size: 'lg', color: '#c0392b',
                align: 'center', margin: 'xs',
              },
            ],
          },
          // Orange info band
          {
            type: 'box', layout: 'horizontal',
            backgroundColor: '#e65c00', paddingAll: '12px', spacing: 'md',
            contents: [
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: '📍 ปลายทาง', size: 'xxs', color: 'rgba(255,255,255,0.7)' },
                  { type: 'text', text: f.destination || '-', size: 'sm', weight: 'bold', color: '#ffffff', wrap: true },
                ],
              },
              { type: 'separator', color: 'rgba(255,255,255,0.3)' },
              {
                type: 'box', layout: 'vertical', flex: 1, paddingStart: 'md',
                contents: [
                  { type: 'text', text: '👥 จำนวน', size: 'xxs', color: 'rgba(255,255,255,0.7)' },
                  { type: 'text', text: f.pax ? `${f.pax} คน` : '-', size: 'sm', weight: 'bold', color: '#FFD700' },
                ],
              },
              { type: 'separator', color: 'rgba(255,255,255,0.3)' },
              {
                type: 'box', layout: 'vertical', flex: 1, paddingStart: 'md',
                contents: [
                  { type: 'text', text: '📅 วันเดินทาง', size: 'xxs', color: 'rgba(255,255,255,0.7)' },
                  { type: 'text', text: f.travelDate || '-', size: 'xs', weight: 'bold', color: '#ffffff', wrap: true },
                ],
              },
            ],
          },
        ],
      },

      // ── BODY ────────────────────────────────────────────────
      body: {
        type: 'box', layout: 'vertical', spacing: 'none',
        paddingAll: '14px', backgroundColor: '#fafafa',
        contents: [

          // ─ Contact section ─
          sectionHeader('👤', 'ข้อมูลผู้ติดต่อ', '#fff3e0', '#c0392b'),
          {
            type: 'box', layout: 'vertical',
            backgroundColor: '#ffffff', paddingAll: '10px', margin: 'sm',
            contents: [
              row('👤', 'ชื่อ-นามสกุล',    `${f.firstName} ${f.lastName}`, '#1a1a2e'),
              row('🏢', 'บริษัท/หน่วยงาน',  f.company,  '#444444'),
              row('📞', 'โทรศัพท์',         f.phone,    '#0066cc'),
              row('💚', 'LINE ID',          f.lineId,   '#06c755'),
              row('✉️', 'อีเมล',            f.email,    '#0066cc'),
              row('✉️', 'อีเมลสำรอง',       f.emailAlt, '#0066cc'),
            ].filter(Boolean),
          },

          // ─ Tour detail section ─
          sectionHeader('✈️', 'รายละเอียดทัวร์', '#e8f4fd', '#1a5276'),
          {
            type: 'box', layout: 'vertical',
            backgroundColor: '#ffffff', paddingAll: '10px', margin: 'sm',
            contents: [
              row('📍', 'ปลายทาง',           f.destination,               '#c0392b'),
              row('👥', 'จำนวนผู้เดินทาง',   f.pax ? `${f.pax} คน` : null,'#7d3c98'),
              row('📅', 'วันเดินทาง',         f.travelDate,                '#1a5276'),
              row('⏱️', 'ระยะเวลา',           f.duration,                  '#1a5276'),
              row('🎒', 'รูปแบบทัวร์',        tourTypeLabel,               '#117a65'),
              row('🏨', 'โรงแรม',             f.hotel,                     '#117a65'),
              row('✈️', 'สายการบิน',          f.airline,                   '#444444'),
              row('💰', 'งบประมาณ/ท่าน',     f.budget,                    '#c0392b'),
            ].filter(Boolean),
          },

          // ─ Extra info ─
          f.extraInfo ? {
            type: 'box', layout: 'vertical',
            backgroundColor: '#f0fff4', paddingAll: '10px', margin: 'md',
            contents: [
              { type: 'text', text: '💬  ข้อมูลเพิ่มเติม', size: 'xs', weight: 'bold', color: '#1e8449' },
              { type: 'text', text: f.extraInfo, size: 'xs', color: '#333333', wrap: true, margin: 'sm' },
            ],
          } : null,

          // ─ Timestamp ─
          {
            type: 'text', text: `🕐 รับฟอร์มเมื่อ ${now}`,
            size: 'xxs', color: '#aaaaaa', align: 'center', margin: 'lg',
          },
        ].filter(Boolean),
      },

      // ── FOOTER ──────────────────────────────────────────────
      footer: {
        type: 'box', layout: 'vertical',
        paddingAll: '0px', spacing: 'none',
        contents: [
          {
            type: 'box', layout: 'horizontal', spacing: 'none',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: '📞  โทรกลับเลย!', uri: `tel:${(f.phone||'').replace(/-/g,'')}` },
                style: 'primary', color: '#e65c00', flex: 1, height: 'md',
              },
              f.lineId ? {
                type: 'button',
                action: { type: 'uri', label: '💬  LINE ลูกค้า', uri: `https://line.me/R/ti/p/${f.lineId}` },
                style: 'primary', color: '#06c755', flex: 1, height: 'md',
              } : {
                type: 'button',
                action: { type: 'uri', label: '✉️  ส่งอีเมล', uri: `mailto:${f.email}` },
                style: 'primary', color: '#2980b9', flex: 1, height: 'md',
              },
            ],
          },
          {
            type: 'box', layout: 'vertical',
            backgroundColor: '#FFD700', paddingAll: '8px',
            contents: [{
              type: 'text',
              text: '⚡  รีบตอบกลับภายใน 24 ชั่วโมง!  ⚡',
              size: 'xs', weight: 'bold', color: '#7B3F00', align: 'center',
            }],
          },
        ],
      },
    },
  };
}

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

// ── Send LINE push ─────────────────────────────────────────────
async function sendLine(formData) {
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_OWNER_USER_ID;
  if (!token || !userId) { console.log('LINE skipped: env vars not set'); return; }

  const message = buildFlexMessage(formData);
  const body = JSON.stringify({ to: userId, messages: [message] });

  await httpsPost(
    'api.line.me',
    '/v2/bot/message/push',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body
  );
  console.log('LINE Flex sent OK');
}

// ── Send Email ─────────────────────────────────────────────────
async function sendEmail(subject, html) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) { console.log('Email skipped: no credentials'); return; }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from: `"WeCraft Travel" <${user}>`,
    to: 'wecraftabroad51@gmail.com, wecraft.sale@gmail.com',
    subject, html,
  });
  console.log('Email sent:', info.messageId);
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

  // Run email + LINE in parallel
  await Promise.allSettled([
    sendEmail(subject, html).then(() => { results.email = 'ok'; }).catch(e => { results.email = e.message; console.error('Email:', e.message); }),
    formData
      ? sendLine(formData).then(() => { results.line = 'ok'; }).catch(e => { results.line = e.message; console.error('LINE:', e.message); })
      : Promise.resolve(),
  ]);

  return res.status(200).json({ ok: true, results });
};

const nodemailer = require('nodemailer');

// ── Build LINE Flex Message ────────────────────────────────────
function buildFlexMessage(f) {
  const row = (label, value, color) => ({
    type: 'box', layout: 'horizontal', spacing: 'sm',
    paddingTop: '6px', paddingBottom: '6px',
    contents: [
      {
        type: 'text', text: label, size: 'xs', color: '#888888',
        flex: 3, wrap: true,
      },
      {
        type: 'text', text: value || '-', size: 'xs',
        color: color || '#333333', flex: 5, wrap: true, weight: 'bold',
      },
    ],
  });

  const divider = { type: 'separator', margin: 'sm', color: '#f0f0f0' };

  const tourTypeLabel = f.tourType === 'อื่นๆ' && f.tourTypeOther
    ? `อื่นๆ: ${f.tourTypeOther}` : f.tourType;

  return {
    type: 'flex',
    altText: `🔔 ขอราคากรุ๊ปเหมาใหม่ — ${f.firstName} ${f.lastName} (${f.destination})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical',
        backgroundColor: '#e65c00', paddingAll: '18px',
        contents: [
          {
            type: 'box', layout: 'horizontal', spacing: 'md',
            contents: [
              {
                type: 'box', layout: 'vertical', justifyContent: 'center',
                contents: [{
                  type: 'text', text: '✈',
                  size: '3xl', color: '#ffffff',
                }],
              },
              {
                type: 'box', layout: 'vertical',
                contents: [
                  { type: 'text', text: '🔔 ขอราคากรุ๊ปเหมาใหม่', weight: 'bold', size: 'md', color: '#ffffff' },
                  { type: 'text', text: 'WeCraft Travel', size: 'xs', color: 'rgba(255,255,255,0.75)', margin: 'xs' },
                ],
              },
            ],
          },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'none', paddingAll: '16px',
        contents: [
          // ─ ผู้ติดต่อ ─
          {
            type: 'text', text: '👤  ข้อมูลผู้ติดต่อ',
            size: 'sm', weight: 'bold', color: '#e65c00', margin: 'none',
          },
          divider,
          row('ชื่อ-นามสกุล', `${f.firstName} ${f.lastName}`, '#111111'),
          f.company   ? row('บริษัท/หน่วยงาน', f.company) : null,
          row('โทรศัพท์',  f.phone, '#0066cc'),
          f.lineId    ? row('LINE ID',          f.lineId,   '#06c755') : null,
          row('อีเมล',     f.email, '#0066cc'),
          f.emailAlt  ? row('อีเมลสำรอง',       f.emailAlt) : null,

          // ─ รายละเอียดทัวร์ ─
          { type: 'box', layout: 'vertical', margin: 'lg', contents: [] },
          {
            type: 'text', text: '📋  รายละเอียดทัวร์',
            size: 'sm', weight: 'bold', color: '#e65c00',
          },
          divider,
          row('ปลายทาง',      f.destination, '#111111'),
          f.pax       ? row('จำนวนผู้เดินทาง', `${f.pax} คน`) : null,
          row('วันเดินทาง',   f.travelDate),
          row('ระยะเวลา',     f.duration),
          row('รูปแบบทัวร์',  tourTypeLabel),
          row('โรงแรม',       f.hotel),
          f.airline   ? row('สายการบิน',       f.airline) : null,
          f.budget    ? row('งบ/ท่าน',         f.budget)  : null,
          f.extraInfo ? row('ข้อมูลเพิ่มเติม', f.extraInfo) : null,
        ].filter(Boolean),
      },
      footer: {
        type: 'box', layout: 'vertical',
        backgroundColor: '#fff8f2', paddingAll: '14px',
        contents: [
          {
            type: 'box', layout: 'horizontal', spacing: 'md',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: '📞 โทรกลับ', uri: `tel:${(f.phone||'').replace(/-/g,'')}` },
                style: 'primary', color: '#e65c00', flex: 1, height: 'sm',
              },
              f.lineId ? {
                type: 'button',
                action: { type: 'uri', label: '💬 LINE', uri: `https://line.me/R/ti/p/${f.lineId}` },
                style: 'secondary', flex: 1, height: 'sm',
              } : {
                type: 'button',
                action: { type: 'uri', label: '✉️ อีเมล', uri: `mailto:${f.email}` },
                style: 'secondary', flex: 1, height: 'sm',
              },
            ],
          },
          {
            type: 'text',
            text: `รับฟอร์มเมื่อ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
            size: 'xxs', color: '#aaaaaa', align: 'center', margin: 'md',
          },
        ],
      },
    },
  };
}

// ── Send LINE push ─────────────────────────────────────────────
async function sendLine(formData) {
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_OWNER_USER_ID;
  if (!token || !userId) { console.log('LINE skipped: env vars not set'); return; }

  const message = buildFlexMessage(formData);

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ to: userId, messages: [message] }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('LINE API: ' + err);
  }
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

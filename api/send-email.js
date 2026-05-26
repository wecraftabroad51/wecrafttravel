const nodemailer = require('nodemailer');

// ── LINE push message to owner ─────────────────────────────────
async function sendLine(text) {
  const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_OWNER_USER_ID;
  if (!token || !userId) {
    console.log('LINE skipped: env vars not set');
    return;
  }
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('LINE error:', err);
  } else {
    console.log('LINE sent OK');
  }
}

// ── Gmail SMTP ─────────────────────────────────────────────────
async function sendEmail(subject, html, gmailUser, gmailPass) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from: `"WeCraft Travel" <${gmailUser}>`,
    to: 'wecraftabroad51@gmail.com, wecraft.sale@gmail.com',
    subject,
    html,
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

  const { subject, html, lineText } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'missing fields' });

  const results = { email: null, line: null };

  // 1. Send Email
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;
  if (gmailUser && gmailPass) {
    try {
      await sendEmail(subject, html, gmailUser, gmailPass);
      results.email = 'ok';
    } catch (err) {
      console.error('Email error:', err.message);
      results.email = err.message;
    }
  } else {
    results.email = 'skipped (no credentials)';
  }

  // 2. Send LINE notification
  if (lineText) {
    try {
      await sendLine(lineText);
      results.line = 'ok';
    } catch (err) {
      console.error('LINE error:', err.message);
      results.line = err.message;
    }
  }

  return res.status(200).json({ ok: true, results });
};

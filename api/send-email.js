const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subject, html } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'missing subject or html' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;

  if (!user || !pass) {
    console.log('Email skipped: GMAIL_USER or GMAIL_APP_PASS not set');
    return res.status(200).json({ ok: true, note: 'email skipped (no credentials)' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: `"WeCraft Travel" <${user}>`,
      to: 'wecraftabroad51@gmail.com, wecraft.sale@gmail.com',
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return res.status(200).json({ ok: true, messageId: info.messageId });

  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

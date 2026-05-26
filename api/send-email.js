import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, html } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'missing fields' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;

  if (!user || !pass) {
    // env vars not set → return ok silently (data already saved to Supabase)
    return res.status(200).json({ ok: true, note: 'email skipped (no credentials)' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"WeCraft Travel" <${user}>`,
      to: 'wecraftabroad51@gmail.com, wecraft.sale@gmail.com',
      subject,
      html,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

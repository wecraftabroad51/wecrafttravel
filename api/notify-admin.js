// ── แจ้งเตือนเมื่อถูกเพิ่มเป็น Admin ──────────────────────────────
// POST { email, addedBy } → ส่งอีเมลบอกผู้ที่ถูกเพิ่ม
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { email, addedBy } = req.body || {};
  if (!email) return res.status(400).json({ error: 'ต้องระบุอีเมล' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) return res.status(503).json({ error: 'ระบบอีเมลยังไม่พร้อมใช้งาน' });

  const adminUrl = 'https://wecraft-travel.com/admin';
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"WeCraft Travel" <${user}>`,
      to: email,
      subject: '🔐 คุณได้รับสิทธิ์เข้าถึงระบบหลังบ้าน WeCraft Travel',
      html: `
        <div style="font-family:sans-serif;max-width:460px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="text-align:center;font-size:44px;margin-bottom:8px;">🔐</div>
          <h2 style="margin:0 0 6px;color:#0f3460;font-size:20px;text-align:center;">คุณได้รับสิทธิ์เป็นผู้ดูแลระบบ</h2>
          <p style="color:#888;font-size:13px;text-align:center;margin:0 0 24px;">WeCraft Travel · ระบบจัดการหลังบ้าน</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;">
            สวัสดีครับ<br>
            อีเมล <strong>${email}</strong> ของคุณได้รับสิทธิ์เข้าถึงระบบจัดการหลังบ้าน (Admin)
            ของ WeCraft Travel เรียบร้อยแล้ว${addedBy ? ` โดย ${addedBy}` : ''}
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${adminUrl}" style="display:inline-block;background:#0d7c5f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;">
              เข้าสู่ระบบด้วย Google →
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;line-height:1.7;">
            <strong>วิธีเข้าใช้งาน:</strong><br>
            1. เปิด <a href="${adminUrl}" style="color:#0d7c5f;">${adminUrl}</a><br>
            2. กด "เข้าสู่ระบบด้วย Google"<br>
            3. เลือกบัญชี Google ที่ตรงกับอีเมลนี้ (${email})
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0 14px;">
          <p style="color:#bbb;font-size:11px;margin:0;text-align:center;">
            หากคุณไม่ได้คาดหวังอีเมลนี้ กรุณาติดต่อผู้ดูแลระบบ · wecraft-travel.com
          </p>
        </div>`,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify-admin error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};

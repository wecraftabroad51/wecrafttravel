// ── OTP API: send + verify สำหรับ email และ SMS ─────────────────
// POST { action:'send',   type:'phone'|'email', target:'...' } → { token }
// POST { action:'verify', target:'...', otp:'123456', token:'...' } → { ok }
//
// Token = HMAC-signed base64 payload (otp|target|expiresAt) — ไม่ต้อง DB

const crypto     = require('crypto');
const https      = require('https');
const nodemailer = require('nodemailer');

const SECRET  = process.env.OTP_SECRET || 'wecraft-otp-default-2025';
const OTP_TTL = 5 * 60 * 1000; // 5 นาที

// ── Generate + sign ──────────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeToken(otp, target) {
  const exp     = Date.now() + OTP_TTL;
  const payload = `${otp}|${target}|${exp}`;
  const sig     = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 24);
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

function verifyToken(token, otp, target) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts   = decoded.split('|');
    if (parts.length !== 4) return { ok: false, reason: 'invalid' };
    const [sOtp, sTarget, sExp, sig] = parts;
    if (Date.now() > parseInt(sExp, 10))  return { ok: false, reason: 'expired' };
    if (sOtp    !== String(otp).trim())   return { ok: false, reason: 'wrong_otp' };
    if (sTarget !== String(target).trim())return { ok: false, reason: 'wrong_target' };
    const expectedSig = crypto.createHmac('sha256', SECRET)
      .update(`${sOtp}|${sTarget}|${sExp}`).digest('hex').slice(0, 24);
    if (sig !== expectedSig) return { ok: false, reason: 'tampered' };
    return { ok: true };
  } catch { return { ok: false, reason: 'error' }; }
}

// ── Normalize Thai phone (keep 10-digit local format) ────────────
function normalizePhone(phone) {
  const d = String(phone).replace(/\D/g, '');
  // แปลง 66XXXXXXXXX → 0XXXXXXXXX
  if (d.startsWith('66') && d.length === 11) return '0' + d.slice(2);
  if (d.startsWith('0')  && d.length === 10) return d;
  return null;
}

// ── Send SMS via SMSMKT ──────────────────────────────────────────
// env vars: SMSMKT_API_KEY, SMSMKT_SECRET_KEY, SMSMKT_SENDER (optional, default "WeCraft")
async function sendSMS(phone, otp) {
  const apiKey    = process.env.SMSMKT_API_KEY;
  const secretKey = process.env.SMSMKT_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error('SMS_NOT_CONFIGURED');

  const to     = normalizePhone(phone);
  if (!to) throw new Error('รูปแบบเบอร์โทรไม่ถูกต้อง (ต้องเป็น 10 หลัก ขึ้นต้นด้วย 0)');

  const sender  = process.env.SMSMKT_SENDER || 'WeCraft';
  const message = `WeCraft Travel รหัส OTP: ${otp} (หมดอายุใน 5 นาที อย่าแชร์รหัสนี้)`;

  // api_key + secret_key อยู่ใน Header, phone field (ไม่ใช่ to)
  const postData = JSON.stringify({
    phone:   to,
    message: message,
    sender:  sender,
  });

  console.log('[SMSMKT] Sending to:', to, '| sender:', sender);
  console.log('[SMSMKT] Request body:', postData);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'portal-otp.smsmkt.com',
      path:     '/api/send-message',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'api_key':        apiKey,
        'secret_key':     secretKey,
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        console.log('[SMSMKT] HTTP status:', res.statusCode);
        console.log('[SMSMKT] Response body:', data);
        try {
          const json = JSON.parse(data);
          // SMSMKT ตอบกลับ: { code: "000", detail: "success" } = สำเร็จ
          // หรือ { result: true/false } ขึ้นกับ API version
          const code = json.code ?? json.result ?? json.status;
          const isOk = code === '000' || code === true || code === 0 || code === 1 || code === '1';
          if (res.statusCode >= 400) {
            reject(new Error(`SMSMKT HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          } else if (!isOk && code !== undefined) {
            reject(new Error(`SMSMKT ส่งไม่สำเร็จ: ${json.detail || json.message || data.slice(0, 100)}`));
          } else {
            resolve(true);
          }
        } catch {
          if (res.statusCode >= 400) reject(new Error(`SMSMKT HTTP Error ${res.statusCode}: ${data.slice(0,100)}`));
          else resolve(true);
        }
      });
    });
    req.on('error', (e) => {
      console.error('[SMSMKT] Request error:', e.message);
      reject(e);
    });
    // กัน SMSMKT ค้าง → ไม่ให้คำขอแขวนจน function timeout (ครั้งแรกเหมือนไม่ทำงาน)
    req.setTimeout(15000, () => req.destroy(new Error('SMSMKT ตอบช้าเกินไป กรุณาลองใหม่')));
    req.write(postData);
    req.end();
  });
}

// ── Send Email OTP via Gmail ─────────────────────────────────────
async function sendEmailOTP(email, otp) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) throw new Error('EMAIL_NOT_CONFIGURED');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"WeCraft Travel" <${user}>`,
    to: email,
    subject: `[OTP] รหัสยืนยัน WeCraft Travel: ${otp}`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;text-align:center;">
        <div style="font-size:44px;margin-bottom:12px;">🔐</div>
        <h2 style="margin:0 0 6px;color:#1a5276;font-size:20px;">รหัสยืนยัน OTP</h2>
        <p style="color:#888;font-size:13px;margin:0 0 24px;">WeCraft Travel · การจองจอยทัวร์</p>
        <div style="background:#f0f9ff;border:2px solid #38bdf8;border-radius:10px;padding:24px 16px;margin:0 0 20px;">
          <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#0f3460;font-family:monospace;">${otp}</div>
        </div>
        <p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 20px;">
          รหัสนี้หมดอายุใน <strong>5 นาที</strong><br>
          <span style="color:#dc2626;">อย่าแชร์รหัสนี้กับผู้อื่น</span>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px;">
        <p style="color:#bbb;font-size:11px;margin:0;">ส่งโดยอัตโนมัติจาก wecraft-travel.com</p>
      </div>`,
  });
}

// ── Handler ──────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { action, type, target, token, otp } = req.body || {};

  // ── ส่ง OTP ─────────────────────────────────────────────────────
  if (action === 'send') {
    if (!type || !target) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });

    const code = generateOTP();
    const tok  = makeToken(code, target.trim());

    try {
      if (type === 'phone') {
        await sendSMS(target.trim(), code);
      } else if (type === 'email') {
        await sendEmailOTP(target.trim(), code);
      } else {
        return res.status(400).json({ error: 'type ไม่ถูกต้อง' });
      }
      console.log(`OTP sent [${type}] to ${target.slice(0, 4)}***`);
      return res.status(200).json({ ok: true, token: tok });
    } catch (e) {
      console.error('OTP send error:', e.message);
      if (e.message === 'SMS_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'ระบบ SMS ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
      }
      return res.status(500).json({ error: e.message });
    }
  }

  // ── ยืนยัน OTP ──────────────────────────────────────────────────
  if (action === 'verify') {
    if (!token || !otp || !target) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    const result = verifyToken(token, otp, target);
    if (result.ok) return res.status(200).json({ ok: true });
    const msgs = {
      expired:      'OTP หมดอายุแล้ว กรุณากด "ขอรหัสใหม่"',
      wrong_otp:    'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
      wrong_target: 'OTP ไม่ตรงกับเบอร์/อีเมลที่ขอไว้',
      tampered:     'Token ไม่ถูกต้อง กรุณาขอ OTP ใหม่',
    };
    return res.status(400).json({ error: msgs[result.reason] || 'OTP ไม่ถูกต้อง' });
  }

  return res.status(400).json({ error: 'action ไม่ถูกต้อง' });
};

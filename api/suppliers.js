// ── Supplier API Proxy (generic, multi-supplier) ──────────────────
// GET /api/suppliers?supplier=probooking          → รายการทัวร์
// GET /api/suppliers?supplier=probooking&id=68     → รายละเอียดทัวร์
//
// รองรับซัพพลายเออร์หลายเจ้า — บางเจ้า public, บางเจ้าต้องใช้ token

const https = require('https');

// ── Supplier config (whitelist กัน SSRF) ─────────────────────────
// base   = path prefix ของ API
// auth   = (optional) { header, tokenEnv } สำหรับเจ้าที่ต้อง token
const SUPPLIERS = {
  probooking:  { host: 'api.probooking.co.th',    base: '/v1' },
  wondergroup: { host: 'api.wondergrouptour.com', base: '/v1' },
  gs25tour:    { host: 'api.gs25tour.com',         base: '/v1' },
  zego:        { host: 'www.zegoapi.com', base: '/v1.5', auth: { header: 'auth-token', tokenEnv: 'ZEGO_API_TOKEN' } },
};

function supFetch(cfg, path) {
  return new Promise((resolve, reject) => {
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (cfg.auth) {
      const token = process.env[cfg.auth.tokenEnv];
      if (!token) return reject(new Error(`ยังไม่ได้ตั้งค่า ${cfg.auth.tokenEnv}`));
      headers[cfg.auth.header] = token;
    }
    const req = https.request({
      hostname: cfg.host,
      path: `${cfg.base}${path}`,
      method: 'GET',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 160)}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from supplier: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  const { supplier, id } = req.query || {};
  const cfg = SUPPLIERS[supplier];
  if (!cfg) return res.status(400).json({ error: 'ไม่รู้จักซัพพลายเออร์: ' + supplier });

  try {
    const path = id ? `/programtours/${encodeURIComponent(id)}` : '/programtours';
    const data = await supFetch(cfg, path);
    return res.status(200).json(data);
  } catch (e) {
    console.error(`[Supplier proxy: ${supplier}]`, e.message);
    return res.status(502).json({ error: `ไม่สามารถดึงข้อมูลจาก ${supplier} ได้: ${e.message}` });
  }
};

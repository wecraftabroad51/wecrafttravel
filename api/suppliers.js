// ── Supplier API Proxy (generic, multi-supplier) ──────────────────
// GET /api/suppliers?supplier=probooking          → รายการทัวร์
// GET /api/suppliers?supplier=probooking&id=68     → รายละเอียดทัวร์
//
// รองรับซัพพลายเออร์ที่ใช้ API แบบเดียวกัน (ProBooking / WonderGroup)

const https = require('https');

// ── Host whitelist (กัน SSRF — ไม่ให้ client ระบุ host เอง) ────────
const SUPPLIER_HOSTS = {
  probooking:  'api.probooking.co.th',
  wondergroup: 'api.wondergrouptour.com',
};

function pbFetch(host, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      path: `/v1${path}`,
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
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
  const host = SUPPLIER_HOSTS[supplier];
  if (!host) return res.status(400).json({ error: 'ไม่รู้จักซัพพลายเออร์: ' + supplier });

  try {
    const path = id ? `/programtours/${encodeURIComponent(id)}` : '/programtours';
    const data = await pbFetch(host, path);
    return res.status(200).json(data);
  } catch (e) {
    console.error(`[Supplier proxy: ${supplier}]`, e.message);
    return res.status(502).json({ error: `ไม่สามารถดึงข้อมูลจาก ${supplier} ได้: ${e.message}` });
  }
};

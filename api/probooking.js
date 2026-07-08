// ── ProBooking API Proxy ──────────────────────────────────────────
// GET /api/probooking        → รายการทัวร์ทั้งหมด
// GET /api/probooking?id=68  → รายละเอียดทัวร์

const https = require('https');

function pbFetch(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.probooking.co.th',
      path: `/v1${path}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from ProBooking: ' + e.message)); }
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

  try {
    const { id } = req.query || {};
    if (id) {
      const data = await pbFetch(`/programtours/${encodeURIComponent(id)}`);
      return res.status(200).json(data);
    } else {
      const data = await pbFetch('/programtours');
      return res.status(200).json(data);
    }
  } catch (e) {
    console.error('[ProBooking proxy]', e.message);
    return res.status(502).json({ error: 'ไม่สามารถดึงข้อมูลจาก ProBooking ได้: ' + e.message });
  }
};

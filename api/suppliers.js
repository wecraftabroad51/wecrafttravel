// ── Supplier API Proxy (generic, multi-supplier) ──────────────────
// GET /api/suppliers?supplier=probooking          → รายการทัวร์
// GET /api/suppliers?supplier=probooking&id=68     → รายละเอียดทัวร์
//
// รองรับซัพพลายเออร์หลายเจ้า — บางเจ้า public, บางเจ้าต้องใช้ token

const https = require('https');

// ── Supplier config (whitelist กัน SSRF) ─────────────────────────
// base   = path prefix ของ API
// auth   = (optional) { header, tokenEnv } สำหรับเจ้าที่ต้อง token
// list   = path รายการทัวร์ทั้งหมด
// detail = ฟังก์ชันสร้าง path รายละเอียดจาก id
const SUPPLIERS = {
  probooking:  { host: 'api.probooking.co.th',    base: '/v1',   list: '/programtours', detail: id => `/programtours/${id}` },
  wondergroup: { host: 'api.wondergrouptour.com', base: '/v1',   list: '/programtours', detail: id => `/programtours/${id}` },
  gs25tour:    { host: 'api.gs25tour.com',         base: '/v1',   list: '/programtours', detail: id => `/programtours/${id}` },
  zego:        { host: 'www.zegoapi.com',          base: '/v1.5', list: '/programtours', detail: id => `/programtours/${id}`,
                 auth: { header: 'auth-token', tokenEnv: 'ZEGO_API_TOKEN' } },
  ttn:         { host: 'online.ttnconnect.com',    base: '/api/agency', list: '/get-allprogram', detail: id => `/program/${id}` },
  ttnplus:     { host: 'www.ttnplus.co.th',        base: '/api',        list: '/program',        detail: id => `/program?p=${id}` },
  best:        { host: 'tour-api.bestinternational.com', base: '/api/public/v1', list: '/tour-programs', detail: id => `/tour-programs/${id}`,
                 auth: { header: 'Authorization', tokenEnv: 'BEST_API_TOKEN', scheme: 'Bearer' },
                 paginate: { limit: 50, maxPages: 20 } },   // 183 ทัวร์ · ดึงครบทุกหน้าแล้วรวม
};

function supFetch(cfg, path) {
  return new Promise((resolve, reject) => {
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (cfg.auth) {
      const token = process.env[cfg.auth.tokenEnv];
      if (!token) return reject(new Error(`ยังไม่ได้ตั้งค่า ${cfg.auth.tokenEnv}`));
      headers[cfg.auth.header] = cfg.auth.scheme ? `${cfg.auth.scheme} ${token}` : token;
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
    // ซัพที่แบ่งหน้า (best) + ขอรายการทั้งหมด → วนดึงทุกหน้าแล้วรวมเป็นก้อนเดียว
    if (cfg.paginate && !id) {
      let page = 1, all = [], meta = null;
      while (page <= cfg.paginate.maxPages) {
        const chunk = await supFetch(cfg, `${cfg.list}?page=${page}&limit=${cfg.paginate.limit}`);
        const items = chunk?.data?.data || chunk?.data?.items || (Array.isArray(chunk?.data) ? chunk.data : []);
        all = all.concat(items);
        meta = chunk?.data?.meta || chunk?.meta || meta;
        const totalPages = meta?.totalPages || 1;
        if (page >= totalPages || items.length === 0) break;
        page++;
      }
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
      return res.status(200).json({ data: { data: all, meta } });
    }

    const path = id ? cfg.detail(encodeURIComponent(id)) : cfg.list;
    const data = await supFetch(cfg, path);
    // Cache ที่ CDN edge: สด 5 นาที · เสิร์ฟของเก่าได้อีก 30 นาทีระหว่าง refresh เบื้องหลัง
    // → คนแรกช้า (รอซัพ) คนถัดไปได้ทันที ข้อมูลไม่เก่าเกิน ~5 นาที
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json(data);
  } catch (e) {
    console.error(`[Supplier proxy: ${supplier}]`, e.message);
    return res.status(502).json({ error: `ไม่สามารถดึงข้อมูลจาก ${supplier} ได้: ${e.message}` });
  }
};

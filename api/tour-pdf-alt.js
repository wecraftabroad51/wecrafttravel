// ── Fallback PDF proxy (serverless/Node) สำหรับโฮสต์ที่ Edge เข้าไม่ได้ (zego/gs25) ──
// สตรีมไฟล์ผ่านโดเมนเรา (ซ่อน URL ต้นทาง) · ต้นทางบางเจ้า throttle จึงให้เวลา 60 วิ + cache ยาว
const { Readable } = require('stream');
const ALLOW = [
  'probooking.co.th', 'wondergrouptour.com', 'booking.gs25tour.com',
  'zegotravel.com', 'ttnplus.co.th', 'ttnconnect.com', 'bestinternational.com', 'bestconsortium.com', 'dev-bestconsortium.com', 'superbholidayz.com', 'checkingroup.co.th', 'flywholesales.com', 'realjourney.co.th', 'tourfactory.co.th', 'rarex.co.th', 'itravels.center', 'r2.cloudflarestorage.com', 'supabase.co', 'ht1freshdigital.com', 'drive.google.com', 'drive.usercontent.google.com',
];

function b64urlDecode(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

module.exports = async function handler(req, res) {
  const enc = (req.query && req.query.u) || '';
  let target;
  try { target = b64urlDecode(enc); } catch { return res.status(400).send('bad ref'); }

  let host;
  try { host = new URL(target).host.toLowerCase(); } catch { return res.status(400).send('bad url'); }
  if (!ALLOW.some(h => host === h || host.endsWith('.' + h))) return res.status(403).send('forbidden');

  if (host.includes('drive.google.com') || host.includes('drive.usercontent.google.com')) {
    const m = target.match(/[-\w]{25,}/);
    if (m) target = 'https://drive.google.com/uc?export=download&id=' + m[0];
  }

  // สตรีมผ่านโดเมนเรา (ไม่โชว์ URL ต้นทาง) · abort ถ้าต่อไม่ติดใน 55 วิ
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55000);
  let up;
  try {
    up = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36' } });
  } catch (e) {
    // ต่อไม่ติดจริงๆ (บล็อก IP) → รีไดเรกต์ให้โหลดตรงเป็นทางสุดท้าย (ยอมโชว์ URL ดีกว่าโหลดไม่ได้)
    clearTimeout(timer); res.setHeader('Location', target); return res.status(302).end();
  }
  if (!up.ok || !up.body) { clearTimeout(timer); res.setHeader('Location', target); return res.status(302).end(); }
  // ส่ง header ทันที (เบราว์เซอร์รู้ว่าเป็น PDF แล้วเริ่มเรนเดอร์ระหว่างสตรีม) — cache 1 วันหลังโหลดครบ
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  res.status(200);
  try {
    const node = Readable.fromWeb(up.body);
    node.on('error', () => { clearTimeout(timer); try { res.end(); } catch {} });
    node.pipe(res).on('finish', () => clearTimeout(timer));
  } catch (e) { clearTimeout(timer); try { res.end(); } catch {} }
};

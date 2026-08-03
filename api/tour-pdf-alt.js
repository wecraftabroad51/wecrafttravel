// ── Fallback PDF proxy (serverless/Node) สำหรับโฮสต์ที่ Edge เข้าไม่ได้ (zego/gs25) ──
// Edge จะ redirect มาที่นี่เมื่อ fetch ต้นทางล้มเหลว · ไฟล์กลุ่มนี้ < 4.5MB จึง buffer ได้
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

  // ต้นทางบางเจ้า (zego) throttle IP ดาต้าเซนเตอร์ → โหลดช้ามาก
  // ตั้ง timeout 9 วิ ครอบทั้ง fetch+อ่าน body · ถ้าช้าเกิน → รีไดเรกต์ให้เบราว์เซอร์โหลดตรง (ไม่ค้างจน 504)
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  const toSource = () => { clearTimeout(timer); res.setHeader('Location', target); return res.status(302).end(); };
  try {
    const up = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36' } });
    if (!up.ok) return toSource();
    const buf = Buffer.from(await up.arrayBuffer());
    clearTimeout(timer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buf);
  } catch (e) {
    // ต้นทางบล็อก/ช้า (connect timeout / abort) → รีไดเรกต์ให้เบราว์เซอร์โหลดตรง
    return toSource();
  }
};

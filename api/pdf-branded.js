// ── PDF แบรนด์ WeCraft — แปะรูปหัว/ท้ายกระดาษ (public/pdf-header.png, public/pdf-footer.png) ทุกหน้า ──
// ล้มเหลวเมื่อไหร่ (โหลดไม่ได้/สแตมป์ไม่ได้/ยังไม่มีรูป) → เด้งไป /api/tour-pdf เดิม (ยังเปิดได้ · ซ่อน url)
const { PDFDocument } = require('pdf-lib');
const SITE = 'https://wecraft-travel.com';
const ALLOW = [
  'probooking.co.th', 'wondergrouptour.com', 'booking.gs25tour.com', 'zegotravel.com',
  'ttnplus.co.th', 'ttnconnect.com', 'bestinternational.com', 'bestconsortium.com',
  'dev-bestconsortium.com', 'superbholidayz.com', 'checkingroup.co.th', 'flywholesales.com',
  'realjourney.co.th', 'tourfactory.co.th', 'rarex.co.th', 'itravels.center',
  'r2.cloudflarestorage.com', 'uniqueinterwholesale.com', 'supabase.co', 'ht1freshdigital.com',
  'drive.google.com', 'drive.usercontent.google.com',
];

function b64urlDecode(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

// cache รูปหัว/ท้ายใน instance (ไม่ต้องโหลดซ้ำทุกครั้ง)
let brandCache = { ts: 0, header: null, footer: null };
async function getBrandImages() {
  if (brandCache.ts && (brandCache.header || brandCache.footer) && Date.now() - brandCache.ts < 600000) return brandCache;
  const grab = (u) => fetch(u).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null);
  const [h, f] = await Promise.all([grab(`${SITE}/pdf-header.png`), grab(`${SITE}/pdf-footer.png`)]);
  const result = { ts: Date.now(), header: h, footer: f };
  if (h || f) brandCache = result;   // cache เฉพาะเมื่อมีรูปแล้ว (กันแคชสถานะ "ยังไม่มีรูป")
  return result;
}

module.exports = async function handler(req, res) {
  const enc = (req.query && req.query.u) || '';
  let target;
  try { target = b64urlDecode(enc); } catch { return res.status(400).send('bad ref'); }
  let host;
  try { host = new URL(target).host.toLowerCase(); } catch { return res.status(400).send('bad url'); }
  if (!ALLOW.some(h => host === h || host.endsWith('.' + h))) return res.status(403).send('forbidden');

  const fallback = () => { res.setHeader('Location', `${SITE}/api/tour-pdf?u=${enc}`); return res.status(302).end(); };

  if (host.includes('drive.google.com') || host.includes('drive.usercontent.google.com')) {
    const m = target.match(/[-\w]{25,}/);
    if (m) target = 'https://drive.google.com/uc?export=download&id=' + m[0];
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const up = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36' } });
    if (!up.ok) { clearTimeout(timer); return fallback(); }
    const ct = up.headers.get('content-type') || '';
    const pdfBytes = new Uint8Array(await up.arrayBuffer());
    clearTimeout(timer);
    // ไม่ใช่ PDF (เช่น Google Drive คืนหน้ายืนยัน HTML) → ส่งต่อ proxy เดิม
    if (!/pdf/i.test(ct) && !(pdfBytes[0] === 0x25 && pdfBytes[1] === 0x50)) return fallback();

    const { header, footer } = await getBrandImages();
    // ยังไม่มีรูปแบรนด์ → ส่ง PDF เดิม (ผ่านโดเมนเรา ซ่อน url) โดยไม่ต้องประมวลผล
    if (!header && !footer) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).send(Buffer.from(pdfBytes));
    }
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    let headerImg = null, footerImg = null;
    try { if (header) headerImg = await pdfDoc.embedPng(header); } catch {}
    try { if (footer) footerImg = await pdfDoc.embedPng(footer); } catch {}

    if (headerImg || footerImg) {
      for (const page of pdfDoc.getPages()) {
        const { width, height } = page.getSize();
        if (headerImg) {
          const h = width * (headerImg.height / headerImg.width);
          page.drawImage(headerImg, { x: 0, y: height - h, width, height: h });
        }
        if (footerImg) {
          const f = width * (footerImg.height / footerImg.width);
          page.drawImage(footerImg, { x: 0, y: 0, width, height: f });
        }
      }
    }
    const out = await pdfDoc.save({ useObjectStreams: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(Buffer.from(out));
  } catch (e) {
    clearTimeout(timer);
    return fallback();
  }
};

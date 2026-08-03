// ── PDF proxy (serverless/Node) — ซ่อน url ต้นทาง + แปะหัว/ท้ายกระดาษแบรนด์ WeCraft ──
// รูปแบรนด์: public/pdf-header.png (บน), public/pdf-footer.png (ล่าง) · ล้มเหลว → ส่ง PDF เดิม/redirect ต้นทาง
const { PDFDocument } = require('pdf-lib');
const SITE = 'https://wecraft-travel.com';
const ALLOW = [
  'probooking.co.th', 'wondergrouptour.com', 'booking.gs25tour.com',
  'zegotravel.com', 'ttnplus.co.th', 'ttnconnect.com', 'bestinternational.com', 'bestconsortium.com', 'dev-bestconsortium.com', 'superbholidayz.com', 'checkingroup.co.th', 'flywholesales.com', 'realjourney.co.th', 'tourfactory.co.th', 'rarex.co.th', 'itravels.center', 'r2.cloudflarestorage.com', 'uniqueinterwholesale.com', 'supabase.co', 'ht1freshdigital.com', 'drive.google.com', 'drive.usercontent.google.com',
];

function b64urlDecode(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

// cache รูปหัว/ท้ายใน instance
let brandCache = { ts: 0, header: null, footer: null };
async function getBrandImages() {
  if (brandCache.ts && (brandCache.header || brandCache.footer) && Date.now() - brandCache.ts < 600000) return brandCache;
  const grab = (u) => fetch(u).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null);
  const [h, f] = await Promise.all([grab(`${SITE}/pdf-header.png`), grab(`${SITE}/pdf-footer.png`)]);
  const result = { ts: Date.now(), header: h, footer: f };
  if (h || f) brandCache = result;
  return result;
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

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  const toSource = () => { clearTimeout(timer); res.setHeader('Location', target); return res.status(302).end(); };
  const sendPdf = (buf, smaxage) => {
    clearTimeout(timer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
    res.setHeader('Cache-Control', `s-maxage=${smaxage}, stale-while-revalidate=604800`);
    return res.status(200).send(buf);
  };

  let up;
  try { up = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36' } }); }
  catch { return toSource(); }                       // ต่อไม่ติด/ช้าเกิน → โหลดตรง
  if (!up.ok) return toSource();
  const ct = up.headers.get('content-type') || '';
  const raw = Buffer.from(await up.arrayBuffer());
  clearTimeout(timer);
  // ไม่ใช่ PDF (เช่น Google Drive คืน HTML) → ส่งกลับเดิม
  if (!/pdf/i.test(ct) && !(raw[0] === 0x25 && raw[1] === 0x50)) return sendPdf(raw, 3600);

  // แปะหัว/ท้ายกระดาษ (ถ้ามีรูปแบรนด์) — ถ้าสแตมป์ไม่ได้ ส่ง PDF เดิม
  try {
    const { header, footer } = await getBrandImages();
    if (!header && !footer) return sendPdf(raw, 3600);
    const doc = await PDFDocument.load(raw, { ignoreEncryption: true });
    let hImg = null, fImg = null;
    try { if (header) hImg = await doc.embedPng(header); } catch {}
    try { if (footer) fImg = await doc.embedPng(footer); } catch {}
    if (hImg || fImg) {
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        if (hImg) { const h = width * (hImg.height / hImg.width); page.drawImage(hImg, { x: 0, y: height - h, width, height: h }); }
        if (fImg) { const f = width * (fImg.height / fImg.width); page.drawImage(fImg, { x: 0, y: 0, width, height: f }); }
      }
    }
    const out = Buffer.from(await doc.save({ useObjectStreams: true }));
    return sendPdf(out, 86400);
  } catch {
    return sendPdf(raw, 3600);
  }
};

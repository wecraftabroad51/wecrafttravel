// ── PDF proxy (serverless/Node) — ซ่อน url ต้นทาง + แปะหัว/ท้ายกระดาษแบรนด์ WeCraft ──
// รูปแบรนด์: public/pdf-header.png (บน), public/pdf-footer.png (ล่าง) · ล้มเหลว → ส่ง PDF เดิม/redirect ต้นทาง
const { PDFDocument } = require('pdf-lib');
const { Readable } = require('stream');
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
  const timer = setTimeout(() => ctrl.abort(), 40000);   // ต้นทางบางเจ้า (zego) ช้ามาก
  const toSource = () => { clearTimeout(timer); res.setHeader('Location', target); return res.status(302).end(); };
  const sendPdf = (buf, smaxage) => {
    clearTimeout(timer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
    // cache ยาว (ลิงก์มี v= สำหรับล้าง cache เวลาแก้แบรนด์) + ให้เบราว์เซอร์เก็บด้วย
    res.setHeader('Cache-Control', `public, max-age=86400, s-maxage=${smaxage}, stale-while-revalidate=2592000`);
    return res.status(200).send(buf);
  };

  let up;
  try { up = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36' } }); }
  catch { return toSource(); }                       // ต่อไม่ติด/ช้าเกิน → โหลดตรง
  if (!up.ok) return toSource();
  const ct = up.headers.get('content-type') || '';

  // ── ไฟล์ใหญ่ (เช่นโปรแกรมยุโรป 8-12MB) → "สตรีม" ส่งทันทีระหว่างโหลด ──
  // เบราว์เซอร์เริ่มแสดงหน้าแรกได้เลย ไม่ต้องรอครบทั้งไฟล์ (เร็วกว่ามาก) · ยังซ่อน url ต้นทาง
  const size = Number(up.headers.get('content-length') || 0);
  if (size > 8 * 1024 * 1024 && up.body) {
    clearTimeout(timer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wecraft-travel-tour.pdf"');
    if (size) res.setHeader('Content-Length', String(size));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=2592000');
    res.status(200);
    try {
      const node = Readable.fromWeb(up.body);
      node.on('error', () => { try { res.end(); } catch {} });
      return node.pipe(res);
    } catch { try { return res.end(); } catch { return; } }
  }

  // อ่าน body ต้องอยู่ใน try ด้วย — ต้นทางช้า (zego) แล้ว abort ระหว่างอ่านจะ throw → 500
  let raw;
  try { raw = Buffer.from(await up.arrayBuffer()); }
  catch { return toSource(); }
  clearTimeout(timer);
  // ไม่ใช่ PDF (เช่น Google Drive คืน HTML) → ส่งกลับเดิม
  if (!/pdf/i.test(ct) && !(raw[0] === 0x25 && raw[1] === 0x50)) return sendPdf(raw, 3600);

  // แปะหัว/ท้ายกระดาษ (ถ้ามีรูปแบรนด์) — ถ้าสแตมป์ไม่ได้ ส่ง PDF เดิม
  try {
    // ไฟล์ใหญ่ (ไม่ได้ประกาศ content-length มาก่อน) → ส่งเลย ไม่ stamp เพื่อความเร็ว
    if (raw.length > 8 * 1024 * 1024) return sendPdf(raw, 2592000);
    const { header, footer } = await getBrandImages();
    if (!header && !footer) return sendPdf(raw, 3600);

    // ── "ต่อขอบ": เนื้อหาเดิมคง 100% (ไม่ย่อ ไม่ทับ แม้ซัพทำชิดขอบ) ─────────
    // เพิ่มพื้นที่ใหม่บน-ล่างสำหรับแถบแบรนด์ WeCraft → ปลอดภัยกับทุกซัพ
    const src = await PDFDocument.load(raw, { ignoreEncryption: true });
    const outDoc = await PDFDocument.create();
    let hImg = null, fImg = null;
    try { if (header) hImg = await outDoc.embedPng(header); } catch {}
    try { if (footer) fImg = await outDoc.embedPng(footer); } catch {}
    if (!hImg && !fImg) return sendPdf(raw, 3600);

    const srcPages = src.getPages();
    const emb = await outDoc.embedPages(srcPages);
    for (let i = 0; i < srcPages.length; i++) {
      const { width, height } = srcPages[i].getSize();
      // สัดส่วนจริงของภาพ (ไม่บีบ ไม่ยืด) — เต็มความกว้างหน้า
      const hH = hImg ? width * (hImg.height / hImg.width) : 0;
      const fH = fImg ? width * (fImg.height / fImg.width) : 0;
      const page = outDoc.addPage([width, height + hH + fH]);
      page.drawPage(emb[i], { x: 0, y: fH, width, height });          // เนื้อหาเดิม ขนาดจริง
      if (hImg) page.drawImage(hImg, { x: 0, y: height + fH, width, height: hH });
      if (fImg) page.drawImage(fImg, { x: 0, y: 0, width, height: fH });
    }

    const out = Buffer.from(await outDoc.save({ useObjectStreams: true }));
    return sendPdf(out, 2592000);
  } catch {
    return sendPdf(raw, 3600);
  }
};

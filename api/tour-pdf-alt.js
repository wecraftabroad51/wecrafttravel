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
  const timer = setTimeout(() => ctrl.abort(), 40000);   // ต้นทางบางเจ้า (zego) ช้ามาก
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
  // อ่าน body ต้องอยู่ใน try ด้วย — ต้นทางช้า (zego) แล้ว abort ระหว่างอ่านจะ throw → 500
  let raw;
  try { raw = Buffer.from(await up.arrayBuffer()); }
  catch { return toSource(); }
  clearTimeout(timer);
  // ไม่ใช่ PDF (เช่น Google Drive คืน HTML) → ส่งกลับเดิม
  if (!/pdf/i.test(ct) && !(raw[0] === 0x25 && raw[1] === 0x50)) return sendPdf(raw, 3600);

  // แปะหัว/ท้ายกระดาษ (ถ้ามีรูปแบรนด์) — ถ้าสแตมป์ไม่ได้ ส่ง PDF เดิม
  try {
    // ไฟล์ใหญ่มาก → ส่งไปเลย ไม่ stamp (กันหน่วยความจำ/เวลาเกิน แล้วเปิดไม่ได้)
    if (raw.length > 12 * 1024 * 1024) return sendPdf(raw, 86400);
    const { header, footer } = await getBrandImages();
    if (!header && !footer) return sendPdf(raw, 3600);

    // สร้างเอกสารใหม่: ย่อ "เนื้อหาเดิม" ลงเล็กน้อย แล้ววางหัว/ท้ายในขอบที่ว่าง
    // → หัว/ท้ายไม่ทับข้อความหรือรูปในโปรแกรมทัวร์เลย (แบบกระดาษหัวจดหมาย)
    const src = await PDFDocument.load(raw, { ignoreEncryption: true });
    const outDoc = await PDFDocument.create();
    let hImg = null, fImg = null;
    try { if (header) hImg = await outDoc.embedPng(header); } catch {}
    try { if (footer) fImg = await outDoc.embedPng(footer); } catch {}
    if (!hImg && !fImg) return sendPdf(raw, 3600);

    const srcPages = src.getPages();
    const embedded = await outDoc.embedPages(srcPages);
    const MAX_H = 0.07;   // หัวกระดาษ ไม่เกิน 7% ของความสูงหน้า
    const MAX_F = 0.12;   // ท้ายกระดาษ ไม่เกิน 12%

    for (let i = 0; i < srcPages.length; i++) {
      const { width, height } = srcPages[i].getSize();
      const page = outDoc.addPage([width, height]);

      // ขนาดหัว/ท้าย (คงสัดส่วนภาพ · จำกัดความสูงไม่ให้กินพื้นที่มาก)
      let hW = 0, hH = 0, fW = 0, fH = 0;
      if (hImg) { hW = width; hH = width * (hImg.height / hImg.width); if (hH > height * MAX_H) { const s = (height * MAX_H) / hH; hH *= s; hW *= s; } }
      if (fImg) { fW = width; fH = width * (fImg.height / fImg.width); if (fH > height * MAX_F) { const s = (height * MAX_F) / fH; fH *= s; fW *= s; } }

      // ย่อเนื้อหาเดิมให้พอดีช่องว่างระหว่างหัวกับท้าย แล้วจัดกึ่งกลาง
      const avail = height - hH - fH;
      const scale = Math.min(1, avail / height);
      const cw = width * scale, ch = height * scale;
      page.drawPage(embedded[i], { x: (width - cw) / 2, y: fH + (avail - ch) / 2, width: cw, height: ch });

      if (hImg) page.drawImage(hImg, { x: (width - hW) / 2, y: height - hH, width: hW, height: hH });
      if (fImg) page.drawImage(fImg, { x: (width - fW) / 2, y: 0, width: fW, height: fH });
    }
    const out = Buffer.from(await outDoc.save({ useObjectStreams: true }));
    return sendPdf(out, 86400);
  } catch {
    return sendPdf(raw, 3600);
  }
};

// อุ่น cache ฟีดทัวร์ + ไฟล์ PDF ล่วงหน้า (เรียกโดย Vercel cron)
// จุดประสงค์: ลูกค้าคนแรกไม่ต้องรอ 4-22 วิ (ซัพหน่วง IP ดาต้าเซนเตอร์) — พอ cache อุ่นแล้วเปิด ~0.4 วิ
const SITE = 'https://wecraft-travel.com';
const PDF_VER = 'v=3';                 // ต้องตรงกับลิงก์ฝั่งเว็บ/แอดมิน/LINE (ไม่งั้นอุ่นคนละ cache)
const BATCH = 12;                      // อุ่นกี่ไฟล์ต่อรอบ (กันเกินเวลาฟังก์ชัน)
const CONCURRENCY = 3;

const b64url = (s) => Buffer.from(String(s)).toString('base64url');
const pdfProxyUrl = (pdf) => `${SITE}/api/tour-pdf-alt?${PDF_VER}&u=${b64url(pdf)}`;

// เลือกไฟล์ที่จะอุ่นแบบหมุนเวียน — ใช้ "ช่วงเวลา" เป็นตัวเลื่อน offset
// ทุกๆ รอบ cron จะอุ่นชุดถัดไป วนไปเรื่อยๆ จนครบทุกไฟล์แล้ววนใหม่ (cache อยู่ 30 วัน)
function pickBatch(list, size) {
  if (!list.length) return [];
  const slot = Math.floor(Date.now() / (1000 * 60 * 60));   // เปลี่ยนทุกชั่วโมง
  const start = (slot * size) % list.length;
  const out = [];
  for (let i = 0; i < Math.min(size, list.length); i++) out.push(list[(start + i) % list.length]);
  return out;
}

module.exports = async function handler(req, res) {
  const result = { feeds: {}, pdfs: { warmed: 0, hit: 0, miss: 0, failed: 0, ms: 0 } };

  // 1) อุ่นฟีด (เบา + เต็ม)
  const feedUrls = [`${SITE}/api/tour-feed?light=1`, `${SITE}/api/tour-feed`];
  let feedData = [];
  await Promise.all(feedUrls.map(async (u) => {
    const t0 = Date.now();
    try {
      const r = await fetch(u);
      const a = await r.json();
      if (Array.isArray(a) && a.length > feedData.length) feedData = a;
      result.feeds[u.includes('light') ? 'light' : 'full'] = { ok: r.ok, ms: Date.now() - t0, count: Array.isArray(a) ? a.length : 0, cache: r.headers.get('x-vercel-cache') };
    } catch (e) { result.feeds[u] = { error: e.message }; }
  }));

  // 2) อุ่นไฟล์ PDF ทีละชุด (หมุนเวียนไปเรื่อยๆ)
  try {
    const pdfs = [...new Set(feedData.filter(t => t && t.pdf).map(t => t.pdf))];
    result.pdfs.total = pdfs.length;
    const batch = pickBatch(pdfs, BATCH);
    const t0 = Date.now();
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      await Promise.all(batch.slice(i, i + CONCURRENCY).map(async (pdf) => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 30000);
          const r = await fetch(pdfProxyUrl(pdf), { signal: ctrl.signal });
          await r.arrayBuffer();          // ต้องอ่านจนจบ cache ถึงจะเก็บ
          clearTimeout(timer);
          const c = r.headers.get('x-vercel-cache');
          if (c === 'HIT' || c === 'STALE') result.pdfs.hit++; else result.pdfs.miss++;
          result.pdfs.warmed++;
        } catch { result.pdfs.failed++; }
      }));
    }
    result.pdfs.ms = Date.now() - t0;
  } catch (e) { result.pdfs.error = e.message; }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ...result, at: new Date().toISOString() });
};

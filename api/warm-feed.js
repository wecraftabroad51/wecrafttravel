// อุ่น cache ฟีดทัวร์ทั้งเบา+เต็ม (เรียกโดย Vercel cron) — กัน LINE เจอ cache เย็นแล้วช้า
// ยิงหา CDN ของตัวเอง เพื่อให้ edge cache อุ่นทั้งสอง URL
const SITE = 'https://wecraft-travel.com';

module.exports = async function handler(req, res) {
  const urls = [`${SITE}/api/tour-feed?light=1`, `${SITE}/api/tour-feed`];
  const out = {};
  await Promise.all(urls.map(async (u) => {
    const t0 = Date.now();
    try {
      const r = await fetch(u);
      const a = await r.json();
      out[u] = { ok: r.ok, ms: Date.now() - t0, count: Array.isArray(a) ? a.length : 0, cache: r.headers.get('x-vercel-cache') };
    } catch (e) { out[u] = { error: e.message }; }
  }));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ warmed: out, at: new Date().toISOString() });
};

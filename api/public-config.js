// ค่า public สำหรับหน้า static (book.html) — anon key เป็น public อยู่แล้ว (อยู่ใน bundle เว็บ)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json({
    url: process.env.VITE_SUPABASE_URL || '',
    key: process.env.VITE_SUPABASE_ANON_KEY || '',
  });
};

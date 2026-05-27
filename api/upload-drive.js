// This endpoint is no longer used.
// Passport files are now uploaded directly to Supabase Storage (passports bucket)
// from the browser via the uploadPassport() helper in src/lib/db.js

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(410).json({ error: 'This endpoint is deprecated. Files are now stored in Supabase Storage.' });
};

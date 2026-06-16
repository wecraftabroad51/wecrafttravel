const { createClient } = require('@supabase/supabase-js');

function sheetNameFor(type) {
  if (type === 'ticket')     return 'จองตั๋ว';
  if (type === 'car-rental') return 'รถเช่า';
  if (type === 'join')       return 'จอยทัวร์';
  return 'กรุ๊ปเหมา';
}

function seqPrefixFor(type) {
  if (type === 'ticket')     return 'TK';
  if (type === 'car-rental') return 'RC';
  if (type === 'join')       return 'JT';
  return 'GI';
}

// ── Supabase fallback: count rows in messages for this month ──
async function seqNoFromSupabase(type, fullPrefix) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase env vars');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Count messages whose body starts with this month's seqNo prefix
  const { data, error } = await supabase
    .from('messages')
    .select('message')
    .like('message', `หมายเลขอ้างอิง: ${fullPrefix}%`);

  if (error) throw new Error(error.message);
  const count = (data || []).length;
  return `${fullPrefix}${String(count + 1).padStart(3, '0')}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type } = req.body || {};

  const now           = new Date();
  const buddhistYear  = (now.getFullYear() + 543).toString().slice(-2);
  const month         = String(now.getMonth() + 1).padStart(2, '0');
  const typePrefix    = seqPrefixFor(type);
  const fullPrefix    = `${typePrefix}${buddhistYear}${month}`;

  // ── Try Google Sheets first ────────────────────────────────
  const sheetId  = process.env.GOOGLE_SHEET_ID;
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (sheetId && credJson) {
    try {
      const { google } = require('googleapis');
      const credentials = JSON.parse(credJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets    = google.sheets({ version: 'v4', auth });
      const sheetName = sheetNameFor(type);
      const range     = `${sheetName}!A:A`;
      const meta      = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
      const allValues = meta.data.values || [];
      const count     = allValues.filter(r => r[0] && String(r[0]).startsWith(fullPrefix)).length;
      const seqNo     = `${fullPrefix}${String(count + 1).padStart(3, '0')}`;
      return res.status(200).json({ ok: true, seqNo, source: 'sheets' });
    } catch (err) {
      console.warn('Google Sheets failed, falling back to Supabase:', err.message);
    }
  }

  // ── Fallback: Supabase message count ──────────────────────
  try {
    const seqNo = await seqNoFromSupabase(type, fullPrefix);
    return res.status(200).json({ ok: true, seqNo, source: 'supabase' });
  } catch (err) {
    console.error('gen-seqno error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

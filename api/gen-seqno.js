const { google } = require('googleapis');

function sheetNameFor(type) {
  if (type === 'ticket')     return 'จองตั๋ว';
  if (type === 'car-rental') return 'รถเช่า';
  return 'กรุ๊ปเหมา';
}

function seqPrefixFor(type) {
  if (type === 'ticket')     return 'TK';
  if (type === 'car-rental') return 'RC';
  return 'GI';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type } = req.body || {};
  const sheetId  = process.env.GOOGLE_SHEET_ID;
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId || !credJson) {
    return res.status(500).json({ error: 'Missing Sheet credentials' });
  }

  try {
    const credentials = JSON.parse(credJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName  = sheetNameFor(type);
    const typePrefix = seqPrefixFor(type);
    const now        = new Date();
    const buddhistYear = (now.getFullYear() + 543).toString().slice(-2);
    const month        = String(now.getMonth() + 1).padStart(2, '0');
    const fullPrefix   = `${typePrefix}${buddhistYear}${month}`;

    const range = `${sheetName}!A:A`;
    const meta  = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const allValues = meta.data.values || [];
    const count = allValues.filter(r => r[0] && String(r[0]).startsWith(fullPrefix)).length;
    const seqNo = `${fullPrefix}${String(count + 1).padStart(2, '0')}`;

    return res.status(200).json({ ok: true, seqNo });
  } catch (err) {
    console.error('gen-seqno error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

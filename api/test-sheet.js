const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sheetId  = process.env.GOOGLE_SHEET_ID;
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  const info = {
    hasSheetId:  !!sheetId,
    hasCredJson: !!credJson,
    sheetIdValue: sheetId ? sheetId.slice(0,10) + '...' : 'MISSING',
    credJsonLength: credJson ? credJson.length : 0,
  };

  if (!sheetId || !credJson) {
    return res.status(200).json({ ok: false, step: 'env_check', info });
  }

  // Try parse JSON
  let credentials;
  try {
    credentials = JSON.parse(credJson);
    info.clientEmail = credentials.client_email || 'not found';
    info.projectId   = credentials.project_id   || 'not found';
  } catch (e) {
    return res.status(200).json({ ok: false, step: 'json_parse', error: e.message, info });
  }

  // Try auth
  let sheetsClient;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
  } catch (e) {
    return res.status(200).json({ ok: false, step: 'auth_init', error: e.message, info });
  }

  // Try read sheet
  try {
    const result = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:A',
    });
    info.rowsFound = (result.data.values || []).length;
    return res.status(200).json({ ok: true, step: 'read_ok', info });
  } catch (e) {
    return res.status(200).json({ ok: false, step: 'sheet_read', error: e.message, info });
  }
};

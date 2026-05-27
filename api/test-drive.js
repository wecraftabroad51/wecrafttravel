const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // ── Check env vars ─────────────────────────────────────────
  if (!credJson) return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON not set' });
  if (!folderId) return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID not set' });

  let credentials;
  try {
    credentials = JSON.parse(credJson);
  } catch (e) {
    return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON' });
  }

  // ── Test Drive auth ────────────────────────────────────────
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // Try to get folder info
    const { data } = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
    });

    return res.status(200).json({
      ok: true,
      clientEmail: credentials.client_email,
      folder: data,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      clientEmail: credentials?.client_email || 'unknown',
      folderId,
    });
  }
};

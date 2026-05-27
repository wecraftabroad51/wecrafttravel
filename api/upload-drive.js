const { google } = require('googleapis');
const { PassThrough } = require('stream');

function bufferToStream(buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { files, folderName } = req.body || {};
  if (!files || !files.length) return res.status(400).json({ error: 'No files provided' });

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!credJson) return res.status(500).json({ error: 'Missing Google credentials' });

  try {
    const credentials = JSON.parse(credJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // ── Upload each file directly to main folder ─────────────────
    // ใช้ prefix ชื่อไฟล์แทนการสร้าง subfolder เพื่อลด permission issues
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'short', timeStyle: 'short' }).replace(/[/:,\s]/g, '-');
    const prefix = folderName ? `${folderName}_` : `${now}_`;

    const results = [];
    for (const file of files) {
      const buffer = Buffer.from(file.data, 'base64');
      const fileName = `${prefix}${file.name}`;

      const { data } = await drive.files.create({
        requestBody: {
          name: fileName,
          ...(folderId ? { parents: [folderId] } : {}),
        },
        media: {
          mimeType: file.mimeType || 'application/octet-stream',
          body: bufferToStream(buffer),
        },
        fields: 'id, name, webViewLink',
      });

      await drive.permissions.create({
        fileId: data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      results.push({ name: data.name, id: data.id, url: data.webViewLink });
    }

    return res.status(200).json({ ok: true, files: results });
  } catch (err) {
    console.error('Drive upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

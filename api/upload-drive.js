const { google } = require('googleapis');
const { Readable } = require('stream');

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

    // ── Create sub-folder per booking if folderName given ────────
    let targetFolderId = folderId || null;
    if (folderId && folderName) {
      const folderRes = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId],
        },
        fields: 'id',
      });
      targetFolderId = folderRes.data.id;

      // Share sub-folder as reader (anyone with link)
      await drive.permissions.create({
        fileId: targetFolderId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    }

    // ── Upload each file ─────────────────────────────────────────
    const results = [];
    for (const file of files) {
      const buffer = Buffer.from(file.data, 'base64');
      const stream = Readable.from(buffer);

      const createParams = {
        requestBody: {
          name: file.name,
          ...(targetFolderId ? { parents: [targetFolderId] } : {}),
        },
        media: {
          mimeType: file.mimeType || 'application/octet-stream',
          body: stream,
        },
        fields: 'id, name, webViewLink',
      };

      const { data } = await drive.files.create(createParams);

      // Make file publicly viewable
      await drive.permissions.create({
        fileId: data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      results.push({
        name: data.name,
        id:   data.id,
        url:  data.webViewLink,
      });
    }

    return res.status(200).json({ ok: true, files: results });
  } catch (err) {
    console.error('Drive upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

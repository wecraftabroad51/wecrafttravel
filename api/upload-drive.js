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

    // ── Upload files first, then create folder only if upload succeeds ──
    // Prepare all buffers
    const fileBuffers = files.map(f => ({
      name:     f.name,
      mimeType: f.mimeType || 'application/octet-stream',
      buffer:   Buffer.from(f.data, 'base64'),
    }));

    // ── Create sub-folder ────────────────────────────────────────
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
      await drive.permissions.create({
        fileId: targetFolderId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    }

    // ── Upload each file ─────────────────────────────────────────
    const results = [];
    for (const file of fileBuffers) {
      const { data } = await drive.files.create({
        requestBody: {
          name: file.name,
          ...(targetFolderId ? { parents: [targetFolderId] } : {}),
        },
        media: {
          mimeType: file.mimeType,
          body: bufferToStream(file.buffer),
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

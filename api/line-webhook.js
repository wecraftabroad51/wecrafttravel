const https = require('https');

function lineReply(replyToken, text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !replyToken) return Promise.resolve();
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: 'text', text }],
  });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.line.me',
      path: '/v2/bot/message/reply',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => { res.resume(); res.on('end', resolve); });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const events = req.body?.events || [];

  for (const event of events) {
    const src = event.source || {};
    const replyToken = event.replyToken;

    if (event.type === 'join' && src.type === 'group') {
      await lineReply(replyToken,
        `✅ WeCraft Bot เข้ากลุ่มแล้ว!\n\n🔑 Group ID ของกลุ่มนี้:\n${src.groupId}\n\nคัดลอกค่านี้ไปใส่ใน Vercel:\nEnvironment Variable ชื่อ LINE_GROUP_ID`
      );
    }

    if (event.type === 'message' && src.type === 'group') {
      const alreadySet = !!process.env.LINE_GROUP_ID;
      if (!alreadySet) {
        await lineReply(replyToken,
          `🔑 Group ID ของกลุ่มนี้:\n${src.groupId}\n\nนำค่านี้ไปใส่ใน Vercel → Settings → Environment Variables:\nชื่อ: LINE_GROUP_ID\nค่า: ${src.groupId}`
        );
      }
    }
  }

  res.status(200).json({ ok: true });
};

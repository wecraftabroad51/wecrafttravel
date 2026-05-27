// LINE Webhook — ใช้เพื่อดัก Group ID
// วิธีใช้:
//   1. Deploy แล้วตั้ง Webhook URL ใน LINE Developers Console
//      → https://developers.line.biz → Channel → Messaging API → Webhook URL
//      → ใส่: https://www.wecraft-travel.com/api/line-webhook
//      → กด Verify ผ่าน → เปิด Use webhook
//   2. ส่งข้อความใดๆ ในกลุ่มไลน์ที่เชิญบอทเข้าไป
//   3. เปิด Vercel → Project → Functions → line-webhook → Logs
//      → จะเห็น Group ID ขึ้นมาในรูป: C xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   4. คัดลอก Group ID ไปใส่ใน Vercel Environment Variables ชื่อ LINE_GROUP_ID
//   5. Redeploy (หรือรอ deploy รอบถัดไป)

module.exports = async function handler(req, res) {
  // ตอบ 200 ก่อนเสมอ ไม่งั้น LINE จะ retry
  res.status(200).json({ ok: true });

  if (req.method !== 'POST') return;

  const body = req.body;
  if (!body || !body.events) return;

  for (const event of body.events) {
    const src = event.source || {};

    // ── แสดง Source ทุก event ──
    console.log('LINE Webhook event:', JSON.stringify({
      type:    event.type,
      srcType: src.type,
      userId:  src.userId  || null,
      groupId: src.groupId || null,
      roomId:  src.roomId  || null,
    }));

    // ── ถ้าเป็น message event ในกลุ่ม ──
    if (event.type === 'message' && src.type === 'group') {
      console.log('╔══════════════════════════════════════════╗');
      console.log('║  GROUP ID พบแล้ว! คัดลอกบรรทัดถัดไป:   ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  LINE_GROUP_ID = ${src.groupId}`);
      console.log('╚══════════════════════════════════════════╝');
    }

    // ── ถ้าบอทถูกเชิญเข้ากลุ่ม ──
    if (event.type === 'join' && src.type === 'group') {
      console.log('╔══════════════════════════════════════════╗');
      console.log('║  บอทถูกเชิญเข้ากลุ่ม! Group ID:         ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  LINE_GROUP_ID = ${src.groupId}`);
      console.log('╚══════════════════════════════════════════╝');
    }
  }
};

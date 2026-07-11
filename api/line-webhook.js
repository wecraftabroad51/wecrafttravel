// ── LINE Webhook — บอทส่งการ์ดทัวร์ (Flex Carousel) ────────────────
const crypto = require('crypto');

const TOKEN  = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_TOKEN;
const SECRET = process.env.LINE_CHANNEL_SECRET;
const SITE   = 'https://wecraft-travel.com';

const COUNTRIES = [
  { th: 'ญี่ปุ่น', iso: 'JP' }, { th: 'จีน', iso: 'CN' }, { th: 'เกาหลี', iso: 'KR' },
  { th: 'ไต้หวัน', iso: 'TW' }, { th: 'ฮ่องกง', iso: 'HK' }, { th: 'เวียดนาม', iso: 'VN' },
  { th: 'สิงคโปร์', iso: 'SG' }, { th: 'ยุโรป', iso: 'EU' }, { th: 'ตุรกี', iso: 'TR' },
];

async function reply(replyToken, messages) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyToken, messages: [].concat(messages).slice(0, 5) }),
  });
}

function countryChooser(text) {
  return {
    type: 'text', text,
    quickReply: { items: COUNTRIES.map(c => ({ type: 'action', action: { type: 'message', label: c.th, text: c.th } })) },
  };
}

function bubble(t) {
  const url = `${SITE}/tours/${t.id}`;
  return {
    type: 'bubble',
    hero: { type: 'image', url: t.image, size: 'full', aspectRatio: '20:13', aspectMode: 'cover', action: { type: 'uri', uri: url } },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: t.name, weight: 'bold', size: 'sm', wrap: true, maxLines: 2 },
        { type: 'box', layout: 'baseline', contents: [
          { type: 'text', text: 'เริ่มต้น', size: 'xs', color: '#999999', flex: 0 },
          { type: 'text', text: `฿${Number(t.price).toLocaleString()}`, size: 'lg', weight: 'bold', color: '#e2231a', align: 'end' },
        ] },
      ],
    },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'uri', label: 'จองเลย', uri: url } },
    ] },
  };
}

function seeAllBubble() {
  return {
    type: 'bubble', size: 'micro',
    body: { type: 'box', layout: 'vertical', justifyContent: 'center', alignItems: 'center', spacing: 'md',
      action: { type: 'uri', uri: `${SITE}/cards` }, contents: [
        { type: 'text', text: 'ดูทัวร์', size: 'sm', color: '#0f9d8f', align: 'center', weight: 'bold' },
        { type: 'text', text: 'ทั้งหมด', size: 'sm', color: '#0f9d8f', align: 'center', weight: 'bold' },
        { type: 'text', text: '→', size: 'xxl', color: '#0f9d8f', align: 'center' },
      ] },
  };
}

async function carouselForCountry(iso, label) {
  const res = await fetch(`${SITE}/api/tour-feed?c=${iso}`);
  const tours = res.ok ? await res.json() : [];
  if (!Array.isArray(tours) || !tours.length) return { type: 'text', text: `ตอนนี้ยังไม่มีทัวร์${label} ลองเลือกประเทศอื่นดูนะครับ 🙏` };
  const bubbles = tours.slice(0, 11).map(bubble);
  bubbles.push(seeAllBubble());
  return { type: 'flex', altText: `ทัวร์${label} ${tours.length} รายการ`, contents: { type: 'carousel', contents: bubbles } };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('ok');

  try {
    if (SECRET && req.headers['x-line-signature']) {
      const expected = crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('base64');
      if (expected !== req.headers['x-line-signature']) console.warn('[LINE] signature mismatch');
    }
  } catch {}

  const events = req.body?.events || [];
  await Promise.all(events.map(async (ev) => {
    try {
      if (ev.type === 'follow') {
        // แอดเพื่อนใหม่ — ทักทายเฉยๆ ไม่เด้งปุ่ม (ให้กดเมนู "จองจอยทัวร์" เอง)
        await reply(ev.replyToken, {
          type: 'text',
          text: 'ยินดีต้อนรับสู่ WeCraft Travel 🎉\nทัวร์คุณภาพ ครบทุกเส้นทาง\n\nกดเมนู "จองจอยทัวร์" ด้านล่างเพื่อเลือกทัวร์ได้เลยครับ 😊',
        });
        return;
      }
      if (ev.type === 'message' && ev.message?.type === 'text') {
        const text = (ev.message.text || '').trim();
        const hit = COUNTRIES.find(c => text.includes(c.th));
        // 1) เลือกประเทศแล้ว → ส่งการ์ด
        if (hit) {
          await reply(ev.replyToken, await carouselForCountry(hit.iso, hit.th));
        // 2) กด "จองจอยทัวร์" (หรือคีย์เวิร์ดทัวร์) → ขึ้นปุ่มเลือกประเทศ
        } else if (/จองจอยทัวร์|จอยทัวร์|ดูทัวร์|เลือกทัวร์|ทัวร์/i.test(text)) {
          await reply(ev.replyToken, countryChooser('อยากไปเที่ยวประเทศไหนดีครับ? 😊 เลือกได้เลย 👇'));
        // 3) ข้อความอื่น → ตอบสั้นๆ ไม่เด้งปุ่ม
        } else {
          await reply(ev.replyToken, { type: 'text', text: 'สนใจดูทัวร์ กดเมนู "จองจอยทัวร์" ด้านล่างได้เลยครับ 😊' });
        }
      }
    } catch (e) { console.error('[LINE] event error:', e.message); }
  }));

  return res.status(200).send('ok');
};

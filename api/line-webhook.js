// ── LINE Webhook — บอทส่งการ์ดทัวร์ (Flex Carousel) ────────────────
const crypto = require('crypto');

const TOKEN  = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_TOKEN;
const SECRET = process.env.LINE_CHANNEL_SECRET;
const SITE   = 'https://wecraft-travel.com';

// ISO2 → ชื่อไทย (flagcdn รองรับ code เหล่านี้)
const CODE_TH = {
  JP: 'ญี่ปุ่น', CN: 'จีน', KR: 'เกาหลี', TW: 'ไต้หวัน', HK: 'ฮ่องกง', MO: 'มาเก๊า',
  VN: 'เวียดนาม', SG: 'สิงคโปร์', MY: 'มาเลเซีย', MM: 'พม่า', KH: 'กัมพูชา', LA: 'ลาว',
  ID: 'อินโดนีเซีย', MV: 'มัลดีฟส์', IN: 'อินเดีย', KZ: 'คาซัคสถาน', TR: 'ตุรกี',
  GE: 'จอร์เจีย', EG: 'อียิปต์', FR: 'ฝรั่งเศส', IT: 'อิตาลี', GB: 'อังกฤษ', EU: 'ยุโรป', AE: 'ดูไบ',
};
const nameOf = (iso) => CODE_TH[iso] || iso;

async function reply(replyToken, messages) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyToken, messages: [].concat(messages).slice(0, 5) }),
  });
}

// การ์ดเลือกประเทศ (มีธงชาติ)
function countryBubble(c, count) {
  return {
    type: 'bubble',
    hero: {
      type: 'image', url: `https://flagcdn.com/w400/${c.iso.toLowerCase()}.png`,
      size: 'full', aspectRatio: '20:13', aspectMode: 'fit', backgroundColor: '#f4f4f5',
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'xs', contents: [
        { type: 'text', text: c.th, weight: 'bold', size: 'lg', align: 'center', color: '#1a2b3c' },
        { type: 'text', text: `${count} โปรแกรม`, size: 'sm', color: '#999999', align: 'center' },
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', contents: [
        { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'message', label: 'ดูทัวร์', text: c.th } },
      ],
    },
  };
}

async function countryChooser() {
  let counts = {};
  try {
    const all = await (await fetch(`${SITE}/api/tour-feed`)).json();
    if (Array.isArray(all)) for (const t of all) if (t.country) counts[t.country] = (counts[t.country] || 0) + 1;
  } catch {}
  // เฉพาะประเทศที่มีทัวร์จริง + รู้จักชื่อไทย · เรียงจากมากไปน้อย · ไม่เกิน 12 ใบ
  const list = Object.entries(counts)
    .filter(([iso, n]) => CODE_TH[iso] && n > 0)
    .sort((a, b) => b[1] - a[1]).slice(0, 12);
  const bubbles = list.map(([iso, n]) => countryBubble({ iso, th: nameOf(iso) }, n));
  if (!bubbles.length) return { type: 'text', text: 'ขออภัย ตอนนี้ยังไม่มีทัวร์ ลองใหม่อีกครั้งนะครับ 🙏' };
  return { type: 'flex', altText: 'เลือกประเทศที่อยากไป 🌏', contents: { type: 'carousel', contents: bubbles } };
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
  // ต้องขนาดเท่าการ์ดทัวร์ (LINE ห้ามผสมขนาดในคารูเซล)
  return {
    type: 'bubble',
    body: { type: 'box', layout: 'vertical', justifyContent: 'center', alignItems: 'center', spacing: 'md',
      action: { type: 'uri', uri: `${SITE}/cards` }, contents: [
        { type: 'text', text: '🎫', size: 'xxl', align: 'center' },
        { type: 'text', text: 'ดูทัวร์ทั้งหมด', size: 'md', color: '#0f9d8f', align: 'center', weight: 'bold', wrap: true },
        { type: 'text', text: 'ปัดดูเพิ่มเติมในเว็บ →', size: 'xs', color: '#999999', align: 'center', wrap: true },
      ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'secondary', height: 'sm', action: { type: 'uri', label: 'เปิดดู', uri: `${SITE}/cards` } },
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
        // จับคู่ชื่อประเทศ (เรียงชื่อยาวก่อน กัน substring ชนกัน)
        const hitIso = Object.keys(CODE_TH).sort((a, b) => CODE_TH[b].length - CODE_TH[a].length)
          .find(iso => text.includes(CODE_TH[iso]));
        // 1) เลือกประเทศแล้ว → ส่งการ์ด
        if (hitIso) {
          await reply(ev.replyToken, await carouselForCountry(hitIso, CODE_TH[hitIso]));
        // 2) กด "จองจอยทัวร์" (หรือคีย์เวิร์ดทัวร์) → การ์ดเลือกประเทศ (มีธง)
        } else if (/จองจอยทัวร์|จอยทัวร์|ดูทัวร์|เลือกทัวร์|ทัวร์/i.test(text)) {
          await reply(ev.replyToken, await countryChooser());
        // 3) ข้อความอื่น → ตอบสั้นๆ ไม่เด้งปุ่ม
        } else {
          await reply(ev.replyToken, { type: 'text', text: 'สนใจดูทัวร์ กดเมนู "จองจอยทัวร์" ด้านล่างได้เลยครับ 😊' });
        }
      }
    } catch (e) { console.error('[LINE] event error:', e.message); }
  }));

  return res.status(200).send('ok');
};

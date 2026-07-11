// ── LINE Webhook — บอทจบในไลน์: ประเทศ→เมือง→ทัวร์→รายละเอียด→จอง ──
const crypto = require('crypto');

const TOKEN    = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_TOKEN;
const SECRET   = process.env.LINE_CHANNEL_SECRET;
const GROUP_ID = process.env.LINE_GROUP_ID;
const SITE     = 'https://wecraft-travel.com';

const CODE_TH = {
  JP:'ญี่ปุ่น', CN:'จีน', KR:'เกาหลี', TW:'ไต้หวัน', HK:'ฮ่องกง', MO:'มาเก๊า',
  VN:'เวียดนาม', SG:'สิงคโปร์', MY:'มาเลเซีย', MM:'พม่า', KH:'กัมพูชา', LA:'ลาว',
  ID:'อินโดนีเซีย', MV:'มัลดีฟส์', IN:'อินเดีย', KZ:'คาซัคสถาน', TR:'ตุรกี',
  GE:'จอร์เจีย', EG:'อียิปต์', FR:'ฝรั่งเศส', IT:'อิตาลี', GB:'อังกฤษ', EU:'ยุโรป', AE:'ดูไบ',
};
const nameOf = (iso) => CODE_TH[iso] || iso;

// เมือง/เส้นทางย่อยต่อประเทศ (จับจากชื่อทัวร์)
const REGION = {
  CN:['เฉิงตู','เซี่ยงไฮ้','ฉงชิ่ง','ชิงเต่า','ปักกิ่ง','จางเจียเจี้ย','คุนหมิง','จิ่วจ้ายโกว','ซินเจียง','ซีอาน','ลี่เจียง','ฮาร์บิน','แชงกรีล่า','ต้าหลี่','กวางโจว','ซูโจว','หางโจว','ฉางซา'],
  JP:['โตเกียว','โอซาก้า','ฟูจิ','ฮอกไกโด','เกียวโต','ชิราคาวาโก','ทาคายาม่า','โอกินาว่า','คามาคุระ','นิกโก้','นาโกย่า','นารา'],
  TW:['ไทเป','ไทจง','อาลีซาน','เกาสง','จิ่วเฟิ่น','ฮัวเหลียน'],
  VN:['ดานัง','ฮอยอัน','ฮานอย','โฮจิมินห์','ซาปา','บานาฮิลล์','ฟูก๊วก','ดาลัด','ญาจาง','ฮาลอง'],
  KR:['โซล','ปูซาน','เชจู'],
};

const M_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function fmtDate(s) { if (!s) return ''; const [y,m,d] = String(s).split('-').map(Number); if (!y||!m||!d) return s; return `${d} ${M_TH[m-1]} ${String(y+543).slice(-2)}`; }
const baht = (n) => '฿' + Number(n || 0).toLocaleString();

// ── LINE API ─────────────────────────────────────────────────────
async function reply(replyToken, messages) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyToken, messages: [].concat(messages).slice(0, 5) }),
  });
}
async function pushAdmin(text) {
  if (!GROUP_ID) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: GROUP_ID, messages: [{ type: 'text', text }] }),
  });
}
async function getName(userId) {
  try { const p = await (await fetch(`https://api.line.me/v2/bot/profile/${userId}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json(); return p.displayName || ''; } catch { return ''; }
}
const feedCache = {};
async function fetchFeed(iso) {
  try { const r = await fetch(`${SITE}/api/tour-feed${iso ? `?c=${iso}` : ''}`); const a = await r.json(); return Array.isArray(a) ? a : []; } catch { return []; }
}
const pb = (obj) => 'a=' + encodeURIComponent(JSON.stringify(obj));
const unpb = (data) => { try { return JSON.parse(decodeURIComponent((data || '').replace(/^a=/, ''))); } catch { return {}; } };

// ── การ์ดเลือกประเทศ (ธง) ────────────────────────────────────────
function countryBubble(iso, n) {
  return {
    type: 'bubble',
    hero: { type: 'image', url: `https://flagcdn.com/w400/${iso.toLowerCase()}.png`, size: 'full', aspectRatio: '20:13', aspectMode: 'fit', backgroundColor: '#f4f4f5' },
    body: { type: 'box', layout: 'vertical', spacing: 'xs', contents: [
      { type: 'text', text: nameOf(iso), weight: 'bold', size: 'lg', align: 'center', color: '#1a2b3c' },
      { type: 'text', text: `${n} โปรแกรม`, size: 'sm', color: '#999999', align: 'center' },
    ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'postback', label: 'เลือก', data: pb({ s: 'country', iso }), displayText: `ทัวร์${nameOf(iso)}` } },
    ] },
  };
}
async function countryChooser() {
  const all = await fetchFeed('');
  const counts = {}; all.forEach(t => t.country && (counts[t.country] = (counts[t.country] || 0) + 1));
  const list = Object.entries(counts).filter(([iso, n]) => CODE_TH[iso] && n > 0).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!list.length) return { type: 'text', text: 'ขออภัย ตอนนี้ยังไม่มีทัวร์ ลองใหม่อีกครั้งนะครับ 🙏' };
  return { type: 'flex', altText: 'เลือกประเทศที่อยากไป 🌏', contents: { type: 'carousel', contents: list.map(([iso, n]) => countryBubble(iso, n)) } };
}

// ── การ์ดเลือกเมือง ──────────────────────────────────────────────
function cityBubble(iso, label, n, city) {
  return {
    type: 'bubble',
    body: { type: 'box', layout: 'vertical', spacing: 'md', justifyContent: 'center', contents: [
      { type: 'text', text: '📍', size: 'xxl', align: 'center' },
      { type: 'text', text: label, weight: 'bold', size: 'lg', align: 'center', color: '#1a2b3c', wrap: true },
      { type: 'text', text: `${n} โปรแกรม`, size: 'sm', color: '#999999', align: 'center' },
    ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'postback', label: 'ดูทัวร์', data: pb({ s: 'tours', iso, city }), displayText: `ทัวร์${label}` } },
    ] },
  };
}
async function cityChooser(iso) {
  const feed = await fetchFeed(iso);
  const kws = REGION[iso];
  let cities = [];
  if (kws) cities = kws.map(kw => ({ kw, n: feed.filter(t => (t.name || '').includes(kw)).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 11);
  if (!cities.length) return tourCarousel(iso, '', feed);   // ไม่มีเมืองย่อย → ไปทัวร์เลย
  const bubbles = [cityBubble(iso, `ทัวร์${nameOf(iso)}ทั้งหมด`, feed.length, '')];
  cities.forEach(c => bubbles.push(cityBubble(iso, c.kw, c.n, c.kw)));
  return { type: 'flex', altText: `เลือกเมืองใน${nameOf(iso)}`, contents: { type: 'carousel', contents: bubbles.slice(0, 12) } };
}

// ── การ์ดทัวร์ ───────────────────────────────────────────────────
function tourBubble(t, iso) {
  return {
    type: 'bubble',
    hero: { type: 'image', url: t.image, size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
    body: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [
      { type: 'text', text: t.name, weight: 'bold', size: 'sm', wrap: true, maxLines: 2 },
      { type: 'box', layout: 'baseline', contents: [
        { type: 'text', text: 'เริ่มต้น', size: 'xs', color: '#999999', flex: 0 },
        { type: 'text', text: baht(t.price), size: 'lg', weight: 'bold', color: '#e2231a', align: 'end' },
      ] },
    ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'postback', label: 'ดูรายละเอียด', data: pb({ s: 'detail', iso, id: t.id }), displayText: '📋 ดูรายละเอียด' } },
    ] },
  };
}
async function tourCarousel(iso, city, feed) {
  const list = feed || await fetchFeed(iso);
  const filtered = city ? list.filter(t => (t.name || '').includes(city)) : list;
  if (!filtered.length) return { type: 'text', text: 'ยังไม่มีทัวร์เส้นทางนี้ ลองเลือกใหม่นะครับ 🙏' };
  return { type: 'flex', altText: `ทัวร์${city || nameOf(iso)}`, contents: { type: 'carousel', contents: filtered.slice(0, 12).map(t => tourBubble(t, iso)) } };
}

// ── รายละเอียดทัวร์ (ในไลน์) ─────────────────────────────────────
async function tourDetail(iso, id) {
  const list = await fetchFeed(iso);
  const t = list.find(x => x.id === id);
  if (!t) return { type: 'text', text: 'ไม่พบข้อมูลทัวร์นี้ ลองเลือกใหม่นะครับ 🙏' };
  const info = [];
  if (t.days) info.push({ type: 'box', layout: 'baseline', spacing: 'sm', contents: [
    { type: 'text', text: 'จำนวนวัน', size: 'sm', color: '#999999', flex: 2 }, { type: 'text', text: `${t.days} วัน`, size: 'sm', color: '#333333', flex: 3, weight: 'bold' } ] });
  if (t.airline) info.push({ type: 'box', layout: 'baseline', spacing: 'sm', contents: [
    { type: 'text', text: 'สายการบิน', size: 'sm', color: '#999999', flex: 2 }, { type: 'text', text: t.airline, size: 'sm', color: '#333333', flex: 3, weight: 'bold', wrap: true } ] });
  const deps = (t.deps || []).slice(0, 5).map(d => ({ type: 'box', layout: 'baseline', spacing: 'sm', contents: [
    { type: 'text', text: fmtDate(d.date), size: 'sm', color: '#555555', flex: 3 },
    { type: 'text', text: baht(d.price), size: 'sm', color: '#e2231a', weight: 'bold', align: 'end', flex: 2 } ] }));
  const body = [
    { type: 'text', text: t.name, weight: 'bold', size: 'md', wrap: true },
    { type: 'box', layout: 'baseline', contents: [
      { type: 'text', text: 'ราคาเริ่มต้น', size: 'sm', color: '#999999', flex: 0 },
      { type: 'text', text: baht(t.price), size: 'xl', weight: 'bold', color: '#e2231a', align: 'end' } ] },
    { type: 'separator', margin: 'md' },
    ...info,
  ];
  if (deps.length) { body.push({ type: 'text', text: 'รอบเดินทาง / ราคา', size: 'sm', weight: 'bold', color: '#0f9d8f', margin: 'md' }, ...deps); }
  return {
    type: 'flex', altText: `รายละเอียด: ${t.name}`,
    contents: {
      type: 'bubble',
      hero: { type: 'image', url: t.image, size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
      body: { type: 'box', layout: 'vertical', spacing: 'sm', contents: body },
      footer: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'button', style: 'primary', color: '#e2231a', height: 'sm', action: { type: 'postback', label: 'สนใจจองทัวร์นี้', data: pb({ s: 'book', iso, id }), displayText: '🎫 สนใจจองทัวร์นี้' } },
        { type: 'button', style: 'secondary', height: 'sm', action: { type: 'postback', label: '← ดูทัวร์อื่น', data: pb({ s: 'tours', iso, city: '' }), displayText: 'ดูทัวร์อื่น' } },
      ] },
    },
  };
}

// ── สนใจจอง → แจ้งแอดมิน + ตอบลูกค้า (จบในไลน์) ──────────────────
async function handleBook(ev, iso, id) {
  const list = await fetchFeed(iso);
  const t = list.find(x => x.id === id);
  const uid = ev.source?.userId || '';
  const dName = uid ? await getName(uid) : '';
  await pushAdmin(`🔔 ลูกค้าสนใจจองทัวร์ (จาก LINE)\n\n🎫 ${t?.name || id}\n💰 เริ่มต้น ${baht(t?.price)}\n🌏 ${nameOf(iso)}\n\n👤 ${dName || 'ลูกค้า'}\nuserId: ${uid}\n\n👉 ตอบกลับลูกค้าทางแชท OA ได้เลยครับ`);
  await reply(ev.replyToken, {
    type: 'text',
    text: `ขอบคุณที่สนใจครับ 🙏\n\n🎫 ${t?.name || ''}\n\nแอดมินได้รับข้อมูลแล้ว จะรีบติดต่อกลับโดยเร็วที่สุด\n\nระหว่างนี้พิมพ์ ชื่อ · เบอร์ · จำนวนคน · เดือนที่สะดวก ทิ้งไว้ได้เลยครับ 😊`,
  });
}

// ── Handler ──────────────────────────────────────────────────────
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
      // ── Postback (กดปุ่มในการ์ด) ──
      if (ev.type === 'postback') {
        const d = unpb(ev.postback?.data);
        if (d.s === 'country') return reply(ev.replyToken, await cityChooser(d.iso));
        if (d.s === 'tours')   return reply(ev.replyToken, await tourCarousel(d.iso, d.city || ''));
        if (d.s === 'detail')  return reply(ev.replyToken, await tourDetail(d.iso, d.id));
        if (d.s === 'book')    return handleBook(ev, d.iso, d.id);
        return;
      }
      // ── แอดเพื่อนใหม่ ──
      if (ev.type === 'follow') {
        return reply(ev.replyToken, { type: 'text', text: 'ยินดีต้อนรับสู่ WeCraft Travel 🎉\nทัวร์คุณภาพ ครบทุกเส้นทาง\n\nกดเมนู "จองจอยทัวร์" ด้านล่างเพื่อเลือกทัวร์ได้เลยครับ 😊' });
      }
      // ── ข้อความ ──
      if (ev.type === 'message' && ev.message?.type === 'text') {
        const text = (ev.message.text || '').trim();
        const hitIso = Object.keys(CODE_TH).sort((a, b) => CODE_TH[b].length - CODE_TH[a].length).find(iso => text.includes(CODE_TH[iso]));
        if (hitIso) return reply(ev.replyToken, await cityChooser(hitIso));
        if (/จองจอยทัวร์|จอยทัวร์|ดูทัวร์|เลือกทัวร์|ทัวร์/i.test(text)) return reply(ev.replyToken, await countryChooser());
        return reply(ev.replyToken, { type: 'text', text: 'สนใจดูทัวร์ กดเมนู "จองจอยทัวร์" ด้านล่างได้เลยครับ 😊' });
      }
    } catch (e) { console.error('[LINE] event error:', e.message); }
  }));

  return res.status(200).send('ok');
};

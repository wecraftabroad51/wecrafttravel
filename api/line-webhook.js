// ── LINE Webhook — บอทจบในไลน์: ประเทศ→เมือง→ทัวร์→รายละเอียด→จอง ──
const crypto = require('crypto');
const { COUNTRY_IMG, CITY_IMG } = require('./_landmarks.js');

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
// encode URL รูป (บางเจ้ามีเว้นวรรคในชื่อไฟล์ → LINE ปฏิเสธ)
const img = (u) => { try { return encodeURI(String(u || '').trim()); } catch { return ''; } };
// ถอด HTML/entity ออกจากข้อความ (ไฮไลต์บางเจ้าเป็น HTML)
function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

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
// ดึง "ฟีดเต็ม" ครั้งเดียว (cache entry เดียว → อุ่นตลอด ไม่ค้าง 16 วิ) แล้วกรองประเทศในหน่วยความจำ
// กันเคสเดิม: ยิง ?c=JP, ?c=CN แยกกัน แต่ละอันเย็นแยก → คนแรกต่อประเทศรอ 16 วิ = เกิน timeout ของ LINE
const feedCache = { light: null, light_ts: 0, full: null, full_ts: 0 };
async function fetchFeedAll(full) {
  const key = full ? 'full' : 'light';
  if (feedCache[key] && (Date.now() - feedCache[`${key}_ts`] < 60000)) return feedCache[key];   // memo 60 วิ ต่อ instance
  try {
    const r = await fetch(`${SITE}/api/tour-feed${full ? '' : '?light=1'}`);
    const a = await r.json();
    if (Array.isArray(a)) { feedCache[key] = a; feedCache[`${key}_ts`] = Date.now(); return a; }
  } catch { /* ใช้ของเก่าถ้ามี */ }
  return feedCache[key] || [];
}
// full=false (ค่าเริ่มต้น) = ฟีดเบา (ไม่มี highlight/deps/pdf) สำหรับหน้าเลือก/การ์ดทัวร์ → เร็ว
// full=true = ฟีดเต็ม สำหรับหน้ารายละเอียด + เลือกรอบเดินทาง (ต้องใช้ deps/highlight)
async function fetchFeed(iso, full = false) {
  const all = await fetchFeedAll(full);
  const c = (iso || '').toUpperCase();
  return c ? all.filter(t => t.country === c) : all;
}
// ทัวร์เดียว (หน้ารายละเอียด) — ดึงแค่ซัพเดียว payload เล็ก เร็วกว่ารวมทั้งฟีดมาก
async function fetchOne(id) {
  try {
    const r = await fetch(`${SITE}/api/tour-feed?one=${encodeURIComponent(id)}`);
    const a = await r.json();
    return Array.isArray(a) ? (a[0] || null) : null;
  } catch { return null; }
}
const pb = (obj) => 'a=' + encodeURIComponent(JSON.stringify(obj));
const unpb = (data) => { try { return JSON.parse(decodeURIComponent((data || '').replace(/^a=/, ''))); } catch { return {}; } };

// รหัสเอเจนท์ WeCraft (ซ่อนรหัสซัพ) — สูตรเดียวกับฝั่งเว็บ (src/lib/agentCode.js)
function agentCode(t) {
  const id = String((t && t.id) || '');
  if (!id.startsWith('sup_')) return (t && t.code) || '';
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const iso = String((t && t.country) || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  return 'WC' + iso + h.toString(36).toUpperCase().padStart(6, '0').slice(-5);
}

// ── Supabase session (จำว่าลูกค้ากำลังจองทัวร์ไหน — ไม่เก็บข้อมูลส่วนตัว) ──
const SB_URL = process.env.VITE_SUPABASE_URL, SB_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const sbH = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };
async function getSession(uid) {
  if (!SB_URL || !uid) return null;
  try {
    const a = await (await fetch(`${SB_URL}/rest/v1/line_sessions?user_id=eq.${encodeURIComponent(uid)}&select=*`, { headers: sbH })).json();
    const row = Array.isArray(a) ? a[0] : null;
    // session ค้างเกิน 30 นาที → ทิ้ง (กันรหัส/เมนูโดนกินเข้า wizard)
    if (row && row.created_at && Date.now() - new Date(row.created_at).getTime() > 30 * 60 * 1000) { await delSession(uid); return null; }
    return row;
  } catch { return null; }
}
async function setSession(uid, state) {
  if (!SB_URL || !uid) return;
  try { await fetch(`${SB_URL}/rest/v1/line_sessions`, { method: 'POST', headers: { ...sbH, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: uid, state, created_at: new Date().toISOString() }) }); } catch {}
}
async function delSession(uid) {
  if (!SB_URL || !uid) return;
  try { await fetch(`${SB_URL}/rest/v1/line_sessions?user_id=eq.${encodeURIComponent(uid)}`, { method: 'DELETE', headers: sbH }); } catch {}
}

// ── Wizard ถามทีละข้อ ────────────────────────────────────────────
// ลำดับคำถาม: name → phone → pax → round → email → confirm
const STEPS = {
  name:  { next: 'phone', ask: '(1/5) กรุณาพิมพ์ 👤 ชื่อ-นามสกุล ผู้จองครับ' },
  phone: { next: 'pax',   ask: '(2/5) ขอ 📱 เบอร์โทรติดต่อครับ' },
  pax:   { next: 'round', ask: '(3/5) เดินทางกี่ท่านครับ? 👥 (เช่น 2 ผู้ใหญ่)' },
  round: { next: 'email', ask: '(4/5) สนใจเดินทาง 📅 รอบ/เดือนไหนครับ? (เช่น ธันวาคม)' },
  email: { next: 'confirm', ask: '(5/5) 📧 อีเมล (ถ้าไม่มี พิมพ์ - เพื่อข้าม)' },
};
// (4/5) คำถามรอบเดินทาง — ดึงรอบจริงมาเป็นปุ่มให้กด
async function roundQuestion(st) {
  const t = await fetchOne(st.tour_id) || (await fetchFeed(st.tour_country, true)).find(x => x.id === st.tour_id);
  const dates = [...new Set((t?.deps || []).map(d => fmtDate(d.date)).filter(Boolean))].slice(0, 11);
  const items = dates.map(dt => ({ type: 'action', action: { type: 'message', label: dt.slice(0, 20), text: dt } }));
  items.push({ type: 'action', action: { type: 'message', label: 'เดือนอื่น/สอบถาม', text: 'ยังไม่ระบุ' } });
  return { type: 'text', text: '(4/5) เลือก 📅 รอบเดินทางที่สะดวกครับ (แตะเลือกได้เลย)', quickReply: { items: items.slice(0, 13) } };
}

async function submitBooking(st) {
  let via = 'LINE OA';
  if (st.uid) { const dn = await getName(st.uid); via = `LINE OA${dn ? ` (${dn})` : ''} · userId:${st.uid}`; }
  const formData = {
    _type: 'join-tour', fullName: st.name, phone: st.phone, email: st.email || '',
    tourCode: st.tour_id || '', tourName: st.tour_name || '', adults: st.pax || '',
    note: `รอบ/เดือน: ${st.round || '-'} | ช่องทาง: ${via}`,
  };
  const html = `<h3>🌏 จองจอยทัวร์ (ผ่าน LINE OA)</h3>
    <p><b>ทัวร์:</b> ${st.tour_name || '-'}<br>
    <b>ชื่อ:</b> ${st.name}<br><b>เบอร์:</b> ${st.phone}<br>
    <b>จำนวน:</b> ${st.pax || '-'}<br><b>รอบ/เดือน:</b> ${st.round || '-'}<br>
    <b>อีเมล:</b> ${st.email || '-'}</p>`;
  try {
    const j = await (await fetch(`${SITE}/api/send-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: `[LINE] จองจอยทัวร์ - ${st.tour_name || ''}`, html, formData, customerEmail: st.email || undefined }) })).json();
    return j.seqNo || null;
  } catch { return null; }
}

// ── การ์ดเลือกประเทศ (รูปสถานที่จริง + ธง) ───────────────────────
function heroImg(image, iso) {
  // URL แลนด์มาร์ก (Wikimedia) encode สมบูรณ์แล้ว → ห้ามผ่าน img()/encodeURI ซ้ำ (จะ double-encode %→%25 แล้ว 404)
  return image
    ? { type: 'image', url: image, size: 'full', aspectRatio: '20:13', aspectMode: 'cover' }
    : { type: 'image', url: `https://flagcdn.com/w400/${iso.toLowerCase()}.png`, size: 'full', aspectRatio: '20:13', aspectMode: 'fit', backgroundColor: '#f4f4f5' };
}
function countryBubble(iso, n) {
  return {
    type: 'bubble',
    hero: heroImg(COUNTRY_IMG[iso], iso),
    body: { type: 'box', layout: 'vertical', spacing: 'xs', contents: [
      { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
        { type: 'icon', url: `https://flagcdn.com/w40/${iso.toLowerCase()}.png`, size: 'lg' },
        { type: 'text', text: nameOf(iso), weight: 'bold', size: 'lg', color: '#1a2b3c', flex: 0 },
      ] },
      { type: 'text', text: `${n} โปรแกรม`, size: 'sm', color: '#999999' },
    ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'postback', label: 'ดูทัวร์', data: pb({ s: 'country', iso }), displayText: `ทัวร์${nameOf(iso)}` } },
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
    hero: heroImg(CITY_IMG[city] || COUNTRY_IMG[iso], iso),
    body: { type: 'box', layout: 'vertical', spacing: 'xs', contents: [
      { type: 'text', text: `📍 ${label}`, weight: 'bold', size: 'md', color: '#1a2b3c', wrap: true },
      { type: 'text', text: `${n} โปรแกรม`, size: 'sm', color: '#999999' },
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
    hero: { type: 'image', url: img(t.image), size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
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
// การ์ด "ดูทัวร์เพิ่มเติม" (บับเบิลสุดท้าย เมื่อทัวร์เกิน 1 หน้า)
function moreBubble(iso, city, nextPage, remaining) {
  return {
    type: 'bubble',
    body: { type: 'box', layout: 'vertical', justifyContent: 'center', alignItems: 'center', spacing: 'md', contents: [
      { type: 'text', text: '➕', size: '3xl', align: 'center' },
      { type: 'text', text: `ดูทัวร์เพิ่มเติม`, weight: 'bold', size: 'lg', color: '#0f9d8f', align: 'center', wrap: true },
      { type: 'text', text: `เหลืออีก ${remaining} โปรแกรม`, size: 'sm', color: '#999999', align: 'center' },
    ] },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'primary', color: '#0f9d8f', height: 'sm', action: { type: 'postback', label: 'ดูเพิ่มเติม →', data: pb({ s: 'tours', iso, city, p: nextPage }), displayText: 'ดูทัวร์เพิ่มเติม' } },
    ] },
  };
}
async function tourCarousel(iso, city, feed, page) {
  const list = feed || await fetchFeed(iso);
  const filtered = city ? list.filter(t => (t.name || '').includes(city)) : list;
  if (!filtered.length) return { type: 'text', text: 'ยังไม่มีทัวร์เส้นทางนี้ ลองเลือกใหม่นะครับ 🙏' };
  const PER = 11, pg = Math.max(0, +page || 0), start = pg * PER;
  const bubbles = filtered.slice(start, start + PER).map(t => tourBubble(t, iso));
  const remaining = filtered.length - (start + PER);
  if (remaining > 0) bubbles.push(moreBubble(iso, city, pg + 1, remaining));
  if (!bubbles.length) return { type: 'text', text: 'ดูครบทุกโปรแกรมแล้วครับ 🙏' };
  const shown = Math.min(start + PER, filtered.length);
  return { type: 'flex', altText: `ทัวร์${city || nameOf(iso)} (${start + 1}-${shown}/${filtered.length})`, contents: { type: 'carousel', contents: bubbles } };
}

// ── รายละเอียดทัวร์ (ในไลน์ · ละเอียดเหมือนเว็บ) ─────────────────
function infoRow(label, val) {
  return { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
    { type: 'text', text: label, size: 'sm', color: '#999999', flex: 2 },
    { type: 'text', text: String(val), size: 'sm', color: '#333333', flex: 4, weight: 'bold', wrap: true, align: 'end' } ] };
}
async function tourDetail(iso, id, uid) {
  const t = await fetchOne(id) || (await fetchFeed(iso, true)).find(x => x.id === id);
  if (!t) return { type: 'text', text: 'ไม่พบข้อมูลทัวร์นี้ ลองเลือกใหม่นะครับ 🙏' };
  return renderDetail(t, uid);
}
// ลิงก์ฟอร์มจอง (เปิดในเบราว์เซอร์ในไลน์) — พก id/iso/uid + ชื่อ/รหัส/ราคา ไปให้หน้าจองเรนเดอร์ทันที (ไม่หมุนรอ)
function bookUrl(id, iso, uid, t) {
  const q = new URLSearchParams({ id: id || '', iso: iso || '', uid: uid || '' });
  if (t) { const wc = agentCode(t); if (wc) q.set('code', wc); if (t.name) q.set('name', t.name); if (t.price) q.set('price', String(t.price)); }
  return `${SITE}/book.html?${q.toString()}`;
}
// ลิงก์ PDF ผ่านพร็อกซีเรา — ซ่อน URL ต้นทางของซัพพลายเออร์
function pdfProxy(pdf) {
  return `${SITE}/api/tour-pdf-alt?v=3&u=${Buffer.from(String(pdf || '')).toString('base64url')}`;
}
// ค้นทัวร์จากรหัสโปรแกรม (ยืดหยุ่น — ตัดขีด/เว้นวรรคออกเทียบ)
async function findByCode(q) {
  const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const Q = norm(q);
  if (Q.length < 3) return null;
  const all = await fetchFeed('', true);
  // ค้นได้เฉพาะรหัสเอเจนท์ WeCraft เท่านั้น (รหัสซัพเดิมค้นไม่เจอฝั่งลูกค้า)
  return all.find(t => norm(agentCode(t)) === Q)
    || (Q.length >= 4 ? all.find(t => norm(agentCode(t)).includes(Q)) : null);
}
function renderDetail(t, uid) {
  const iso = t.country || '';
  const id = t.id;
  const body = [
    { type: 'text', text: t.name, weight: 'bold', size: 'md', wrap: true },
  ];
  // แถวรหัส + โรงแรม
  const tags = [];
  if (t.code) tags.push({ type: 'text', text: agentCode(t), size: 'xs', color: '#0f9d8f', flex: 0 });
  if (t.hotel) tags.push({ type: 'text', text: `${'⭐'.repeat(Math.min(5, t.hotel))} ${t.hotel} ดาว`, size: 'xs', color: '#f5a623', align: 'end' });
  if (tags.length) body.push({ type: 'box', layout: 'baseline', spacing: 'sm', margin: 'sm', contents: tags });

  // ราคาเริ่มต้น
  body.push({ type: 'box', layout: 'baseline', margin: 'md', contents: [
    { type: 'text', text: 'ราคาเริ่มต้น', size: 'sm', color: '#999999', flex: 0 },
    { type: 'text', text: `${baht(t.price)} /ท่าน`, size: 'xl', weight: 'bold', color: '#e2231a', align: 'end' } ] });
  body.push({ type: 'separator', margin: 'md' });

  // ข้อมูลทั่วไป
  if (t.days) body.push(infoRow('ระยะเวลา', `${t.days} วัน${t.night ? ` ${t.night} คืน` : ''}`));
  if (t.airline) body.push(infoRow('สายการบิน', t.airline));
  if (t.deps?.length) body.push(infoRow('รอบเดินทาง', `${t.deps.length}+ รอบ`));

  // ไฮไลต์ (ถ้ามี)
  const cleanHl = stripHtml(t.highlight);
  if (cleanHl) {
    const hl = cleanHl.replace(/\s*,\s*/g, ' · ').slice(0, 180);
    body.push({ type: 'separator', margin: 'md' },
      { type: 'text', text: '✨ ไฮไลต์', size: 'sm', weight: 'bold', color: '#0f9d8f', margin: 'md' },
      { type: 'text', text: hl, size: 'xs', color: '#555555', wrap: true });
  }

  // ตารางรอบเดินทาง + ราคา (ผู้ใหญ่/เด็ก/พักเดี่ยว/ที่นั่ง) — แสดงครบทุกรอบจนจบ
  if (t.deps?.length) {
    body.push({ type: 'separator', margin: 'md' },
      { type: 'text', text: `📅 รอบเดินทาง / ราคา (${t.deps.length} รอบ)`, size: 'sm', weight: 'bold', color: '#0f9d8f', margin: 'md' });
    const showDeps = t.deps.slice(0, 40);
    for (const d of showDeps) {
      const sub = [];
      if (d.child) sub.push(`เด็ก ${baht(d.child)}`);
      if (d.single) sub.push(`พักเดี่ยว +${baht(d.single)}`);
      if (d.seat != null) sub.push(`ว่าง ${d.seat}`);
      body.push({ type: 'box', layout: 'vertical', margin: 'sm', spacing: 'none', contents: [
        { type: 'box', layout: 'baseline', contents: [
          { type: 'text', text: fmtDate(d.date) + (d.ret ? ` - ${fmtDate(d.ret)}` : ''), size: 'sm', color: '#333333', flex: 5, weight: 'bold', wrap: true },
          { type: 'text', text: baht(d.adult), size: 'sm', color: '#e2231a', weight: 'bold', align: 'end', flex: 3 } ] },
        sub.length ? { type: 'text', text: sub.join(' · '), size: 'xxs', color: '#999999' } : { type: 'filler' },
      ] });
    }
    if (t.deps.length > 40) body.push({ type: 'text', text: `+ อีก ${t.deps.length - 40} รอบ — ดูในโปรแกรมเต็ม (PDF)`, size: 'xxs', color: '#999999', margin: 'sm', wrap: true });
    body.push({ type: 'text', text: 'ราคาผู้ใหญ่ (พักคู่) · ภาษาไทย', size: 'xxs', color: '#bbbbbb', margin: 'sm' });
  }

  const footerBtns = [
    { type: 'button', style: 'primary', color: '#e2231a', height: 'sm', action: { type: 'uri', label: '🎫 จองทัวร์นี้', uri: bookUrl(id, iso, uid, t) } },
  ];
  if (t.pdf) footerBtns.push({ type: 'button', style: 'secondary', height: 'sm', action: { type: 'uri', label: 'โปรแกรมเต็ม (PDF)', uri: pdfProxy(t.pdf) } });
  footerBtns.push({ type: 'button', style: 'link', height: 'sm', action: { type: 'postback', label: '← ดูทัวร์อื่น', data: pb({ s: 'tours', iso, city: '' }), displayText: 'ดูทัวร์อื่น' } });

  return {
    type: 'flex', altText: `รายละเอียด: ${t.name}`,
    contents: {
      type: 'bubble',
      hero: { type: 'image', url: img(t.image), size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
      body: { type: 'box', layout: 'vertical', spacing: 'sm', contents: body },
      footer: { type: 'box', layout: 'vertical', spacing: 'sm', contents: footerBtns },
    },
  };
}

// ── กด "จองทัวร์นี้" → เริ่ม wizard ถามทีละข้อ ───────────────────
async function handleBook(ev, iso, id) {
  const list = await fetchFeed(iso);
  const t = list.find(x => x.id === id);
  const uid = ev.source?.userId || '';
  await setSession(uid, { tour_id: t?.id || id, tour_name: t?.name || '', tour_country: iso, step: 'name', uid });
  await reply(ev.replyToken, [
    { type: 'text', text: `🎫 ${t?.name || ''}\nราคาเริ่มต้น ${baht(t?.price)}\n\nเริ่มจองเลยครับ 😊 (พิมพ์ "ยกเลิก" ได้ตลอด)` },
    { type: 'text', text: STEPS.name.ask },
  ]);
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
      // ── ตอบเฉพาะแชท 1:1 เท่านั้น · ในกลุ่ม/รูม บอทเงียบสนิท ไม่ตอบโต้ใดๆ ──
      // (การแจ้งเตือนการจองเข้ากลุ่มใช้ push จาก send-email แยกต่างหาก ไม่เกี่ยวกับ webhook นี้)
      if (ev.source && ev.source.type && ev.source.type !== 'user') return;

      // ── Postback (กดปุ่มในการ์ด) ──
      if (ev.type === 'postback') {
        const d = unpb(ev.postback?.data);
        const uid = ev.source?.userId || '';
        if (d.s === 'country') return reply(ev.replyToken, await cityChooser(d.iso));
        if (d.s === 'tours')   return reply(ev.replyToken, await tourCarousel(d.iso, d.city || '', null, d.p || 0));
        if (d.s === 'detail')  return reply(ev.replyToken, await tourDetail(d.iso, d.id, uid));
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
        const uid = ev.source?.userId;

        // 0) กำลังจองอยู่ → wizard ถามทีละข้อ
        const sess = await getSession(uid);
        if (sess && sess.state) {
          const st = sess.state;
          if (/^\s*ยกเลิก\s*$|^cancel$/i.test(text)) { await delSession(uid); return reply(ev.replyToken, { type: 'text', text: 'ยกเลิกการจองแล้วครับ 🙏 กดเมนู "จองจอยทัวร์" เพื่อเริ่มใหม่ได้เลย' }); }

          // ── รับคำตอบตาม step ──
          if (st.step === 'name')  { st.name = text; }
          else if (st.step === 'phone') { if (text.replace(/\D/g, '').length < 9) return reply(ev.replyToken, { type: 'text', text: 'เบอร์โทรไม่ถูกต้องครับ 🙏 พิมพ์เบอร์ใหม่อีกครั้ง (เช่น 0812345678)' }); st.phone = text.replace(/[^\d]/g, ''); }
          else if (st.step === 'pax')   { st.pax = text; }
          else if (st.step === 'round') { st.round = text; }
          else if (st.step === 'email') { st.email = (text.trim() === '-') ? '' : text.trim(); }
          else if (st.step === 'confirm') {
            if (/^\s*แก้ไข\s*$/.test(text)) { st.step = 'name'; await setSession(uid, st); return reply(ev.replyToken, { type: 'text', text: 'เริ่มกรอกใหม่ครับ\n\n' + STEPS.name.ask }); }
            if (/ยืนยัน|confirm|โอเค|ตกลง|ok/i.test(text)) {
              const seq = await submitBooking(st);
              await delSession(uid);
              return reply(ev.replyToken, { type: 'text',
                text: `✅ จองเรียบร้อยแล้วครับ!${seq ? `\nเลขที่จอง: ${seq}` : ''}\n\n🎫 ${st.tour_name}\n👤 ${st.name} · ${st.phone}\n\nทีมงานได้รับแจ้งทางอีเมล + LINE แล้ว จะติดต่อกลับโดยเร็วที่สุดครับ\nขอบคุณที่ใช้บริการ WeCraft Travel 🙏` });
            }
            return reply(ev.replyToken, { type: 'text', text: 'แตะ "✅ ยืนยันจอง" เพื่อจอง หรือ "แก้ไข"/"ยกเลิก" ครับ 🙏' });
          }

          // ── ถามคำถามถัดไป / สรุป ──
          const stepInfo = STEPS[st.step];
          st.step = stepInfo ? stepInfo.next : 'confirm';
          await setSession(uid, st);
          if (st.step === 'round') return reply(ev.replyToken, await roundQuestion(st));
          if (st.step === 'confirm') {
            return reply(ev.replyToken, { type: 'text',
              text: `📋 ตรวจสอบข้อมูลจอง:\n\n🎫 ${st.tour_name}\n👤 ชื่อ: ${st.name}\n📱 เบอร์: ${st.phone}\n👥 จำนวน: ${st.pax || '-'}\n📅 รอบ/เดือน: ${st.round || '-'}\n📧 อีเมล: ${st.email || '-'}\n\nถูกต้องไหมครับ?`,
              quickReply: { items: [
                { type: 'action', action: { type: 'message', label: '✅ ยืนยันจอง', text: 'ยืนยัน' } },
                { type: 'action', action: { type: 'message', label: '✏️ แก้ไข', text: 'แก้ไข' } },
                { type: 'action', action: { type: 'message', label: '❌ ยกเลิก', text: 'ยกเลิก' } },
              ] } });
          }
          return reply(ev.replyToken, { type: 'text', text: STEPS[st.step].ask });
        }

        // 1) เลือกประเทศ / เมนู
        const hitIso = Object.keys(CODE_TH).sort((a, b) => CODE_TH[b].length - CODE_TH[a].length).find(iso => text.includes(CODE_TH[iso]));
        if (hitIso) return reply(ev.replyToken, await cityChooser(hitIso));
        if (/จองจอยทัวร์|จอยทัวร์|ดูทัวร์|เลือกทัวร์|ทัวร์/i.test(text)) return reply(ev.replyToken, await countryChooser());

        // 2) พิมพ์รหัสโปรแกรมทัวร์ → แสดงทัวร์นั้นเลย (ข้อความอังกฤษ/ตัวเลข ≥3)
        if (!/[฀-๿]/.test(text) && text.replace(/\s/g, '').length >= 3) {
          const t = await findByCode(text);
          if (t) return reply(ev.replyToken, renderDetail(t, uid));
          return reply(ev.replyToken, { type: 'text', text: `ไม่พบทัวร์รหัส "${text}" ที่เปิดจองอยู่ครับ 🙏\n\nอาจเป็นเพราะรอบนี้ปิดรับ/เดินทางไปแล้ว หรือพิมพ์รหัสไม่ตรง\nลองกดเมนู "จองจอยทัวร์" เพื่อดูทัวร์ที่เปิดจองล่าสุดได้เลยครับ 😊` });
        }

        return reply(ev.replyToken, { type: 'text', text: 'สนใจดูทัวร์ กดเมนู "จองจอยทัวร์" ด้านล่างได้เลยครับ 😊' });
      }
    } catch (e) { console.error('[LINE] event error:', e.message); }
  }));

  return res.status(200).send('ok');
};

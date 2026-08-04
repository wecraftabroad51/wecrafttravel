// ── ตัวช่วยจัดประเภททัวร์ (ใช้ร่วมกัน: หน้าทัวร์ + เซลเพจ) ──
export const LOWCOST_KW = ['airasia','air asia','แอร์เอเชีย','แอร์เอเซีย','นกแอร์','นกสกู๊ต','scoot','สกู๊ต','ไลอ้อน','ไลออน','lion air','vietjet','เวียตเจ็ท','เวียตเจ็ต','เวียดเจ็ท','เวียดเจ็ต','jetstar','เจ็ทสตาร์','cebu','เซบู','springairlines','spring airlines','batik','บาติก','ไทยไลอ้อน','นกสกูต','peach','ราคาประหยัด','โลว์คอส','low cost'];
export const FULL_KW    = ['thai airways','การบินไทย','bangkok airways','บางกอกแอร์เวย์','อีวีเอ','eva air','china airlines','ไชน่าแอร์ไลน์','japan airlines','การบินญี่ปุ่น','all nippon','cathay','คาเธ่ย์','คาเธย์','singapore airlines','สิงคโปร์แอร์ไลน์','emirates','เอมิเรตส์','qatar airways','กาตาร์','การ์ต้า','turkish','เตอร์กิช','korean air','โคเรียนแอร์','asiana','อาเซียน่า','air china','แอร์ไชน่า','china eastern','china southern','malaysia airlines','มาเลเซียแอร์ไลน์','vietnam airlines','เวียดนามแอร์ไลน์','garuda','oman air','โอมานแอร์',' full service','ฟูลเซอร์วิส','ฟูลเซอร์วิ'];
export const LOWCOST_CODES = ['fd','sl','dd','xw','xj','vz','tr','jw','ak','qz','vj','5j','9c','jt','ip','z2'];
export const FULL_CODES    = ['tg','pg','br','ci','jl','nh','cx','sq','ek','qr','tk','ke','oz','ca','mu','cz','mh','vn','ga','wy','sc','ja'];

export const tourNameLC = (tr) => (tr.name?.th || tr.name?.en || '').toLowerCase();

// ระดับโรงแรม (ดาว) — ใช้ฟิลด์ถ้ามี ไม่งั้นอ่านจากชื่อ "พัก 4 ดาว"
export const hotelStarsOf = (tr) => {
  const f = parseInt(tr._hotelStars, 10);
  if (f >= 1 && f <= 5) return f;
  const m = tourNameLC(tr).match(/([3-5])\s*(?:ดาว|star)/);
  return m ? parseInt(m[1], 10) : null;
};

// ประเภทสายการบิน: 'full' | 'low' | null (แยกจากฟิลด์ก่อน แล้วค่อยดูชื่อทัวร์)
export const airlineClass = (tr) => {
  const a = (tr.airline || '').toLowerCase().trim();
  if (a) {
    if (LOWCOST_CODES.includes(a) || LOWCOST_KW.some(k => a.includes(k))) return 'low';
    if (FULL_CODES.includes(a)    || FULL_KW.some(k => a.includes(k)))    return 'full';
  }
  const nm = tourNameLC(tr);
  if (LOWCOST_KW.some(k => k.length >= 4 && nm.includes(k))) return 'low';
  if (FULL_KW.some(k => k.length >= 6 && nm.includes(k)))    return 'full';
  return null;
};

export const itinText = (tr) => (tr.itinerary || []).map(d => d.detail || d.desc || '').join(' ').toLowerCase();
// "วันอิสระ" กับ "ฟรีเดย์" = ความหมายเดียวกัน — ควบรวมทุกแบบการเขียน (สะกด/เว้นวรรคต่างกัน)
export const FREEDAY_RE = /อิสระ|ฟรี\s*เดย?|freeday|free\s*day|free\s*&?\s*easy|free\s*and\s*easy|free\s*time|at\s*leisure/i;
export const hasFreeDay = (tr) => FREEDAY_RE.test(tourNameLC(tr) + ' ' + itinText(tr));
export const isNoShop   = (tr) => /ไม่ลงร้าน|ไม่เข้าร้าน|ไม่มีร้าน|no\s*shop/.test(tourNameLC(tr));
export const isShop     = (tr) => /ลงร้าน|เข้าร้าน/.test(tourNameLC(tr)) && !isNoShop(tr);

export const PRICE_BUCKETS = {
  'lt20':  (p) => p > 0 && p < 20000,
  '20-35': (p) => p >= 20000 && p < 35000,
  '35-50': (p) => p >= 35000 && p < 50000,
  'gt50':  (p) => p >= 50000,
};
export const DUR_BUCKETS = {
  '1-2': (d) => d >= 1 && d <= 2,
  '3-4': (d) => d >= 3 && d <= 4,
  '5-6': (d) => d >= 5 && d <= 6,
  '7+':  (d) => d >= 7,
};


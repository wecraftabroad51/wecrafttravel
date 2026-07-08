// ── Country registry สำหรับ mega-menu ─────────────────────────────
// ธง + ชื่อ TH/EN + กลุ่มทวีป (แบบ Sanook) — ใช้จับคู่นับจำนวนทัวร์จริง

export const MENU_GROUPS = [
  { id: 'asia',    th: 'เอเชีย',                en: 'Asia' },
  { id: 'europe',  th: 'ยุโรป',                 en: 'Europe' },
  { id: 'americas',th: 'อเมริกา',               en: 'Americas' },
  { id: 'mideast', th: 'ตะวันออกกลาง',          en: 'Middle East' },
  { id: 'africa',  th: 'แอฟริกา',               en: 'Africa' },
  { id: 'oceania', th: 'ออสเตรเลีย · นิวซีแลนด์', en: 'Australia · NZ' },
];

// code → { flag, th, en, group }
export const COUNTRIES = {
  // ── เอเชีย ──────────────────────────────────────────────
  JP: { flag: '🇯🇵', th: 'ญี่ปุ่น',       en: 'Japan',        group: 'asia' },
  CN: { flag: '🇨🇳', th: 'จีน',           en: 'China',        group: 'asia' },
  HK: { flag: '🇭🇰', th: 'ฮ่องกง',        en: 'Hong Kong',    group: 'asia' },
  MO: { flag: '🇲🇴', th: 'มาเก๊า',        en: 'Macau',        group: 'asia' },
  KR: { flag: '🇰🇷', th: 'เกาหลีใต้',     en: 'South Korea',  group: 'asia' },
  TW: { flag: '🇹🇼', th: 'ไต้หวัน',       en: 'Taiwan',       group: 'asia' },
  SG: { flag: '🇸🇬', th: 'สิงคโปร์',      en: 'Singapore',    group: 'asia' },
  VN: { flag: '🇻🇳', th: 'เวียดนาม',      en: 'Vietnam',      group: 'asia' },
  MY: { flag: '🇲🇾', th: 'มาเลเซีย',      en: 'Malaysia',     group: 'asia' },
  ID: { flag: '🇮🇩', th: 'อินโดนีเซีย',   en: 'Indonesia',    group: 'asia' },
  PH: { flag: '🇵🇭', th: 'ฟิลิปปินส์',    en: 'Philippines',  group: 'asia' },
  MM: { flag: '🇲🇲', th: 'พม่า',          en: 'Myanmar',      group: 'asia' },
  KH: { flag: '🇰🇭', th: 'กัมพูชา',       en: 'Cambodia',     group: 'asia' },
  LA: { flag: '🇱🇦', th: 'ลาว',           en: 'Laos',         group: 'asia' },
  BN: { flag: '🇧🇳', th: 'บรูไน',         en: 'Brunei',       group: 'asia' },
  IN: { flag: '🇮🇳', th: 'อินเดีย',       en: 'India',        group: 'asia' },
  NP: { flag: '🇳🇵', th: 'เนปาล',         en: 'Nepal',        group: 'asia' },
  LK: { flag: '🇱🇰', th: 'ศรีลังกา',      en: 'Sri Lanka',    group: 'asia' },
  MV: { flag: '🇲🇻', th: 'มัลดีฟส์',      en: 'Maldives',     group: 'asia' },
  MN: { flag: '🇲🇳', th: 'มองโกเลีย',     en: 'Mongolia',     group: 'asia' },
  KZ: { flag: '🇰🇿', th: 'คาซัคสถาน',     en: 'Kazakhstan',   group: 'asia' },
  KG: { flag: '🇰🇬', th: 'คีร์กีซสถาน',   en: 'Kyrgyzstan',   group: 'asia' },
  UZ: { flag: '🇺🇿', th: 'อุซเบกิสถาน',   en: 'Uzbekistan',   group: 'asia' },
  BT: { flag: '🇧🇹', th: 'ภูฏาน',         en: 'Bhutan',       group: 'asia' },

  // ── ยุโรป ───────────────────────────────────────────────
  FR: { flag: '🇫🇷', th: 'ฝรั่งเศส',      en: 'France',       group: 'europe' },
  IT: { flag: '🇮🇹', th: 'อิตาลี',        en: 'Italy',        group: 'europe' },
  CH: { flag: '🇨🇭', th: 'สวิตเซอร์แลนด์', en: 'Switzerland', group: 'europe' },
  DE: { flag: '🇩🇪', th: 'เยอรมนี',       en: 'Germany',      group: 'europe' },
  GB: { flag: '🇬🇧', th: 'อังกฤษ',        en: 'UK',           group: 'europe' },
  ES: { flag: '🇪🇸', th: 'สเปน',          en: 'Spain',        group: 'europe' },
  PT: { flag: '🇵🇹', th: 'โปรตุเกส',      en: 'Portugal',     group: 'europe' },
  AT: { flag: '🇦🇹', th: 'ออสเตรีย',      en: 'Austria',      group: 'europe' },
  NL: { flag: '🇳🇱', th: 'เนเธอร์แลนด์',  en: 'Netherlands',  group: 'europe' },
  BE: { flag: '🇧🇪', th: 'เบลเยียม',      en: 'Belgium',      group: 'europe' },
  NO: { flag: '🇳🇴', th: 'นอร์เวย์',      en: 'Norway',       group: 'europe' },
  SE: { flag: '🇸🇪', th: 'สวีเดน',        en: 'Sweden',       group: 'europe' },
  DK: { flag: '🇩🇰', th: 'เดนมาร์ก',      en: 'Denmark',      group: 'europe' },
  FI: { flag: '🇫🇮', th: 'ฟินแลนด์',      en: 'Finland',      group: 'europe' },
  IS: { flag: '🇮🇸', th: 'ไอซ์แลนด์',     en: 'Iceland',      group: 'europe' },
  GR: { flag: '🇬🇷', th: 'กรีซ',          en: 'Greece',       group: 'europe' },
  TR: { flag: '🇹🇷', th: 'ตุรกี',         en: 'Turkey',       group: 'europe' },
  RU: { flag: '🇷🇺', th: 'รัสเซีย',       en: 'Russia',       group: 'europe' },
  CZ: { flag: '🇨🇿', th: 'สาธารณรัฐเช็ก', en: 'Czechia',      group: 'europe' },
  PL: { flag: '🇵🇱', th: 'โปแลนด์',       en: 'Poland',       group: 'europe' },
  HR: { flag: '🇭🇷', th: 'โครเอเชีย',     en: 'Croatia',      group: 'europe' },
  RO: { flag: '🇷🇴', th: 'โรมาเนีย',      en: 'Romania',      group: 'europe' },
  BG: { flag: '🇧🇬', th: 'บัลแกเรีย',     en: 'Bulgaria',     group: 'europe' },
  MT: { flag: '🇲🇹', th: 'มอลตา',         en: 'Malta',        group: 'europe' },

  // ── อเมริกา ─────────────────────────────────────────────
  US: { flag: '🇺🇸', th: 'อเมริกา',       en: 'USA',          group: 'americas' },
  CA: { flag: '🇨🇦', th: 'แคนาดา',        en: 'Canada',       group: 'americas' },
  MX: { flag: '🇲🇽', th: 'เม็กซิโก',      en: 'Mexico',       group: 'americas' },
  BR: { flag: '🇧🇷', th: 'บราซิล',        en: 'Brazil',       group: 'americas' },
  AR: { flag: '🇦🇷', th: 'อาร์เจนตินา',   en: 'Argentina',    group: 'americas' },
  CL: { flag: '🇨🇱', th: 'ชิลี',          en: 'Chile',        group: 'americas' },
  PE: { flag: '🇵🇪', th: 'เปรู',          en: 'Peru',         group: 'americas' },

  // ── ตะวันออกกลาง ────────────────────────────────────────
  AE: { flag: '🇦🇪', th: 'สหรัฐอาหรับเอมิเรตส์', en: 'UAE',   group: 'mideast' },
  SA: { flag: '🇸🇦', th: 'ซาอุดีอาระเบีย', en: 'Saudi Arabia', group: 'mideast' },
  QA: { flag: '🇶🇦', th: 'กาตาร์',        en: 'Qatar',        group: 'mideast' },
  JO: { flag: '🇯🇴', th: 'จอร์แดน',       en: 'Jordan',       group: 'mideast' },
  IL: { flag: '🇮🇱', th: 'อิสราเอล',      en: 'Israel',       group: 'mideast' },
  IR: { flag: '🇮🇷', th: 'อิหร่าน',       en: 'Iran',         group: 'mideast' },
  OM: { flag: '🇴🇲', th: 'โอมาน',         en: 'Oman',         group: 'mideast' },

  // ── แอฟริกา ─────────────────────────────────────────────
  EG: { flag: '🇪🇬', th: 'อียิปต์',       en: 'Egypt',        group: 'africa' },
  MA: { flag: '🇲🇦', th: 'โมร็อกโก',      en: 'Morocco',      group: 'africa' },
  ZA: { flag: '🇿🇦', th: 'แอฟริกาใต้',    en: 'South Africa', group: 'africa' },
  KE: { flag: '🇰🇪', th: 'เคนยา',         en: 'Kenya',        group: 'africa' },
  TZ: { flag: '🇹🇿', th: 'แทนซาเนีย',     en: 'Tanzania',     group: 'africa' },
  TN: { flag: '🇹🇳', th: 'ตูนิเซีย',      en: 'Tunisia',      group: 'africa' },
  NA: { flag: '🇳🇦', th: 'นามิเบีย',      en: 'Namibia',      group: 'africa' },

  // ── ออสเตรเลีย / นิวซีแลนด์ ─────────────────────────────
  AU: { flag: '🇦🇺', th: 'ออสเตรเลีย',    en: 'Australia',    group: 'oceania' },
  NZ: { flag: '🇳🇿', th: 'นิวซีแลนด์',    en: 'New Zealand',  group: 'oceania' },
  FJ: { flag: '🇫🇯', th: 'ฟิจิ',          en: 'Fiji',         group: 'oceania' },
};

// จับคู่ th-name → code (เรียงชื่อยาวก่อน เพื่อ match ที่เฉพาะเจาะจงกว่า)
const NAME_CODE_PAIRS = Object.entries(COUNTRIES)
  .map(([code, c]) => ({ code, th: c.th }))
  .sort((a, b) => b.th.length - a.th.length);

// หา country code ของทัวร์ 1 รายการ (รองรับทั้ง supplier code + ชื่อไทย)
export function resolveCountryCode(tour) {
  const raw = tour.country;
  if (raw && COUNTRIES[raw]) return raw;                 // supplier: 'JP'
  const hay = [tour.country, tour.destination?.th, tour.destination?.en]
    .filter(Boolean).join(' ');
  if (!hay) return null;
  for (const { code, th } of NAME_CODE_PAIRS) {
    if (hay.includes(th)) return code;
  }
  return null;
}

// นับจำนวนทัวร์ต่อประเทศ แล้วจัดกลุ่มตามทวีป (เฉพาะประเทศที่มีทัวร์)
export function buildMenuGroups(allTours) {
  const counts = {};
  for (const tr of allTours) {
    const code = resolveCountryCode(tr);
    if (code) counts[code] = (counts[code] || 0) + 1;
  }
  return MENU_GROUPS.map(g => ({
    ...g,
    countries: Object.entries(COUNTRIES)
      .filter(([code, c]) => c.group === g.id && counts[code] > 0)
      .map(([code, c]) => ({ code, ...c, count: counts[code] }))
      .sort((a, b) => b.count - a.count),
  })).filter(g => g.countries.length > 0);
}

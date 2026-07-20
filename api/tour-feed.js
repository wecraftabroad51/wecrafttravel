// ── Feed ทัวร์แบบย่อ สำหรับ LINE Flex (id, name, image, price, country) ──
// GET /api/tour-feed        → ทั้งหมด
// GET /api/tour-feed?c=JP   → เฉพาะประเทศ
// ดึงผ่าน proxy /api/suppliers (พิสูจน์แล้วเวิร์ค + cache) กัน auth เพี้ยน
const SITE = 'https://wecraft-travel.com';

const SUP = { probooking: 'pb', wondergroup: 'pb', gs25tour: 'pb', checkingroup: 'pb', realjourney: 'pb', zego: 'zego', ttn: 'ttn', ttnplus: 'ttnplus', best: 'best', superb: 'superb', flyde: 'flyde' };

// FLY de WORLD: period_data = "pid|start(DD-MM-YYYY)|end|..|seat|..|price|..|price|..|note ;;; ..."
const FLYDE_IMG = 'https://flywholesales.com/backend/';
const flydeDate = s => { const m = String(s || '').match(/(\d{2})-(\d{2})-(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
function flydePeriods(str) {
  return String(str || '').split(';;;').filter(Boolean).map(seg => {
    const f = seg.split('|');
    return { date: flydeDate(f[1]), ret: flydeDate(f[2]), adult: parseFloat(f[10]) || 0, seat: Number(f[6]) || 0 };
  });
}

// Superb: promo field เป็น "NO"/"0"/ตัวเลข — แปลงเป็นเลข
const numOr0 = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

// BEST International: country_name_eng → ISO2
const BEST_ISO = { CHINA:'CN', JAPAN:'JP', KOREA:'KR', 'SOUTH KOREA':'KR', TAIWAN:'TW', CNXTAIWAN:'TW',
  'HONG KONG':'HK', HONGKONG:'HK', VIETNAM:'VN', 'VIET NAM':'VN', SINGAPORE:'SG', MALAYSIA:'MY',
  MYANMAR:'MM', LAOS:'LA', CAMBODIA:'KH', INDONESIA:'ID', PHILIPPINES:'PH', INDIA:'IN', 'SRI LANKA':'LK',
  NEPAL:'NP', BHUTAN:'BT', MALDIVES:'MV', KAZAKHSTAN:'KZ', UZBEKISTAN:'UZ', GEORGIA:'GE', TURKEY:'TR',
  JORDAN:'JO', EGYPT:'EG', DUBAI:'AE', UAE:'AE', 'SAUDI ARABIA':'SA', QATAR:'QA', OMAN:'OM',
  'SOUTH AFRICA':'ZA', KENYA:'KE', MOROCCO:'MA', EUROPE:'EU', ENGLAND:'GB', UK:'GB', 'UNITED KINGDOM':'GB',
  FRANCE:'FR', ITALY:'IT', SWITZERLAND:'CH', GERMANY:'DE', AUSTRIA:'AT', CZECH:'CZ', NORWAY:'NO',
  RUSSIA:'RU', SPAIN:'ES', PORTUGAL:'PT', GREECE:'GR', USA:'US', AMERICA:'US', 'UNITED STATES':'US',
  CANADA:'CA', AUSTRALIA:'AU', 'NEW ZEALAND':'NZ', ICELAND:'IS' };
// BEST date "MM/DD/YYYY" → "YYYY-MM-DD"
const bestDate = s => { const m = String(s || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` : ''; };

// TTN Plus P_LOCATION (อังกฤษ) → ISO2
const TTNPLUS_LOC = { CHINA:'CN', VIETNAM:'VN', TAIWAN:'TW', JAPAN:'JP', KOREA:'KR', 'SOUTH KOREA':'KR',
  HONGKONG:'HK', 'HONG KONG':'HK', EUROPE:'EU', SINGAPORE:'SG', MALAYSIA:'MY', MYANMAR:'MM', INDIA:'IN',
  DUBAI:'AE', UAE:'AE', TURKEY:'TR', GEORGIA:'GE', EGYPT:'EG', LAOS:'LA', CAMBODIA:'KH', INDONESIA:'ID',
  MACAU:'MO', MACAO:'MO', MALDIVES:'MV', KAZAKHSTAN:'KZ' };

// Thai country name → ISO2 (สำหรับ TTN ที่ระบุประเทศใน P_TAG)
const TH_ISO = { 'ญี่ปุ่น':'JP','เกาหลี':'KR','จีน':'CN','ฮ่องกง':'HK','มาเก๊า':'MO','ไต้หวัน':'TW',
  'เวียดนาม':'VN','สิงคโปร์':'SG','มาเลเซีย':'MY','พม่า':'MM','กัมพูชา':'KH','ลาว':'LA','อินโดนีเซีย':'ID',
  'อินเดีย':'IN','ดูไบ':'AE','ตุรกี':'TR','จอร์เจีย':'GE','อียิปต์':'EG','ยุโรป':'EU' };
function isoFromThai(text) { for (const [th, iso] of Object.entries(TH_ISO)) if ((text||'').includes(th)) return iso; return ''; }

// ISO3 → ISO2 (ซัพบางเจ้าใช้ ISO3 เช่น Real Journey: JPN, KAZ)
const ISO3TO2 = { JPN:'JP', CHN:'CN', KOR:'KR', TWN:'TW', HKG:'HK', VNM:'VN', SGP:'SG', MYS:'MY', MMR:'MM', THA:'TH', LAO:'LA', KHM:'KH', IDN:'ID', PHL:'PH', IND:'IN', LKA:'LK', NPL:'NP', BTN:'BT', MDV:'MV', KAZ:'KZ', UZB:'UZ', GEO:'GE', AZE:'AZ', TUR:'TR', JOR:'JO', EGY:'EG', ARE:'AE', SAU:'SA', QAT:'QA', OMN:'OM', ISR:'IL', ZAF:'ZA', KEN:'KE', TZA:'TZ', MAR:'MA', RUS:'RU', GBR:'GB', FRA:'FR', ITA:'IT', CHE:'CH', DEU:'DE', AUT:'AT', CZE:'CZ', NOR:'NO', ESP:'ES', PRT:'PT', GRC:'GR', NLD:'NL', BEL:'BE', HRV:'HR', SVN:'SI', USA:'US', CAN:'CA', MEX:'MX', AUS:'AU', NZL:'NZ', BRA:'BR', ARG:'AR', PER:'PE', CHL:'CL', ISL:'IS', FIN:'FI', SWE:'SE', DNK:'DK', POL:'PL', HUN:'HU' };

function normalize(id, fmt, data) {
  const out = [];
  if (fmt === 'pb' && Array.isArray(data)) {
    for (const t of data) {
      const c0 = (t.countries || [])[0] || {};
      // code เป็น ISO2 (ProBooking/CheckIn) หรือ ISO3 (Real Journey) → ถ้า 3 ตัวแปลงเป็น ISO2
      let code = c0.code || '';
      if (code.length === 3) code = ISO3TO2[code.toUpperCase()] || isoFromThai(c0.name_th || c0.name) || code;
      const open = (t.periods || []).filter(p => p.status === 'Open');
      const price = open.length ? Math.min(...open.map(p => p.priceAdultDouble || p.price)) : (t.price || 0);
      const deps = open.slice(0, 60).map(p => ({ date: p.start, ret: p.end, adult: p.priceAdultDouble || p.price, child: p.priceChild || 0, single: p.priceSingleRoomAdd || 0, seat: p.available }));
      if (t.banner) out.push({ id: `sup_${id}_${t.id}`, name: t.name, image: t.banner, price, country: code, code: t.code || '', days: Number(t.day) || 0, night: Number(t.night) || 0, airline: '', hotel: 0, highlight: t.highlight || '', pdf: t.pdf || '', deps });
    }
  } else if (fmt === 'zego' && Array.isArray(data)) {
    for (const t of data) {
      const book = (t.Periods || []).filter(p => p.PeriodStatus === 'Book');
      const prices = book.map(p => p.Price).filter(n => n > 0);
      const price = prices.length ? Math.min(...prices) : (t.Periods?.[0]?.Price || 0);
      const deps = book.slice(0, 60).map(p => ({ date: p.PeriodStartDate, ret: p.PeriodEndDate, adult: p.Price, child: p.Price_Child || 0, single: p.Price_Single_Bed || 0, seat: p.Seat }));
      if (t.URLImage) out.push({ id: `sup_zego_${t.ProductCode}`, name: t.ProductName, image: t.URLImage, price, country: t.CountryCodeISO2 || '', code: t.ProductCode || '', days: Number(t.Days) || 0, night: Number(t.Nights) || 0, airline: t.AirlineName || '', hotel: Number(t.MaxHotelStars || t.MinHotelStars) || 0, highlight: '', pdf: t.FilePDF || '', deps });
    }
  } else if (fmt === 'ttn' && Array.isArray(data)) {
    const progs = data.flatMap(x => x.program || []);
    for (const p of progs) {
      const iso = isoFromThai(p.P_TAG) || isoFromThai(p.P_NAME);
      const deps = [];
      for (const per of (p.Period || [])) {
        const pr = (per.Price || []).find(x => parseFloat(x.P_ADULT_PRICE) > 0);
        if (pr && per.P_DUE_START) deps.push({ date: per.P_DUE_START, ret: per.P_DUE_END, adult: parseFloat(pr.P_ADULT_PRICE), child: 0, single: parseFloat(pr.P_SINGLE_PRICE) || 0, seat: pr.P_AVAILABLE });
      }
      const price = deps.length ? Math.min(...deps.map(d => d.adult)) : (parseFloat(p.P_PRICE) || 0);
      if (p.BANNER) out.push({ id: `sup_ttn_${p.P_ID}`, name: p.P_NAME, image: p.BANNER, price, country: iso, code: p.P_CODE || '', days: Number(p.P_DAY) || 0, night: Number(p.P_NIGHT) || 0, airline: p.P_AIRLINE_NAME || '', hotel: Number(p.P_HOTEL_STAR) || 0, highlight: p.P_HIGHLIGHT || '', pdf: p.PDF || '', deps: deps.slice(0, 60) });
    }
  } else if (fmt === 'ttnplus') {
    // response เป็น object keyed by number → แปลงเป็น array
    const progs = Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.values(data) : []);
    const today = new Date().toISOString().slice(0, 10);
    for (const p of progs) {
      if (!p || !p.P_ID) continue;
      const iso = TTNPLUS_LOC[String(p.P_LOCATION || '').toUpperCase().trim()] || isoFromThai(p.P_NAME) || '';
      const deps = [];
      for (const per of (p.period || [])) {
        if (!per.P_DUE_START || per.P_DUE_START < today) continue;               // เฉพาะรอบอนาคต
        const open = Number(per.P_AVAILABLE) > 0 || /ว่าง/.test(per.P_status || '');
        if (!open) continue;                                                     // เฉพาะรอบที่ยังเปิดจอง
        const newP = parseFloat(per.P_NEWPRICE) || 0;
        const adult = newP > 0 ? newP : (parseFloat(per.P_ADULT) || 0);
        if (adult > 0) deps.push({ date: per.P_DUE_START, ret: per.P_DUE_END, adult, child: parseFloat(per.P_CHILDPRICE) || 0, single: parseFloat(per.P_SINGLE) || 0, seat: Number(per.P_AVAILABLE) || 0 });
      }
      const price = deps.length ? Math.min(...deps.map(d => d.adult)) : (parseFloat(p.P_PRICE) || 0);
      if (p.banner_url && price > 0) out.push({ id: `sup_ttnplus_${p.P_ID}`, name: p.P_NAME, image: p.banner_url, price, country: iso, code: p.P_CODE || '', days: Number(p.P_DAY) || 0, night: Number(p.P_NIGHT) || 0, airline: p.P_AIRLINE || '', hotel: 0, highlight: '', pdf: p.pdf_url || '', deps: deps.slice(0, 60) });
    }
  } else if (fmt === 'best') {
    // proxy คืน { data: { data: [โปรแกรม], meta } }
    const progs = data?.data?.data || (Array.isArray(data?.data) ? data.data : []);
    const today = new Date().toISOString().slice(0, 10);
    for (const p of (Array.isArray(progs) ? progs : [])) {
      if (!p || !p.id) continue;
      const iso = BEST_ISO[String(p.country_name_eng || '').toUpperCase().trim()] || isoFromThai(p.country_name) || isoFromThai(p.name) || '';
      const periods = Array.isArray(p.period) ? p.period : Object.values(p.period || {});
      const deps = [];
      for (const per of periods) {
        const date = bestDate(per.dateGo);
        if (!date || date < today) continue;                          // เฉพาะรอบอนาคต
        const adult = parseFloat(per.adultPrice) || 0;
        if (adult > 0) deps.push({ date, ret: bestDate(per.dateBack), adult, child: parseFloat(per.childWbPrice) || 0, single: parseFloat(per.singlePrice) || 0, seat: Number(per.avbl) || 0 });
      }
      if (!deps.length) continue;                                     // ไม่มีรอบเดินทางในอนาคต → ไม่โชว์
      const price = Math.min(...deps.map(d => d.adult));
      if (p.bannerSq && price > 0) out.push({ id: `sup_best_${p.id}`, name: p.name, image: p.bannerSq, price, country: iso, code: p.code || '', days: Number(p.day) || 0, night: Number(p.night) || 0, airline: p.airline_name || '', hotel: 0, highlight: '', pdf: p.filePdf || '', deps: deps.slice(0, 60) });
    }
  } else if (fmt === 'superb') {
    // rows แต่ละ id = รอบเดินทาง (โปรแกรมซ้ำในแต่ละ row) → จับกลุ่มตาม mainid
    const rows = data?.data || (Array.isArray(data) ? data : []);
    const today = new Date().toISOString().slice(0, 10);
    const byMain = {};
    for (const r of rows) { if (r && r.mainid) (byMain[r.mainid] = byMain[r.mainid] || []).push(r); }
    for (const k in byMain) {
      const rs = byMain[k], p = rs[0];
      const iso = String(p.country_code || '').toUpperCase().trim() || isoFromThai(p.Country) || '';
      const deps = [];
      for (const r of rs) {
        if (!r.Date || r.Date < today) continue;                      // เฉพาะรอบอนาคต
        const base = numOr0(r.Adult);
        const promo = Math.max(numOr0(r.PricePromotion), numOr0(r.SalePromotion));
        const active = promo > 0 && (r.DatePromotion === 'NO' || !r.EndDatePromotion || r.EndDatePromotion === 'NO' || today <= r.EndDatePromotion);
        const adult = active ? Math.max(0, base - promo) : base;
        if (adult > 0) deps.push({ date: r.Date, ret: r.ENDDate || '', adult, child: numOr0(r['Chd+B']), single: numOr0(r.Single), seat: Number(r.AVBL) || 0 });
      }
      if (!deps.length) continue;
      const price = Math.min(...deps.map(d => d.adult));
      if (p.banner) out.push({ id: `sup_superb_${k}`, name: p.title || p.titleTH || '', image: p.banner, price, country: iso, code: p.maincode || '', days: Number(p.day) || 0, night: Number(p.night) || 0, airline: (p.Airline && p.Airline !== 'NOLOGO') ? p.Airline : (p.aeycode || ''), hotel: 0, highlight: '', pdf: p.pdf || '', deps: deps.slice(0, 60) });
    }
  } else if (fmt === 'flyde') {
    const progs = data?.data || (Array.isArray(data) ? data : []);
    const today = new Date().toISOString().slice(0, 10);
    for (const p of progs) {
      if (!p || !p.pt_id || String(p.pt_status) === '0') continue;
      const iso = isoFromThai(p.country_names) || isoFromThai(p.pt_name) || '';
      const deps = flydePeriods(p.period_data)
        .filter(d => d.date && d.date >= today && d.adult > 0)
        .map(d => ({ date: d.date, ret: d.ret, adult: d.adult, child: 0, single: 0, seat: d.seat }));
      if (!deps.length) continue;
      const price = Math.min(...deps.map(d => d.adult));
      out.push({ id: `sup_flyde_${p.pt_id}`, name: p.pt_name, image: p.pt_banner ? FLYDE_IMG + p.pt_banner : '', price, country: iso, code: p.pt_code || '', days: Number(p.pt_day) || 0, night: Number(p.pt_night) || 0, airline: '', hotel: Number(p.pt_hotelstar) || 0, highlight: '', pdf: p.pt_pdf ? FLYDE_IMG + p.pt_pdf : '', deps: deps.slice(0, 60) });
    }
  }
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const wanted = (req.query?.c || '').toUpperCase();
  try {
    const results = await Promise.all(Object.entries(SUP).map(async ([id, fmt]) => {
      const data = await fetch(`${SITE}/api/suppliers?supplier=${id}`).then(r => r.ok ? r.json() : null).catch(() => null);
      return normalize(id, fmt, data);
    }));
    let all = results.flat().filter(t => t.name && t.price > 0);
    if (wanted) all = all.filter(t => t.country === wanted);
    const wantedCode = req.query?.code || '';
    if (wantedCode) {
      const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const q = norm(wantedCode);
      if (q.length >= 3) all = all.filter(t => norm(t.code) === q || (q.length >= 4 && norm(t.code).includes(q)));
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json(all);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};

// ── Supplier tour utilities ───────────────────────────────────────
// แปลงข้อมูลจาก API ซัพพลายเออร์ให้อยู่ใน format เดียวกับทัวร์ของเรา
// _source และ _pbId เป็น internal metadata ไม่แสดงลูกค้า

export const CODE_TO_CONTINENT = {
  JP: 'Asia-East', CN: 'Asia-East', HK: 'Asia-East', MO: 'Asia-East',
  KR: 'Asia-East', TW: 'Asia-East', MN: 'Asia-East',
  VN: 'Asia-SE', SG: 'Asia-SE', MY: 'Asia-SE', PH: 'Asia-SE',
  ID: 'Asia-SE', MM: 'Asia-SE', KH: 'Asia-SE', LA: 'Asia-SE', BN: 'Asia-SE',
  FR: 'Europe', ES: 'Europe', DE: 'Europe', IT: 'Europe', GB: 'Europe',
  PT: 'Europe', NL: 'Europe', BE: 'Europe', CH: 'Europe', AT: 'Europe',
  GR: 'Europe', CZ: 'Europe', PL: 'Europe', TR: 'Europe',
  US: 'Americas', CA: 'Americas', MX: 'Americas',
  AU: 'Oceania', NZ: 'Oceania',
  AE: 'Asia-S-ME', SA: 'Asia-S-ME', QA: 'Asia-S-ME', IN: 'Asia-S-ME',
  KZ: 'Asia-S-ME', KG: 'Asia-S-ME', UZ: 'Asia-S-ME', // เอเชียกลาง
  EG: 'Africa', MA: 'Africa', ZA: 'Africa', KE: 'Africa', TZ: 'Africa',
  GE: 'Europe', EU: 'Europe', SCA: 'Europe', // จอร์เจีย / ยุโรปหลายประเทศ / สแกนดิเนเวีย (Zego)
};

export const COUNTRY_CODE_NAME_TH = {
  JP: 'ญี่ปุ่น', CN: 'จีน', HK: 'ฮ่องกง', MO: 'มาเก๊า',
  KR: 'เกาหลีใต้', TW: 'ไต้หวัน', MN: 'มองโกเลีย',
  VN: 'เวียดนาม', SG: 'สิงคโปร์', MY: 'มาเลเซีย', PH: 'ฟิลิปปินส์',
  MM: 'พม่า', KH: 'กัมพูชา', LA: 'ลาว', ID: 'อินโดนีเซีย', BN: 'บรูไน',
  FR: 'ฝรั่งเศส', ES: 'สเปน', DE: 'เยอรมัน', IT: 'อิตาลี',
  GB: 'อังกฤษ', AU: 'ออสเตรเลีย', US: 'สหรัฐอเมริกา',
  IN: 'อินเดีย', EG: 'อียิปต์', KZ: 'คาซัคสถาน', KG: 'คีร์กีซสถาน', UZ: 'อุซเบกิสถาน',
  GE: 'จอร์เจีย', EU: 'ยุโรป', SCA: 'สแกนดิเนเวีย',
};

export function normalizePbTour(t, source = 'probooking', sourceName = 'ProBooking') {
  const primaryCountry = t.countries?.[0];
  const countryCode    = primaryCountry?.code || '';
  const continent      = CODE_TO_CONTINENT[countryCode] || 'Asia-East';
  const nameTh         = primaryCountry?.name || COUNTRY_CODE_NAME_TH[countryCode] || countryCode;

  const openPeriods = (t.periods || []).filter(p => p.status === 'Open');
  const minPrice    = openPeriods.length > 0
    ? Math.min(...openPeriods.map(p => p.price))
    : (t.price || 0);

  return {
    // ── ใช้ {th, en} format เดียวกับทัวร์ของเรา ────────────────
    // id ต้อง unique ข้ามซัพพลายเออร์ → prefix ด้วย source
    id:          `sup_${source}_${t.id}`,
    code:        t.code || '',
    name:        { th: t.name, en: t.name },
    destination: { th: nameTh, en: countryCode },
    continent,
    country:     countryCode,
    image:       t.banner || '',
    price:       minPrice,
    duration:    t.day || 0,
    tourType:    'outbound',
    featured:    false,
    departures:  openPeriods.map(p => ({
      date:             p.start,
      returnDate:       p.end,
      price:            p.priceAdultDouble || p.price || 0,
      childPrice:       p.priceChild       || null,
      infantPrice:      p.priceInfant      || null,
      singleSupplement: p.priceSingleRoomAdd || null,
      joinPrice:        p.join             || null,
      available:        p.available,
      totalSeats:       p.seat,
      bookedSeats:      Math.max(0, (p.seat || 0) - (p.available || 0)),
      deposit:          p.deposit,
      periodId:         p.id,
    })),
    groupSize: openPeriods[0]?.group || null,

    // ── ฟิลด์เสริม ───────────────────────────────────────────
    pdfUrl: t.pdf || null,

    // ── Internal metadata (ไม่แสดงลูกค้า) ─────────────────────
    _source:     source,      // 'probooking' | 'wondergroup' | ...
    _sourceName: sourceName,  // ชื่อโชว์ใน admin
    _pbId:       t.id,        // id เดิมฝั่งซัพพลายเออร์ (ใช้ fetch detail)
    _night:      t.night || 0,
  };
}

export function normalizePbTours(list, source = 'probooking', sourceName = 'ProBooking') {
  if (!Array.isArray(list)) return [];
  return list.map(t => normalizePbTour(t, source, sourceName));
}

// ── Zego (zegoapi.com) — โครงสร้างต่างจาก ProBooking ──────────────
// field: ProductCode, ProductName, CountryCodeISO2, Days, URLImage,
//        FilePDF, AirlineName, Periods[] (PeriodStartDate, Price, ...)
export function normalizeZegoTour(t, source = 'zego', sourceName = 'Zego') {
  const iso2      = t.CountryCodeISO2 || '';
  const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
  const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || t.CountryName || iso2;

  // เปิดจอง = Book หรือ Waitlist (Close Group = ปิดรับ)
  const bookable = (t.Periods || []).filter(p => p.PeriodStatus === 'Book' || p.PeriodStatus === 'Waitlist');
  const prices   = bookable.map(p => p.Price).filter(n => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : (t.Periods?.[0]?.Price || 0);

  return {
    id:          `sup_${source}_${t.ProductCode}`,
    code:        t.ProductCode || '',
    name:        { th: t.ProductName, en: t.ProductName },
    destination: { th: nameTh, en: t.CountryName || iso2 },
    continent,
    country:     iso2,
    image:       t.URLImage || '',
    price:       minPrice,
    duration:    Number(t.Days) || 0,
    tourType:    'outbound',
    featured:    false,
    airline:     t.AirlineName || '',
    departures:  bookable.map(p => ({
      date:             p.PeriodStartDate,
      returnDate:       p.PeriodEndDate,
      price:            p.Price || 0,
      childPrice:       p.Price_Child || null,
      infantPrice:      p.Price_Infant || null,
      singleSupplement: p.Price_Single_Bed || null,
      joinPrice:        p.Price_JoinLand || null,
      available:        p.Seat,
      totalSeats:       p.GroupSize,
      bookedSeats:      p.Book,
      deposit:          p.Deposit,
      periodId:         p.PeriodID,
    })),
    groupSize: t.Periods?.[0]?.GroupSize || null,
    pdfUrl:    t.FilePDF || null,

    _source:     source,
    _sourceName: sourceName,
    _pbId:       t.ProductCode,   // ใช้ ProductCode fetch detail
    _night:      Number(t.Nights) || 0,
    _hotelStars: t.MaxHotelStars || t.MinHotelStars || null,
  };
}

export function normalizeZegoTours(list, source = 'zego', sourceName = 'Zego') {
  if (!Array.isArray(list)) return [];
  return list.map(t => normalizeZegoTour(t, source, sourceName));
}

// ── หา ISO code จากข้อความไทย (เช่น P_TAG "ทัวร์ญี่ปุ่น") ──────────
const TTN_ALIAS = { 'เกาหลี': 'KR', 'ดูไบ': 'AE', 'อังกฤษ': 'GB', 'อเมริกา': 'US' };
export function codeFromThaiText(text) {
  if (!text) return null;
  const t = String(text);
  for (const [name, code] of Object.entries(TTN_ALIAS)) if (t.includes(name)) return code;
  const pairs = Object.entries(COUNTRY_CODE_NAME_TH).sort((a, b) => b[1].length - a[1].length);
  for (const [code, th] of pairs) if (th && t.includes(th)) return code;
  return null;
}

// ── TTN Tour (online.ttnconnect.com) ─────────────────────────────
// get-allprogram → [{ program:[{ P_ID, P_CODE, P_NAME, ..., Period:[{ ..., Price:[...] }] }] }]
export function normalizeTtnTour(p, source = 'ttn', sourceName = 'TTN Tour') {
  const iso2      = codeFromThaiText(p.P_TAG) || codeFromThaiText(p.P_NAME) || '';
  const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
  const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || iso2;

  const periods = Array.isArray(p.Period) ? p.Period : [];
  const deps = periods.map(per => {
    const prices = Array.isArray(per.Price) ? per.Price : [];
    const pr = prices.find(x => x.P_STATUS === 'Open' && parseFloat(x.P_ADULT_PRICE) > 0)
            || prices.find(x => parseFloat(x.P_ADULT_PRICE) > 0)
            || prices[0] || {};
    const total  = Number(pr.P_VOLUME)  || 0;
    const booked = Number(pr.P_BOOKING) || 0;
    const avail  = pr.P_AVAILABLE != null && pr.P_AVAILABLE !== 0
      ? Number(pr.P_AVAILABLE) : Math.max(0, total - booked);
    return {
      date:             per.P_DUE_START,
      returnDate:       per.P_DUE_END,
      price:            parseFloat(pr.P_ADULT_PRICE)     || 0,
      infantPrice:      parseFloat(pr.P_INFANT_PRICE)    || null,
      singleSupplement: parseFloat(pr.P_SINGLE_PRICE)    || null,
      joinPrice:        parseFloat(pr.P_JOINLAND_PRICE)  || null,
      available:        avail,
      totalSeats:       total,
      bookedSeats:      booked,
      periodId:         per.P_ID,
    };
  }).filter(d => d.date && d.price > 0);

  const prices   = deps.map(d => d.price).filter(n => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : (parseFloat(p.P_PRICE) || 0);

  return {
    id:          `sup_${source}_${p.P_ID}`,
    code:        p.P_CODE || '',
    name:        { th: p.P_NAME, en: p.P_NAME },
    destination: { th: nameTh, en: iso2 },
    continent,
    country:     iso2,
    image:       p.BANNER || '',
    price:       minPrice,
    duration:    Number(p.P_DAY) || 0,
    tourType:    'outbound',
    featured:    false,
    airline:     p.P_AIRLINE_NAME || '',
    departures:  deps,
    groupSize:   deps[0]?.totalSeats || null,
    pdfUrl:      p.PDF || null,

    _source:     source,
    _sourceName: sourceName,
    _pbId:       p.P_ID,
    _night:      Number(p.P_NIGHT) || 0,
    _hotelStars: p.P_HOTEL_STAR || null,
  };
}

export function normalizeTtnTours(list, source = 'ttn', sourceName = 'TTN Tour') {
  if (!Array.isArray(list)) return [];
  // แผ่ [{program:[...]}] → [program...]
  const progs = list.flatMap(x =>
    Array.isArray(x?.program) ? x.program : (x?.P_ID ? [x] : [])
  );
  return progs.map(p => normalizeTtnTour(p, source, sourceName));
}

// ── TTN Plus (www.ttnplus.co.th/api/program) ─────────────────────
// response เป็น object keyed by number · period[] มี P_NEWPRICE (ลดราคา), P_status
const TTNPLUS_LOC = { CHINA:'CN', VIETNAM:'VN', TAIWAN:'TW', JAPAN:'JP', KOREA:'KR', 'SOUTH KOREA':'KR',
  HONGKONG:'HK', 'HONG KONG':'HK', EUROPE:'EU', SINGAPORE:'SG', MALAYSIA:'MY', MYANMAR:'MM', INDIA:'IN',
  DUBAI:'AE', UAE:'AE', TURKEY:'TR', GEORGIA:'GE', EGYPT:'EG', LAOS:'LA', CAMBODIA:'KH', INDONESIA:'ID',
  MACAU:'MO', MACAO:'MO', MALDIVES:'MV', KAZAKHSTAN:'KZ' };

export function normalizeTtnPlusTour(p, source = 'ttnplus', sourceName = 'TTN Plus') {
  const iso2      = TTNPLUS_LOC[String(p.P_LOCATION || '').toUpperCase().trim()] || codeFromThaiText(p.P_NAME) || '';
  const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
  const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || iso2;

  const deps = (Array.isArray(p.period) ? p.period : []).map(per => {
    const newP   = parseFloat(per.P_NEWPRICE) || 0;
    const adult  = newP > 0 ? newP : (parseFloat(per.P_ADULT) || 0);
    const total  = Number(per.P_VOLUME)  || 0;
    const booked = Number(per.P_BOOKING) || 0;
    const avail  = per.P_AVAILABLE != null ? Number(per.P_AVAILABLE) : Math.max(0, total - booked);
    return {
      date:             per.P_DUE_START,
      returnDate:       per.P_DUE_END,
      price:            adult,
      promoPrice:       newP > 0 ? newP : 0,
      childPrice:       parseFloat(per.P_CHILDPRICE) || null,
      infantPrice:      parseFloat(per.P_INFANT)     || null,
      singleSupplement: parseFloat(per.P_SINGLE)     || null,
      available:        avail,
      totalSeats:       total,
      bookedSeats:      booked,
      periodId:         per.P_ID,
      statusText:       per.P_status || '',
    };
  }).filter(d => d.date && d.price > 0);

  const prices   = deps.map(d => d.price).filter(n => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : (parseFloat(p.P_PRICE) || 0);

  return {
    id:          `sup_${source}_${p.P_ID}`,
    code:        p.P_CODE || '',
    name:        { th: p.P_NAME, en: p.P_NAME },
    destination: { th: nameTh, en: iso2 },
    continent,
    country:     iso2,
    image:       p.banner_url || '',
    price:       minPrice,
    duration:    Number(p.P_DAY) || 0,
    tourType:    'outbound',
    featured:    false,
    airline:     p.P_AIRLINE || '',
    departures:  deps,
    groupSize:   deps[0]?.totalSeats || null,
    pdfUrl:      p.pdf_url || null,
    itinerary:   Array.isArray(p.detail) ? p.detail.map(d => ({ day: Number(d.D_DAY) || 0, detail: d.D_ITIN || '' })) : [],
    _source:     source,
    _sourceName: sourceName,
    _pbId:       p.P_ID,
    _night:      Number(p.P_NIGHT) || 0,
    _hotelStars: null,
  };
}

export function normalizeTtnPlusTours(list, source = 'ttnplus', sourceName = 'TTN Plus') {
  const arr = Array.isArray(list) ? list : (list && typeof list === 'object' ? Object.values(list) : []);
  return arr.filter(x => x && x.P_ID).map(p => normalizeTtnPlusTour(p, source, sourceName));
}

// ── BEST International (tour-api.bestinternational.com) ───────────
// proxy คืน { data: { data: [โปรแกรม], meta } } · period[] = รอบเดินทาง (adultPrice ฯลฯ)
const BEST_ISO = { CHINA:'CN', JAPAN:'JP', KOREA:'KR', 'SOUTH KOREA':'KR', TAIWAN:'TW', CNXTAIWAN:'TW',
  'HONG KONG':'HK', HONGKONG:'HK', VIETNAM:'VN', 'VIET NAM':'VN', SINGAPORE:'SG', MALAYSIA:'MY',
  MYANMAR:'MM', LAOS:'LA', CAMBODIA:'KH', INDONESIA:'ID', PHILIPPINES:'PH', INDIA:'IN', 'SRI LANKA':'LK',
  NEPAL:'NP', BHUTAN:'BT', MALDIVES:'MV', KAZAKHSTAN:'KZ', UZBEKISTAN:'UZ', GEORGIA:'GE', TURKEY:'TR',
  JORDAN:'JO', EGYPT:'EG', DUBAI:'AE', UAE:'AE', 'SAUDI ARABIA':'SA', QATAR:'QA', OMAN:'OM',
  'SOUTH AFRICA':'ZA', KENYA:'KE', MOROCCO:'MA', EUROPE:'EU', ENGLAND:'GB', UK:'GB', 'UNITED KINGDOM':'GB',
  FRANCE:'FR', ITALY:'IT', SWITZERLAND:'CH', GERMANY:'DE', AUSTRIA:'AT', CZECH:'CZ', NORWAY:'NO',
  RUSSIA:'RU', SPAIN:'ES', PORTUGAL:'PT', GREECE:'GR', USA:'US', AMERICA:'US', 'UNITED STATES':'US',
  CANADA:'CA', AUSTRALIA:'AU', 'NEW ZEALAND':'NZ', ICELAND:'IS' };
const bestDate = s => { const m = String(s || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` : ''; };

export function normalizeBestTour(p, source = 'best', sourceName = 'BEST International') {
  const iso2      = BEST_ISO[String(p.country_name_eng || '').toUpperCase().trim()] || codeFromThaiText(p.country_name) || codeFromThaiText(p.name) || '';
  const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
  const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || (p.country_name || iso2);

  const periods = Array.isArray(p.period) ? p.period : Object.values(p.period || {});
  const deps = periods.map(per => {
    const adult = parseFloat(per.adultPrice) || 0;
    const oldP  = parseFloat(per.adultPrice_old) || 0;
    return {
      date:             bestDate(per.dateGo),
      returnDate:       bestDate(per.dateBack),
      price:            adult,
      promoPrice:       (oldP > adult && adult > 0) ? adult : 0,
      childPrice:       parseFloat(per.childWbPrice) || null,
      infantPrice:      parseFloat(per.childNbPrice) || null,
      singleSupplement: parseFloat(per.singlePrice)  || null,
      available:        Number(per.avbl) || 0,
      totalSeats:       parseInt(per.groupSize) || null,
      bookedSeats:      Number(per.bookTotal) || 0,
      periodId:         per.pid,
    };
  }).filter(d => d.date && d.price > 0);

  const prices   = deps.map(d => d.price).filter(n => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : (parseFloat(p.price) || 0);

  return {
    id:          `sup_${source}_${p.id}`,
    code:        p.code || '',
    name:        { th: p.name, en: p.name },
    destination: { th: nameTh, en: iso2 },
    continent,
    country:     iso2,
    image:       p.bannerSq || '',
    price:       minPrice,
    duration:    Number(p.day) || 0,
    tourType:    'outbound',
    featured:    false,
    airline:     p.airline_name || '',
    departures:  deps,
    groupSize:   deps[0]?.totalSeats || null,
    pdfUrl:      p.filePdf || null,
    itinerary:   [],
    _source:     source,
    _sourceName: sourceName,
    _pbId:       p.id,
    _night:      Number(p.night) || 0,
    _hotelStars: null,
  };
}

export function normalizeBestTours(payload, source = 'best', sourceName = 'BEST International') {
  // payload = { data: { data: [...] } } จาก proxy · หรือ array ตรงๆ
  const arr = payload?.data?.data || (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
  return arr.filter(x => x && x.id)
    .map(p => normalizeBestTour(p, source, sourceName))
    .filter(t => t.departures.length > 0);   // เฉพาะทัวร์ที่มีรอบเดินทางในอนาคต
}

// ── Superb Holidayz (superbholidayz.com/superb/apiweb.php) ────────
// proxy คืน { data: [rows] } · แต่ละ row = รอบเดินทาง (โปรแกรมซ้ำ) → จับกลุ่มตาม mainid
const superbNum = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

export function normalizeSuperbTours(payload, source = 'superb', sourceName = 'Superb Holidayz') {
  const rows = payload?.data || (Array.isArray(payload) ? payload : []);
  const byMain = {};
  for (const r of rows) { if (r && r.mainid) (byMain[r.mainid] = byMain[r.mainid] || []).push(r); }

  return Object.keys(byMain).map(k => {
    const rs = byMain[k], p = rs[0];
    const iso2      = String(p.country_code || '').toUpperCase().trim() || codeFromThaiText(p.Country) || '';
    const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
    const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || (p.Country || iso2);

    const deps = rs.map(r => {
      const base  = superbNum(r.Adult);
      const promo = Math.max(superbNum(r.PricePromotion), superbNum(r.SalePromotion));
      const active = promo > 0 && (r.DatePromotion === 'NO' || !r.EndDatePromotion || r.EndDatePromotion === 'NO');
      const adult = active ? Math.max(0, base - promo) : base;
      return {
        date:             r.Date,
        returnDate:       r.ENDDate || '',
        price:            adult,
        promoPrice:       active ? adult : 0,
        childPrice:       superbNum(r['Chd+B']) || null,
        infantPrice:      superbNum(r.ChdNB) || null,
        singleSupplement: superbNum(r.Single) || null,
        available:        Number(r.AVBL) || 0,
        totalSeats:       Number(r.Size) || null,
        bookedSeats:      Number(r.Booking) || 0,
        periodId:         r.pid,
      };
    }).filter(d => d.date && d.price > 0);

    const prices   = deps.map(d => d.price).filter(n => n > 0);
    const minPrice = prices.length ? Math.min(...prices) : (superbNum(p.startingprice) || 0);

    return {
      id:          `sup_${source}_${k}`,
      code:        p.maincode || '',
      name:        { th: p.title || p.titleTH || '', en: p.title || '' },
      destination: { th: nameTh, en: iso2 },
      continent,
      country:     iso2,
      image:       p.banner || p.bannerFull || '',
      price:       minPrice,
      duration:    Number(p.day) || 0,
      tourType:    'outbound',
      featured:    false,
      airline:     (p.Airline && p.Airline !== 'NOLOGO') ? p.Airline : (p.aeycode || ''),
      departures:  deps,
      groupSize:   deps[0]?.totalSeats || null,
      pdfUrl:      p.pdf || null,
      itinerary:   [],
      _source:     source,
      _sourceName: sourceName,
      _pbId:       k,
      _night:      Number(p.night) || 0,
      _hotelStars: null,
    };
  }).filter(t => t.departures.length > 0);
}

// ── FLY de WORLD (flywholesales.com/api_datatour_new.php) ─────────
// DataTables { data:[...] } · period_data = string "pid|start(DD-MM-YYYY)|end|..|seat|..|price|.." คั่น ;;;
const FLYDE_IMG = 'https://flywholesales.com/backend/';
const flydeDate = s => { const m = String(s || '').match(/(\d{2})-(\d{2})-(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };

export function normalizeFlydeTours(payload, source = 'flyde', sourceName = 'FLY de WORLD') {
  const arr = payload?.data || (Array.isArray(payload) ? payload : []);
  return arr.filter(p => p && p.pt_id && String(p.pt_status) !== '0').map(p => {
    const iso2      = codeFromThaiText(p.country_names) || codeFromThaiText(p.pt_name) || '';
    const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
    const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || (p.country_names || iso2);

    const deps = String(p.period_data || '').split(';;;').filter(Boolean).map(seg => {
      const f = seg.split('|');
      return {
        date:       flydeDate(f[1]),
        returnDate: flydeDate(f[2]),
        price:      parseFloat(f[10]) || 0,
        available:  Number(f[6]) || 0,
        totalSeats: Number(f[5]) || null,
        periodId:   f[0],
      };
    }).filter(d => d.date && d.price > 0);

    const prices   = deps.map(d => d.price).filter(n => n > 0);
    const minPrice = prices.length ? Math.min(...prices) : (parseFloat(p.pt_price) || 0);

    return {
      id:          `sup_${source}_${p.pt_id}`,
      code:        p.pt_code || '',
      name:        { th: p.pt_name, en: p.pt_name },
      destination: { th: nameTh, en: iso2 },
      continent,
      country:     iso2,
      image:       p.pt_banner ? FLYDE_IMG + p.pt_banner : '',
      price:       minPrice,
      duration:    Number(p.pt_day) || 0,
      tourType:    'outbound',
      featured:    false,
      airline:     '',
      departures:  deps,
      groupSize:   deps[0]?.totalSeats || null,
      pdfUrl:      p.pt_pdf ? FLYDE_IMG + p.pt_pdf : null,
      itinerary:   [],
      _source:     source,
      _sourceName: sourceName,
      _pbId:       p.pt_id,
      _night:      Number(p.pt_night) || 0,
      _hotelStars: Number(p.pt_hotelstar) || null,
    };
  }).filter(t => t.departures.length > 0);
}

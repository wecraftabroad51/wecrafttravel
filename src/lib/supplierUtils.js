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

// ISO3 → ISO2 (ซัพบางเจ้าใช้ ISO3 เช่น Real Journey: JPN, KAZ)
const ISO3TO2 = { JPN:'JP', CHN:'CN', KOR:'KR', TWN:'TW', HKG:'HK', VNM:'VN', SGP:'SG', MYS:'MY', MMR:'MM', THA:'TH', LAO:'LA', KHM:'KH', IDN:'ID', PHL:'PH', IND:'IN', LKA:'LK', NPL:'NP', BTN:'BT', MDV:'MV', KAZ:'KZ', UZB:'UZ', GEO:'GE', AZE:'AZ', TUR:'TR', JOR:'JO', EGY:'EG', ARE:'AE', SAU:'SA', QAT:'QA', OMN:'OM', ISR:'IL', ZAF:'ZA', KEN:'KE', TZA:'TZ', MAR:'MA', RUS:'RU', GBR:'GB', FRA:'FR', ITA:'IT', CHE:'CH', DEU:'DE', AUT:'AT', CZE:'CZ', NOR:'NO', ESP:'ES', PRT:'PT', GRC:'GR', NLD:'NL', BEL:'BE', HRV:'HR', SVN:'SI', USA:'US', CAN:'CA', MEX:'MX', AUS:'AU', NZL:'NZ', BRA:'BR', ARG:'AR', PER:'PE', CHL:'CL', ISL:'IS', FIN:'FI', SWE:'SE', DNK:'DK', POL:'PL', HUN:'HU' };

export function normalizePbTour(t, source = 'probooking', sourceName = 'ProBooking') {
  const primaryCountry = t.countries?.[0];
  // code เป็น ISO2 (ProBooking/CheckIn) หรือ ISO3 (Real Journey) → ถ้า 3 ตัวแปลงผ่านชื่อไทย
  let countryCode = primaryCountry?.code || '';
  if (countryCode.length === 3) countryCode = ISO3TO2[countryCode.toUpperCase()] || codeFromThaiText(primaryCountry?.name_th || primaryCountry?.name) || countryCode;
  const continent      = CODE_TO_CONTINENT[countryCode] || 'Asia-East';
  const nameTh         = primaryCountry?.name_th || primaryCountry?.name || COUNTRY_CODE_NAME_TH[countryCode] || countryCode;

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

    // สายการบิน/ระดับโรงแรม — บางซัพ (เช่น RareX) ใส่มาใน list เลย · ซัพอื่นจะ undefined → ไม่กระทบ
    airline: t.vehicle || t.airline || '',

    // ── ฟิลด์เสริม ───────────────────────────────────────────
    pdfUrl: t.pdf || null,

    // ── Internal metadata (ไม่แสดงลูกค้า) ─────────────────────
    _source:     source,      // 'probooking' | 'wondergroup' | ...
    _sourceName: sourceName,  // ชื่อโชว์ใน admin
    _pbId:       t.id,        // id เดิมฝั่งซัพพลายเออร์ (ใช้ fetch detail)
    _night:      t.night || 0,
    _hotelStars: t.hotelStar || null,
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

// ── Unique Inter Wholesale (uniqueinterwholesale.com/apiwebsingle.php) ──
// proxy คืน { data: [rows] } · แต่ละ row = รอบเดินทาง (โปรแกรมซ้ำ) → จับกลุ่มตาม mainid (คล้าย Superb)
const uniqNum = v => { const n = parseFloat(String(v ?? '').replace(/,/g, '')); return isNaN(n) ? 0 : n; };
// Unique ส่ง path สั้น (เช่น "catalog/xxx.pdf") → เติมโดเมนให้เป็น URL เต็ม (+ encode ช่องว่าง)
const UNIQ_BASE = 'https://uniqueinterwholesale.com/';
const uniqAbs = (u) => {
  const s = String(u || '').trim();
  if (!s) return '';
  const full = /^https?:\/\//i.test(s) ? s : UNIQ_BASE + s.replace(/^\/+/, '');
  return full.replace(/ /g, '%20');
};
export function normalizeUniqueTours(payload, source = 'unique', sourceName = 'Unique Inter') {
  const rows = payload?.data || (Array.isArray(payload) ? payload : []);
  const today = new Date().toISOString().slice(0, 10);
  const byMain = {};
  for (const r of rows) { const k = r && (r.mainid ?? r.ProductCode); if (k != null && k !== '') (byMain[k] = byMain[k] || []).push(r); }

  return Object.keys(byMain).map(k => {
    const rs = byMain[k], p = rs[0];
    const iso2      = codeFromThaiText(p.Country) || detectItravelsCountry(`${p.Country || ''} ${p.title || ''}`) || '';
    const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
    const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || (p.Country || iso2);

    const deps = rs.map(r => {
      const adult = uniqNum(r.Adult);
      const pro   = uniqNum(r.Pro);
      const promo = (pro > 0 && pro < adult) ? pro : 0;
      return {
        date:             r.Date,
        returnDate:       r.ENDDate || '',
        price:            adult,
        promoPrice:       promo,
        childPrice:       uniqNum(r['Chd+B']) || null,
        infantPrice:      uniqNum(r.ChdNB) || null,
        singleSupplement: uniqNum(r.Single) || null,
        available:        Number(r.AVBL) || 0,
        totalSeats:       Number(r.Size) || null,
        bookedSeats:      0,
        deposit:          uniqNum(r.Deposit) || null,
        periodId:         r.pid || '',
        _booking:         String(r.Booking ?? ''),
      };
    }).filter(d => d.date && d.date >= today && d.price > 0 && !['15', '16'].includes(d._booking));

    // ระยะเวลา (วัน) จากวันไป-กลับของรอบแรก
    let duration = 0;
    const d0 = deps[0];
    if (d0?.date && d0?.returnDate) { const diff = Math.round((new Date(d0.returnDate) - new Date(d0.date)) / 86400000); if (diff > 0 && diff < 40) duration = diff + 1; }

    const eff = deps.map(d => d.promoPrice > 0 ? d.promoPrice : d.price).filter(n => n > 0);
    const minPrice = eff.length ? Math.min(...eff) : (uniqNum(p.startingprice) || 0);

    return {
      id:          `sup_${source}_${k}`,
      code:        p.ProductCode || '',
      name:        { th: p.title, en: p.title },
      destination: { th: nameTh, en: iso2 },
      continent,
      country:     iso2,
      image:       uniqAbs(p.jpg),
      price:       minPrice,
      duration,
      tourType:    'outbound',
      featured:    false,
      airline:     (p.Airline && p.Airline !== 'NOLOGO') ? p.Airline : '',
      departures:  deps,
      groupSize:   deps[0]?.totalSeats || null,
      pdfUrl:      uniqAbs(p.pdf) || null,
      itinerary:   [],
      _source:     source,
      _sourceName: sourceName,
      _pbId:       k,
      _night:      duration > 0 ? duration - 1 : 0,
      _hotelStars: null,
      _highlight:  p.story || '',
    };
  }).filter(t => t.departures.length > 0 && t.name?.th);
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

// ── iTravels Center (api.itravels.center/api/v1) ──────────────────
// proxy คืน { data: [program + periods(join แล้ว)] } · ไม่มีฟิลด์ประเทศ → เดาจากชื่อ + หัวข้อไอทินฯ
// keyword (เมือง/ประเทศ ไทย+อังกฤษ) → ISO2 · ชื่อทัวร์ itravels มักใช้ชื่อเมือง
const ITRAVELS_KW = [
  ['CN', ['จีน','ฉงชิ่ง','chongqing','เฉิงตู','chengdu','ปักกิ่ง','beijing','เซี่ยงไฮ้','shanghai','กวางเจา','กวางโจว','guangzhou','คุนหมิง','kunming','จางเจียเจี้ย','zhangjiajie','ซีอาน','xian','กุ้ยหลิน','guilin','ลี่เจียง','lijiang','จิ่วจ้ายโกว','jiuzhaigou','ฮาร์บิน','harbin','อู่หลง','wulong','แชงกรีล่า','shangri','ต้าหลี่','dali','เซินเจิ้น','shenzhen','ชิงเต่า','qingdao','ฉางซา','changsha','หังโจว','hangzhou','ซูโจว','suzhou','เฉิงตู','จูไห่','zhuhai','เขาง้อไบ๊','emei']],
  ['JP', ['ญี่ปุ่น','japan','โตเกียว','tokyo','โอซาก้า','osaka','เกียวโต','kyoto','ฮอกไกโด','hokkaido','ฟูจิ','fuji','นาโกย่า','nagoya','โอกินาว่า','okinawa','ฟุกุโอกะ','fukuoka','ทาคายาม่า','takayama','ชิราคาวา','shirakawa','นารา','nara','คิวชู','kyushu','เซนได','sendai','ฮาคุบะ','hakuba','คามิโคจิ','คุซัทสึ','โทยามะ','toyama']],
  ['KR', ['เกาหลี','korea','โซล','seoul','ปูซาน','busan','เชจู','jeju']],
  ['TW', ['ไต้หวัน','taiwan','ไทเป','taipei','เกาสง','kaohsiung','ไทจง','taichung','อาลีซาน','alishan','จิ่วเฟิ่น','จิ่วเฟิน']],
  ['VN', ['เวียดนาม','vietnam','ฮานอย','hanoi','ดานัง','danang','โฮจิมินห์','ho chi minh','ซาปา','sapa','บานาฮิลล์','bana hills','ฟูก๊วก','phu quoc','ดาลัด','dalat','ญาจาง','ฮาลอง','halong']],
  ['HK', ['ฮ่องกง','hong kong','hongkong']],
  ['MO', ['มาเก๊า','macau','macao']],
  ['SG', ['สิงคโปร์','singapore']],
  ['MY', ['มาเลเซีย','malaysia','กัวลาลัมเปอร์','kuala lumpur','ปีนัง','penang']],
  ['IN', ['อินเดีย','india','เดลี','delhi','แคชเมียร์','kashmir','ลาดักห์','ladakh']],
  ['NP', ['เนปาล','nepal','กาฐมาณฑุ','kathmandu']],
  ['BT', ['ภูฏาน','bhutan','พาโร','paro']],
  ['AE', ['ดูไบ','dubai','อาบูดาบี','abu dhabi']],
  ['EG', ['อียิปต์','egypt','ไคโร','cairo','ลักซอร์','luxor']],
  ['JO', ['จอร์แดน','jordan','เพตรา','petra']],
  ['TR', ['ตุรกี','turkey','turkiye','อิสตันบูล','istanbul','คัปปาโดเกีย','cappadocia']],
  ['KZ', ['คาซัคสถาน','kazakhstan','อัลมาตี','almaty']],
  ['UZ', ['อุซเบกิสถาน','uzbekistan','ซามาร์คานด์','samarkand']],
  ['GE', ['จอร์เจีย','georgia','ทบิลิซี','tbilisi']],
  ['SCA', ['สแกนดิเนเวีย','scandinavia','สวีเดน','sweden','นอร์เวย์','norway','เดนมาร์ก','denmark','ฟินแลนด์','finland','ไอซ์แลนด์','iceland','stockholm','oslo','copenhagen','helsinki','reykjavik']],
  ['FR', ['ฝรั่งเศส','france','ปารีส','paris']],
  ['IT', ['อิตาลี','italy','โรม','rome','เวนิส','venice','มิลาน','milan']],
  ['CH', ['สวิส','switzerland','ซูริค','zurich','อินเทอร์ลาเคน','interlaken']],
  ['DE', ['เยอรมัน','germany','เบอร์ลิน','berlin','มิวนิค','munich']],
  ['AT', ['ออสเตรีย','austria','เวียนนา','vienna']],
  ['GB', ['อังกฤษ','england','ลอนดอน','london','สหราชอาณาจักร','united kingdom','สกอตแลนด์','scotland']],
  ['ES', ['สเปน','spain','บาร์เซโลนา','barcelona','มาดริด','madrid']],
  ['PT', ['โปรตุเกส','portugal','ลิสบอน','lisbon']],
  ['NL', ['เนเธอร์แลนด์','netherlands','อัมสเตอร์ดัม','amsterdam']],
  ['GR', ['กรีซ','greece','เอเธนส์','athens','ซานโตรินี','santorini']],
  ['CZ', ['เช็ก','czech','ปราก','prague']],
  ['RU', ['รัสเซีย','russia','มอสโก','moscow']],
  ['US', ['อเมริกา','america','สหรัฐ','usa','นิวยอร์ก','new york','ลอสแอนเจลิส','los angeles','ลาสเวกัส','las vegas']],
  ['CA', ['แคนาดา','canada','แวนคูเวอร์','vancouver','โตรอนโต','toronto']],
  ['AU', ['ออสเตรเลีย','australia','ซิดนีย์','sydney','เมลเบิร์น','melbourne']],
  ['NZ', ['นิวซีแลนด์','new zealand','โอ๊คแลนด์','auckland']],
  ['EU', ['ยุโรป','europe']],
];
function detectItravelsCountry(text) {
  const s = String(text || '').toLowerCase();
  for (const [iso, kws] of ITRAVELS_KW) for (const kw of kws) if (s.includes(kw.toLowerCase())) return iso;
  return codeFromThaiText(text) || '';
}
const stripHtml = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// รายการเดือน YYYY-MM ตั้งแต่ start ถึง end (คุมไม่เกิน 12 เดือน)
function monthsBetween(start, end) {
  const a = String(start || '').slice(0, 7), b = String(end || start || '').slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(a)) return [];
  const out = []; let [y, m] = a.split('-').map(Number);
  const [ey, em] = /^\d{4}-\d{2}$/.test(b) ? b.split('-').map(Number) : [y, m];
  for (let i = 0; i < 12; i++) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    if (y > ey || (y === ey && m >= em)) break;
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

export function normalizeItravelsTours(payload, source = 'itravels', sourceName = 'iTravels Center') {
  const arr = payload?.data || (Array.isArray(payload) ? payload : []);
  const num = v => { const n = parseFloat(String(v ?? '').replace(/,/g, '')); return isNaN(n) ? 0 : n; };
  const firstPrice = (obj, key) => num(obj?.[key]?.[0]?.price);
  return arr.map(p => {
    const itinTitles = Array.isArray(p.program_detail) ? p.program_detail.slice(0, 5).map(d => d.title || '').join(' ') : '';
    const iso2      = detectItravelsCountry(`${p.name || ''} ${itinTitles}`);
    const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
    const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || iso2 || '';
    const basePrice = firstPrice(p.price, 'adult');

    const openPeriods = (Array.isArray(p.periods) ? p.periods : []).filter(per => per && per.visible !== false && per.date_start);
    let deps = openPeriods.map(per => {
      const seat = Number(per.seat) || 0;
      const avail = per.available_seat == null ? null : Number(per.available_seat);
      return {
        date:             per.date_start,
        returnDate:       per.date_end || null,
        price:            firstPrice(per.price, 'adult') || basePrice,
        childPrice:       firstPrice(per.price, 'child') || null,
        infantPrice:      firstPrice(per.price, 'infant') || null,
        singleSupplement: firstPrice(per.price, 'single_person') || null,
        deposit:          firstPrice(per.price, 'dept') || null,
        available:        avail,
        totalSeats:       seat || null,
        bookedSeats:      (seat && avail != null) ? Math.max(0, seat - avail) : 0,
        periodId:         per.full_code || per.code || '',
      };
    });
    // ไม่มีรอบจริง → สร้างรอบรายเดือนจากช่วง month_start..month_end ให้ตัวกรองเดือนทำงาน
    if (!deps.length && p.month_start) {
      deps = monthsBetween(p.month_start, p.month_end).map(ym => ({
        date: `${ym}-01`, returnDate: null, price: basePrice, childPrice: null, infantPrice: null,
        singleSupplement: null, deposit: null, available: null, totalSeats: null, bookedSeats: 0, periodId: ym,
      }));
    }
    const prices = deps.map(d => d.price || 0).filter(n => n > 0);
    const price = prices.length ? Math.min(...prices) : basePrice;

    const itinerary = (Array.isArray(p.program_detail) ? p.program_detail : []).map(d => ({
      day:   Number(d.day) || 0,
      title: d.title || '',
      description: stripHtml(d.highlight),
      meals: [d.food?.breakfast && 'เช้า', d.food?.lunch && 'กลางวัน', d.food?.dinner && 'เย็น'].filter(Boolean),
      hotel: d.hotel || '',
    }));

    return {
      id:          `sup_${source}_${p.code}`,
      code:        p.code || '',
      name:        { th: p.name, en: p.name },
      destination: { th: nameTh, en: iso2 },
      continent,
      country:     iso2,
      image:       p.banner || p.banner_square || '',
      price,
      duration:    Number(p.day) || 0,
      tourType:    'outbound',
      featured:    false,
      airline:     p.transporter_by || '',
      departures:  deps,
      groupSize:   Number(p.seat) || null,
      pdfUrl:      p.program_detail_file_pdf || null,
      itinerary,
      _source:     source,
      _sourceName: sourceName,
      _pbId:       p.code,
      _night:      Number(p.night) || 0,
      _hotelStars: null,
    };
  }).filter(t => t.name?.th && t.price > 0);
}

// ── Formosa Journey (api-formosa.ht1freshdigital.com/wp-json/bs-api) ──
// proxy คืน { data: { data: [...] } } · tour_country ชื่ออังกฤษ · tour_period = ช่วงวันที่ · price_start
export function normalizeFormosaTours(payload, source = 'formosa', sourceName = 'Formosa Journey') {
  const arr = payload?.data?.data || (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
  return arr.filter(p => p && p.id && p.post_status === 'publish').map(p => {
    const cname     = (Array.isArray(p.tour_country) ? p.tour_country[0]?.name : p.tour_country) || '';
    const iso2      = BEST_ISO[String(cname).toUpperCase().trim()] || codeFromThaiText(cname) || codeFromThaiText(p.title) || '';
    const continent = CODE_TO_CONTINENT[iso2] || 'Asia-East';
    const nameTh    = COUNTRY_CODE_NAME_TH[iso2] || cname || iso2;
    const price     = parseFloat(p.price_start) || 0;
    const m = String(p.tour_period || '').match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
    const start = m ? m[1] : (String(p.tour_period || '').match(/\d{4}-\d{2}-\d{2}/) || [''])[0];
    const end = m ? m[2] : start;
    const dm = String(p.number_of_days || '').match(/(\d+)\s*D\s*(\d+)\s*N/i);
    const deps = (price > 0 && (start || end)) ? [{ date: start || end, returnDate: end, price, available: 0, totalSeats: null, periodId: String(p.id) }] : [];
    return {
      id:          `sup_${source}_${p.id}`,
      code:        p.tour_id || '',
      name:        { th: p.title, en: p.title },
      destination: { th: nameTh, en: iso2 },
      continent,
      country:     iso2,
      image:       p.thumbnail || '',
      price,
      duration:    dm ? Number(dm[1]) : 0,
      tourType:    'outbound',
      featured:    false,
      airline:     (Array.isArray(p.tour_airline) ? p.tour_airline[0]?.name : '') || '',
      departures:  deps,
      groupSize:   null,
      pdfUrl:      p.file_pdf_url || null,
      itinerary:   Array.isArray(p.travel_schedule) ? p.travel_schedule.map(s => ({ day: s.travel_date || '', detail: s.schedule_details || '' })) : [],
      _source:     source,
      _sourceName: sourceName,
      _pbId:       p.id,
      _night:      dm ? Number(dm[2]) : 0,
      _hotelStars: null,
    };
  }).filter(t => t.departures.length > 0);
}

// ── Dispatch: เลือก normalizer ตาม format (ใช้ร่วมกันทั้ง App.jsx และหน้ารายละเอียด) ──
export function normalizeSupplierTours(format, data, id, name) {
  if (format === 'ttnplus')  return normalizeTtnPlusTours(data, id, name);
  if (format === 'best')     return normalizeBestTours(data, id, name);
  if (format === 'superb')   return normalizeSuperbTours(data, id, name);
  if (format === 'flyde')    return normalizeFlydeTours(data, id, name);
  if (format === 'formosa')  return normalizeFormosaTours(data, id, name);
  if (format === 'itravels') return normalizeItravelsTours(data, id, name);
  if (format === 'unique')   return normalizeUniqueTours(data, id, name);
  if (!Array.isArray(data)) return [];
  if (format === 'zego') return normalizeZegoTours(data, id, name);
  if (format === 'ttn')  return normalizeTtnTours(data, id, name);
  return normalizePbTours(data, id, name);
}

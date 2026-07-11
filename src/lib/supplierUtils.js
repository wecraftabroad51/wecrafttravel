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

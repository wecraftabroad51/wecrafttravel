import { useState, useMemo, useEffect } from 'react';
import TourCard from '../TourCard.jsx';
import { resolveCountryCode, COUNTRIES, flagUrl } from '../../lib/countries.js';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'grid':    return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'list':    return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'swap':    return <svg {...p}><path d="M3 8h14m0 0-4-4m4 4-4 4M21 16H7m0 0 4 4m-4-4 4-4"/></svg>;
    case 'check':   return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'users':   return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    case 'plane':   return <svg {...p}><path d="M3 13.5 21 6l-6 16-3-7-7-2z"/></svg>;
    case 'calendar':return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    default: return null;
  }
}

function TourRow({ tour, t, navigate, inCompare, onCompare }) {
  const name = t ? t(tour.name) : (tour.name?.en || tour.name?.th || tour.name || '');
  const destination = t ? t(tour.destination) : (tour.destination?.en || tour.destination?.th || '');
  const description = t ? t(tour.description) : (tour.description?.en || tour.description?.th || tour.description || '');
  const airline = tour.flight?.outbound?.airline || tour.airline || '';

  return (
    <article className="card layout-tours-item" style={{ overflow: 'hidden', background: 'var(--card)' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
        <img src={tour.image} alt={name} style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
        {tour.featured && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'var(--primary)', color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
            padding: '5px 10px', borderRadius: 999,
          }}>Featured</span>
        )}
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <span>{tour.continent}</span>
          {destination && <><span>·</span><span>{destination}</span></>}
        </div>
        <h3
          style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: 0, cursor: 'pointer' }}
          onClick={() => navigate('tour-detail', tour.id)}
        >
          {name}
        </h3>
        {description && (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{description}</p>
        )}
        <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'var(--ink-2)', marginTop: 'auto' }}>
          {tour.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} /> {tour.duration} {t ? t({ th: 'วัน', en: 'days' }) : 'days'}
            </span>
          )}
          {tour.groupSize && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="users" size={14} /> max {tour.groupSize}
            </span>
          )}
          {airline && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plane" size={14} /> {airline}
            </span>
          )}
          {tour.departures?.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="calendar" size={14} /> {tour.departures.length} dep.
            </span>
          )}
        </div>
      </div>
      <div style={{ borderLeft: '1px solid var(--line)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            {t ? t({ th: 'เริ่มต้น / คน', en: 'From / pax' }) : 'From / pax'}
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            ฿{tour.price?.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onCompare?.()}
            className="btn btn-light btn-sm"
            style={{
              flex: 1,
              background: inCompare ? 'var(--accent)' : 'var(--card)',
              color: inCompare ? '#fff' : 'var(--ink)',
              borderColor: inCompare ? 'var(--accent)' : 'var(--line)',
              justifyContent: 'center',
            }}
          >
            <Icon name={inCompare ? 'check' : 'swap'} size={12} />
            {inCompare
              ? (t ? t({ th: 'กำลังเปรียบ', en: 'Comparing' }) : 'Comparing')
              : (t ? t({ th: 'เปรียบเทียบ', en: 'Compare' }) : 'Compare')
            }
          </button>
          <button
            onClick={() => navigate('tour-detail', tour.id)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t ? t({ th: 'ดูทัวร์', en: 'View tour' }) : 'View tour'}
          </button>
        </div>
      </div>
    </article>
  );
}

const TOUR_TYPE_TABS = [
  { value: 'all',           label: 'ทั้งหมด',         labelEn: 'All' },
  { value: 'outbound',      label: 'ทัวร์ต่างประเทศ', labelEn: 'Outbound' },
  { value: 'inbound',       label: 'ทัวร์ในประเทศ',   labelEn: 'Inbound' },
  { value: 'premiumtour',   label: 'ทัวร์พรีเมี่ยม',  labelEn: 'Premium' },
  { value: 'hottour',       label: '🔥 โปรไฟไหม้',    labelEn: '🔥 Hot Tours' },
  { value: 'tourpackage',   label: 'แพ็คเกจทัวร์',    labelEn: 'Packages' },
  { value: 'ticketbooking', label: 'จองตั๋ว',          labelEn: 'Ticket Booking' },
];

const INTERNATIONAL_CONTINENTS = ['Europe','Asia-East','Asia-SE','Asia-S-ME','Americas','Oceania','Africa'];
const DOMESTIC_CONTINENTS = ['Dom-North','Dom-Central','Dom-South','Dom-NE'];
const PREMIUM_CONTINENTS = ['Europe','Asia-East','Asia-S-ME','Americas','Oceania'];

const CONTINENT_TH = {
  'Europe': 'ยุโรป', 'Asia': 'เอเชีย', 'Asia-East': 'เอเชียตะวันออก',
  'Asia-SE': 'เอเชียตะวันออกเฉียงใต้', 'Asia-S-ME': 'เอเชียใต้/ตะวันออกกลาง',
  'Middle East': 'ตะวันออกกลาง', 'Americas': 'อเมริกา',
  'Oceania': 'โอเชียเนีย', 'Africa': 'แอฟริกา',
  'Dom-North': 'ภาคเหนือ', 'Dom-Central': 'ภาคกลาง/ตะวันออก',
  'Dom-South': 'ภาคใต้', 'Dom-NE': 'ภาคอีสาน',
};

const CONTINENT_EN = {
  'Europe': 'Europe', 'Asia': 'Asia', 'Asia-East': 'East Asia',
  'Asia-SE': 'Southeast Asia', 'Asia-S-ME': 'South Asia / Middle East',
  'Middle East': 'Middle East', 'Americas': 'Americas',
  'Oceania': 'Oceania', 'Africa': 'Africa',
  'Dom-North': 'Northern TH', 'Dom-Central': 'Central TH',
  'Dom-South': 'Southern TH', 'Dom-NE': 'Northeastern TH',
  'All': 'All',
};

// เมือง/เส้นทางย่อยต่อประเทศ (เรียงตามความนิยม) — จับจากชื่อทัวร์
const REGION_KEYWORDS = {
  CN: ['เฉิงตู','เซี่ยงไฮ้','ฉงชิ่ง','ชิงเต่า','ปักกิ่ง','จางเจียเจี้ย','คุนหมิง','จิ่วจ้ายโกว','ซินเจียง','ซีอาน','ลี่เจียง','ฮาร์บิน','แชงกรีล่า','ต้าหลี่','กวางโจว','ซูโจว','หางโจว','ฉางซา','คานาสือ'],
  JP: ['โตเกียว','โอซาก้า','ฟูจิ','ฮอกไกโด','เกียวโต','ชิราคาวาโก','ทาคายาม่า','โอกินาว่า','คามาคุระ','นิกโก้','อิบารากิ','คิวชู','ฟุกุโอกะ','นาโกย่า','นารา'],
  TW: ['ไทเป','ไทจง','อาลีซาน','เกาสง','จิ่วเฟิ่น','ฮัวเหลียน'],
  VN: ['ดานัง','ฮอยอัน','ฮานอย','โฮจิมินห์','ซาปา','บานาฮิลล์','ฟูก๊วก','ดาลัด','ญาจาง','ฮาลอง'],
  KR: ['โซล','ปูซาน','เกาะเชจู','เชจู'],
};

export default function ToursPage({ lang, t, navigate, tours, supplierTours = [], promotions, faqs, reviews, settings, compareList, toggleCompare, setBookings, setReviews, setMessages, initialFilters }) {
  const [tourType,  setTourType]  = useState(initialFilters?.tourType  || 'all');
  const [continent, setContinent] = useState(initialFilters?.continent || 'All');
  const [country,   setCountry]   = useState(initialFilters?.country   || '');
  // Continent-group filter (from navbar mega-menu continent header click)
  const [groupCountries, setGroupCountries] = useState(initialFilters?.countries || null);
  const [groupLabel,     setGroupLabel]     = useState(initialFilters?.continentLabel || '');
  const [view, setView]           = useState('grid');
  const [search, setSearch]       = useState(initialFilters?.search    || '');
  const [sort, setSort]           = useState('popular');
  const [priceMax, setPriceMax]   = useState(100000);
  const [region, setRegion]       = useState('');   // เมืองย่อยที่เลือก

  // เปลี่ยนประเทศ → ล้างเมืองย่อย
  useEffect(() => { setRegion(''); }, [country]);

  // วัดความสูง navbar → ให้แถบ filter ค้างพอดีใต้ navbar (sticky)
  const [navH, setNavH] = useState(64);
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const measure = () => setNavH(header.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // รวมทัวร์ของเรา + ทัวร์ซัพพลายเออร์ (ลูกค้าไม่รู้ว่ามาจากไหน)
  const allTours = useMemo(() => [...tours, ...supplierTours], [tours, supplierTours]);

  const allContinents = Array.from(new Set(allTours.map(tr => tr.continent).filter(Boolean)));
  const relevantContinents = tourType === 'outbound' ? allContinents.filter(c => INTERNATIONAL_CONTINENTS.includes(c))
    : tourType === 'inbound' ? allContinents.filter(c => DOMESTIC_CONTINENTS.includes(c))
    : tourType === 'premiumtour' ? allContinents.filter(c => PREMIUM_CONTINENTS.includes(c))
    : allContinents;
  const continents = ['All', ...relevantContinents];

  // Legacy value map — รองรับค่าเก่าที่บันทึกด้วย Admin version เดิม
  const LEGACY = {
    outbound:    ['outbound',    'international'],
    inbound:     ['inbound',     'domestic'],
    premiumtour: ['premiumtour', 'premium'],
    hottour:     ['hottour',     'hotdeal'],
    tourpackage: ['tourpackage', 'package'],
  };

  // ── ชั้นที่ 1: กรองทุกอย่างยกเว้น "เมืองย่อย" และ sort ──────────
  const baseList = useMemo(() => {
    let list = [...allTours];
    if (tourType !== 'all') {
      if (tourType === 'hottour') {
        list = list.filter(tr => tr.tourType === 'hottour' || tr.tourType === 'hotdeal' || tr.featured === true);
      } else {
        const accepted = LEGACY[tourType] || [tourType];
        list = list.filter(tr => accepted.includes(tr.tourType));
      }
    }
    if (continent !== 'All') list = list.filter(tr => tr.continent === continent);
    if (country) list = list.filter(tr =>
      resolveCountryCode(tr) === country ||
      tr.country === country ||
      t(tr.destination)?.includes(country)
    );
    if (groupCountries?.length) {
      list = list.filter(tr =>
        groupCountries.includes(resolveCountryCode(tr)) ||
        groupCountries.includes(tr.country) ||
        groupCountries.some(gc => t(tr.destination)?.includes(gc))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tr => {
        const name = t ? t(tr.name) : (tr.name?.en || tr.name?.th || '');
        const dest = t ? t(tr.destination) : (tr.destination?.en || tr.destination?.th || '');
        const desc = t ? t(tr.description) : (tr.description?.en || tr.description?.th || '');
        const code = (tr.code || '').toLowerCase();
        return code.includes(q) || name.toLowerCase().includes(q) || dest.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      });
    }
    return list;
  }, [allTours, tourType, continent, country, groupCountries, search, lang]);

  // ── เมืองย่อยของประเทศที่เลือก (เฉพาะที่มีทัวร์จริง) ────────────
  const nameHas = (tr, kw) => (tr.name?.th || '').includes(kw) || (t(tr.destination) || '').includes(kw);
  const regionChips = useMemo(() => {
    const kws = REGION_KEYWORDS[country];
    if (!kws) return [];
    return kws
      .map(kw => ({ kw, count: baseList.filter(tr => nameHas(tr, kw)).length }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [country, baseList]);

  // ── ชั้นที่ 2: กรองเมืองย่อย + sort ───────────────────────────
  const filtered = useMemo(() => {
    let list = region ? baseList.filter(tr => nameHas(tr, region)) : baseList;
    if (sort === 'price-low')  list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-high') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === 'duration')   list = [...list].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    if (sort === 'popular')    list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [baseList, region, sort]);

  const clearGroupFilter = () => { setGroupCountries(null); setGroupLabel(''); };

  // นับจำนวนทัวร์ต่อประเทศ (เรียงมากไปน้อย) สำหรับแถบเลือกจุดหมาย
  const countryChips = useMemo(() => {
    const m = {};
    for (const tr of allTours) { const c = resolveCountryCode(tr); if (c) m[c] = (m[c] || 0) + 1; }
    return Object.entries(m)
      .filter(([c]) => COUNTRIES[c])
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count, ...COUNTRIES[code] }));
  }, [allTours]);

  const CATEGORIES = [
    { value: 'all',         th: 'ทั้งหมด',        en: 'All' },
    { value: 'hottour',     th: '🔥 โปรไฟไหม้',   en: '🔥 Hot' },
    { value: 'premiumtour', th: 'พรีเมี่ยม',      en: 'Premium' },
    { value: 'tourpackage', th: 'แพ็กเกจ',        en: 'Packages' },
  ];

  const activeCountry = country && COUNTRIES[country] ? COUNTRIES[country] : null;
  const clearCountry  = () => setCountry('');

  return (
    <main className="page-enter">
      {/* Header */}
      {/* Breadcrumb */}
      <div className="wrap-wide" style={{ padding: '10px 0 0' }}>
        <nav style={{ fontSize: 13.5, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13.5, padding: 0 }}>
            {lang === 'th' ? 'หน้าหลัก' : 'Home'}
          </button>
          <span>/</span>
          {groupLabel ? (
            <>
              <button onClick={clearGroupFilter} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13.5, padding: 0 }}>
                {lang === 'th' ? 'ทัวร์ทั้งหมด' : 'All Tours'}
              </button>
              <span>/</span>
              <span style={{ color: 'var(--ink)' }}>{groupLabel}</span>
            </>
          ) : (
            <span style={{ color: 'var(--ink)' }}>{lang === 'th' ? 'ทัวร์ทั้งหมด' : 'All Tours'}</span>
          )}
        </nav>
      </div>

      {/* Continent-group banner (from navbar mega-menu) */}
      {groupLabel && (
        <div className="wrap-wide" style={{ padding: '14px 0 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 12,
            padding: '14px 20px',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                {lang === 'th' ? 'กำลังแสดงทัวร์ในภูมิภาค' : 'Showing tours in region'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                🌍 {groupLabel}
              </div>
            </div>
            <button onClick={clearGroupFilter} className="btn btn-light btn-sm" style={{ background: '#fff' }}>
              {lang === 'th' ? '✕ ล้างตัวกรองภูมิภาค' : '✕ Clear region filter'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar (ค้างใต้ navbar เวลาเลื่อน) ───────────────── */}
      <section style={{ position: 'sticky', top: navH, zIndex: 20, background: 'var(--canvas)', borderBottom: '1px solid var(--line)', boxShadow: '0 4px 10px rgba(0,0,0,.04)', padding: '10px 0 8px', marginTop: 8 }}>
        <div className="wrap-wide" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Row 1: search + sort */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--card)' }}>
              <Icon name="search" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'th' ? 'ค้นหาประเทศ เมือง หรือรหัสทัวร์…' : 'Search country, city or code…'}
                style={{ border: 'none', padding: 0, background: 'transparent', fontSize: 15, width: '100%', outline: 'none' }} />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ width: 'auto', minWidth: 132, flex: '0 0 auto', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--card)', fontSize: 14.5, cursor: 'pointer' }}>
              <option value="popular">{lang === 'th' ? 'ยอดนิยม' : 'Popular'}</option>
              <option value="price-low">{lang === 'th' ? 'ราคาต่ำ→สูง' : 'Price ↑'}</option>
              <option value="price-high">{lang === 'th' ? 'ราคาสูง→ต่ำ' : 'Price ↓'}</option>
            </select>
          </div>

          {/* Row 2: category chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
            {CATEGORIES.map(c => {
              const on = tourType === c.value;
              return (
                <button key={c.value} onClick={() => setTourType(c.value)}
                  style={{ flexShrink: 0, padding: '6px 15px', borderRadius: 999, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--canvas)' : 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                  {lang === 'th' ? c.th : c.en}
                </button>
              );
            })}
          </div>

          {/* Row 3: country quick-pick chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
            <button onClick={clearCountry}
              style={{ flexShrink: 0, padding: '7px 15px', borderRadius: 999, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                border: `1px solid ${!country ? 'var(--primary)' : 'var(--line)'}`, background: !country ? 'var(--primary)' : 'var(--card)', color: !country ? '#fff' : 'var(--ink-2)' }}>
              {lang === 'th' ? 'ทุกประเทศ' : 'All'}
            </button>
            {countryChips.map(c => {
              const on = country === c.code;
              return (
                <button key={c.code} onClick={() => setCountry(on ? '' : c.code)}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary-light)' : 'var(--card)', color: on ? 'var(--primary)' : 'var(--ink-2)' }}>
                  <img src={flagUrl(c.code, '32x24')} alt="" width={22} height={16} loading="lazy"
                    style={{ borderRadius: 3, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }} />
                  {lang === 'th' ? c.th : c.en}
                  <span style={{ fontSize: 12.5, fontWeight: 700, opacity: .65 }}>{c.count}</span>
                </button>
              );
            })}
          </div>

          {/* Row 4: sub-region chips (เมืองย่อย) — โผล่เมื่อประเทศมีเส้นทางเยอะ */}
          {regionChips.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }} className="no-scrollbar">
              <span style={{ flexShrink: 0, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, paddingRight: 2 }}>
                {lang === 'th' ? 'เมือง/เส้นทาง:' : 'City:'}
              </span>
              <button onClick={() => setRegion('')}
                style={{ flexShrink: 0, padding: '5px 13px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  border: `1px solid ${!region ? 'var(--accent, #e65c00)' : 'var(--line)'}`, background: !region ? 'var(--accent, #e65c00)' : 'var(--card)', color: !region ? '#fff' : 'var(--ink-2)' }}>
                {lang === 'th' ? 'ทั้งหมด' : 'All'}
              </button>
              {regionChips.map(r => {
                const on = region === r.kw;
                return (
                  <button key={r.kw} onClick={() => setRegion(on ? '' : r.kw)}
                    style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      border: `1px solid ${on ? 'var(--accent, #e65c00)' : 'var(--line)'}`, background: on ? '#fff3ec' : 'var(--card)', color: on ? 'var(--accent, #e65c00)' : 'var(--ink-2)' }}>
                    {r.kw}
                    <span style={{ fontSize: 12, fontWeight: 700, opacity: .6 }}>{r.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="wrap-wide">
          {/* Result count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              {lang === 'th' ? 'พบ ' : 'Found '}
              <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{filtered.length}</span>
              {lang === 'th' ? ' ทัวร์' : ' tours'}
              {activeCountry && <span> · {lang === 'th' ? activeCountry.th : activeCountry.en}</span>}
              {region && <span> · {region}</span>}
            </div>
            {(activeCountry || tourType !== 'all' || search) && (
              <button onClick={() => { setCountry(''); setTourType('all'); setSearch(''); clearGroupFilter(); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                {lang === 'th' ? '✕ ล้างตัวกรอง' : '✕ Clear filters'}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {t ? t({ th: 'ไม่พบทัวร์', en: 'No tours match these filters.' }) : 'No tours match.'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                {lang === 'th' ? 'ลองเลือกประเทศหรือหมวดอื่นจากเมนูด้านบน' : 'Try another country or category from the menu.'}
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="tours-grid" style={{ gap: 16 }}>
              {filtered.map(tr => (
                <TourCard
                  key={tr.id} tour={tr} t={t} navigate={navigate}
                  inCompare={compareList.includes(tr.id)}
                  onCompare={() => toggleCompare(tr.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(tr => (
                <TourRow
                  key={tr.id} tour={tr} t={t} navigate={navigate}
                  inCompare={compareList.includes(tr.id)}
                  onCompare={() => toggleCompare(tr.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

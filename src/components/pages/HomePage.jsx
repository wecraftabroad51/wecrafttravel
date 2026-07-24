import { useState, useEffect, useRef, useMemo } from 'react';
import TourCard from '../TourCard.jsx';

function Icon({ name, size = 18, color }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':    return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'map-pin':   return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'arrow-r':   return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-l':   return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'plane':     return <svg {...p}><path d="M3 13.5 21 6l-6 16-3-7-7-2z"/></svg>;
    case 'shield':    return <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z"/></svg>;
    case 'headset':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3c-4.6 0-9 3.4-9 9v2a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4"/><path d="M20 14a2 2 0 0 0 2-2v-1c0-5.6-4.4-9-10-9s-10 3.4-10 9v1a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-1"/></svg>;
    case 'check':     return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'star':      return <svg width={size} height={size} viewBox="0 0 24 24" fill="#f9a825" stroke="#f9a825" strokeWidth="1"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
    case 'quote':     return <svg {...p} strokeWidth={1.5}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
    default: return null;
  }
}

// ─── SLIDES DATA ─────────────────────────────────────────────
// แบนเนอร์ทั้งหมดออกแบบสำเร็จ (มีข้อความ/โลโก้ในตัว) → แสดงเต็มใบ ไม่ทับ overlay
const SLIDES = [
  {
    plain: true,
    alt:   { th: 'WeCraft Travel — ให้สนุกทุกโลเคชั่น', en: 'WeCraft Travel — Fun in every location' },
    img:   '/hero-banner-1.jpg',
    link:  'tours',
  },
];

// ─── HERO (full-width carousel) ───────────────────────────────
function HeroSection({ navigate, lang }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const go = (n) => setIdx((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 10000);
    return () => clearInterval(timerRef.current);
  }, []);

  const s = SLIDES[idx];
  const L = lang || 'th';
  return (
    <div className="hero-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Slides */}
      {SLIDES.map((sl, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === idx ? 1 : 0, transition: 'opacity .7s ease' }}>
          {sl.plain ? (
            <div
              onClick={() => navigate(sl.link || 'tours', null, sl.filters || null)}
              style={{ position: 'absolute', inset: 0, cursor: 'pointer', background: '#e6f2f0' }}
            >
              {/* แบนเนอร์เต็มเฟรม ขอบซ้าย-ขวาชิดเบราว์เซอร์ */}
              <img src={sl.img} alt={(sl.alt?.[lang] || sl.alt?.th) || ''}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
          ) : (
            <>
              <img src={sl.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.65) 0%, rgba(0,0,0,.15) 60%)' }} />
            </>
          )}
        </div>
      ))}
      {/* Content — ซ่อนบนสไลด์แบนเนอร์สำเร็จรูป */}
      {!s.plain && (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ color: '#fff' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-block', background: 'var(--primary)', padding: '4px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              {s.tag[L] || s.tag.th}
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>
              {s.title[L] || s.title.th}
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 16, opacity: .9, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{s.sub[L] || s.sub.th}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <button onClick={() => navigate('tours')} style={{
                background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6,
                padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(230,92,0,.5)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {L === 'th' ? 'ดูโปรแกรม' : 'View Tours'} <Icon name="arrow-r" size={15} color="#fff" />
              </button>
              <div>
                <div style={{ fontSize: 12, opacity: .8 }}>{L === 'th' ? 'ราคาเริ่มต้น' : 'Starting from'}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#FFD54F', lineHeight: 1 }}>฿{s.price}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Arrows / Dots / Counter — เฉพาะเมื่อมีมากกว่า 1 สไลด์ */}
      {SLIDES.length > 1 && (
        <>
          <button aria-label="ก่อนหน้า" onClick={() => go(idx - 1)} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.32)', backdropFilter: 'blur(2px)', border: '1.5px solid rgba(255,255,255,.7)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.25)' }}>
            <Icon name="arrow-l" size={20} color="#fff" />
          </button>
          <button aria-label="ถัดไป" onClick={() => go(idx + 1)} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.32)', backdropFilter: 'blur(2px)', border: '1.5px solid rgba(255,255,255,.7)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.25)' }}>
            <Icon name="arrow-r" size={20} color="#fff" />
          </button>
          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', gap: 8 }}>
            {SLIDES.map((_, i) => <button key={i} className={`carousel-dot${i === idx ? ' active' : ''}`} onClick={() => go(i)} />)}
          </div>
          <div style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(0,0,0,.45)', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
            {idx + 1} / {SLIDES.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SEARCH BOX (left sidebar) ────────────────────────────────
const TOUR_TYPE_OPTIONS = [
  { value: 'outbound',      label: 'ทัวร์ต่างประเทศ',  labelEn: 'Outbound' },
  { value: 'inbound',       label: 'ทัวร์ในประเทศ',    labelEn: 'Inbound' },
  { value: 'premiumtour',   label: 'ทัวร์พรีเมี่ยม',   labelEn: 'Premium' },
  { value: 'hottour',       label: '🔥 ทัวร์โปรไฟไหม้', labelEn: '🔥 Hot Tours' },
  { value: 'tourpackage',   label: 'แพ็คเกจทัวร์',     labelEn: 'Packages' },
  { value: 'ticketbooking', label: 'จองตั๋ว',           labelEn: 'Ticket Booking' },
];
const ZONE_OPTIONS = [
  { value: 'Europe',      label: 'ยุโรป',                        labelEn: 'Europe',                   countries: ['ฝรั่งเศส','อิตาลี','สวิตเซอร์แลนด์','เยอรมัน','อังกฤษ','สเปน','โปรตุเกส','ออสเตรีย','นอร์เวย์','สวีเดน','กรีซ','ตุรกี'] },
  { value: 'Asia-East',   label: 'เอเชียตะวันออก',               labelEn: 'East Asia',                countries: ['ญี่ปุ่น','จีน','เกาหลีใต้','ไต้หวัน','ฮ่องกง','มาเก๊า'] },
  { value: 'Asia-SE',     label: 'เอเชียตะวันออกเฉียงใต้',       labelEn: 'Southeast Asia',           countries: ['สิงคโปร์','เวียดนาม','มาเลเซีย','อินโดนีเซีย','ฟิลิปปินส์','พม่า','กัมพูชา','ลาว'] },
  { value: 'Asia-S-ME',   label: 'เอเชียใต้ / ตะวันออกกลาง',    labelEn: 'South Asia / Middle East', countries: ['อินเดีย','มัลดีฟส์','ศรีลังกา','สหรัฐอาหรับเอมิเรตส์','กาตาร์','จอร์แดน'] },
  { value: 'Americas',    label: 'อเมริกา',                      labelEn: 'Americas',                 countries: ['สหรัฐอเมริกา','แคนาดา','เม็กซิโก','เปรู','บราซิล'] },
  { value: 'Oceania',     label: 'โอเชียเนีย / แปซิฟิก',         labelEn: 'Oceania / Pacific',        countries: ['ออสเตรเลีย','นิวซีแลนด์','ฟิจิ','ฮาวาย'] },
  { value: 'Africa',      label: 'แอฟริกา',                      labelEn: 'Africa',                   countries: ['โมร็อกโก','แอฟริกาใต้','เคนยา','อียิปต์','แทนซาเนีย'] },
  { value: 'Dom-North',   label: 'ในประเทศ — ภาคเหนือ',          labelEn: 'Domestic — North',         countries: ['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','น่าน','ลำปาง'] },
  { value: 'Dom-Central', label: 'ในประเทศ — ภาคกลาง/ตะวันออก', labelEn: 'Domestic — Central/East',  countries: ['กรุงเทพฯ','พัทยา','ระยอง','เกาะเสม็ด','กาญจนบุรี'] },
  { value: 'Dom-South',   label: 'ในประเทศ — ภาคใต้',            labelEn: 'Domestic — South',         countries: ['ภูเก็ต','กระบี่','เกาะสมุย','เกาะพะงัน','เกาะลันตา','ตรัง'] },
  { value: 'Dom-NE',      label: 'ในประเทศ — ภาคอีสาน',          labelEn: 'Domestic — Northeast',     countries: ['เขาใหญ่','โคราช','ขอนแก่น','อุดรธานี','หนองคาย','เลย'] },
];
const AIRLINES = ['การบินไทย', 'Thai Airways', 'AirAsia', 'Nok Air', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Korean Air', 'Japan Airlines', 'Cathay Pacific'];

const QUICK_LINKS = [
  { label: 'ญี่ปุ่น',   labelEn: 'Japan',     country: 'ญี่ปุ่น',   continent: 'Asia-East',  tourType: 'outbound'},
  { label: 'เกาหลี',   labelEn: 'Korea',     country: 'เกาหลีใต้', continent: 'Asia-East',  tourType: 'outbound'},
  { label: 'จีน',      labelEn: 'China',     country: 'จีน',       continent: 'Asia-East',  tourType: 'outbound'},
  { label: 'ยุโรป',    labelEn: 'Europe',    country: '',          continent: 'Europe',     tourType: 'outbound'},
  { label: 'มัลดีฟส์', labelEn: 'Maldives',  country: 'มัลดีฟส์',  continent: 'Asia-S-ME',  tourType: 'outbound'},
  { label: 'สิงคโปร์', labelEn: 'Singapore', country: 'สิงคโปร์',  continent: 'Asia-SE',    tourType: 'outbound'},
  { label: 'เวียดนาม', labelEn: 'Vietnam',   country: 'เวียดนาม',  continent: 'Asia-SE',    tourType: 'outbound'},
  { label: 'ไต้หวัน',  labelEn: 'Taiwan',    country: 'ไต้หวัน',   continent: 'Asia-East',  tourType: 'outbound'},
];

function SearchSidebar({ navigate, lang }) {
  const [tourType, setTourType] = useState('');
  const [zone, setZone] = useState('');
  const [country, setCountry] = useState('');
  const [airline, setAirline] = useState('');
  const [month, setMonth] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const zoneObj = ZONE_OPTIONS.find(z => z.value === zone);
  const countries = zoneObj ? zoneObj.countries : [];
  const MONTH_NAMES = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const monthOptions = (() => {
    const opts = [];
    const now = new Date();
    const startYear = now.getFullYear() + 543;
    const startMonth = now.getMonth();
    for (let y = startYear; y <= 2580; y++) {
      const mStart = y === startYear ? startMonth : 0;
      for (let m = mStart; m < 12; m++) {
        opts.push(`${MONTH_NAMES[m]} ${y}`);
      }
    }
    return opts;
  })();

  const handleSearch = () => {
    const filters = {};
    if (tourType)    filters.tourType  = tourType;
    if (zone)        filters.continent = zone;
    if (country)     filters.country   = country;
    if (codeSearch.trim()) filters.search = codeSearch.trim();
    navigate('tours', null, filters);
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,.08)',
      position: 'sticky',
      top: 116,
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #ff8c33)', color: '#fff', padding: '18px 20px', fontSize: 18.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 9, letterSpacing: '.01em' }}>
        <Icon name="search" size={22} color="#fff" /> {lang === 'th' ? 'ค้นหาทัวร์ที่ต้องการ' : 'Find Your Tour'}
      </div>
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {/* ช่องค้นหารหัส / ชื่อทัวร์ */}
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'รหัสทัวร์ / ชื่อทัวร์' : 'Tour Code / Name'}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 8, padding: '0 12px' }}>
            <Icon name="search" size={17} />
            <input
              value={codeSearch}
              onChange={e => setCodeSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'th' ? 'พิมพ์รหัสหรือชื่อทัวร์...' : 'Enter code or tour name...'}
              style={{ border: 'none', padding: '12px 0', background: 'transparent', fontSize: 15.5, width: '100%', fontFamily: 'inherit' }}
            />
            {codeSearch && (
              <button onClick={() => setCodeSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            )}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'ประเภทการเดินทาง' : 'Tour Type'}</label>
          <select value={tourType} onChange={e => setTourType(e.target.value)}>
            <option value="">{lang === 'th' ? '-- ทุกประเภท --' : '-- All Types --'}</option>
            {TOUR_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{lang === 'en' ? opt.labelEn : opt.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'โซน / ทวีป' : 'Zone / Continent'}</label>
          <select value={zone} onChange={e => { setZone(e.target.value); setCountry(''); }}>
            <option value="">{lang === 'th' ? '-- เลือกโซน --' : '-- Select Zone --'}</option>
            {ZONE_OPTIONS.map(z => <option key={z.value} value={z.value}>{lang === 'en' ? z.labelEn : z.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'ประเทศ / จังหวัด' : 'Country / Province'}</label>
          <select value={country} onChange={e => setCountry(e.target.value)} disabled={!zone}>
            <option value="">{lang === 'th' ? '-- เลือกประเทศ --' : '-- Select Country --'}</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'สายการบิน' : 'Airline'}</label>
          <select value={airline} onChange={e => setAirline(e.target.value)}>
            <option value="">{lang === 'th' ? '-- ทุกสายการบิน --' : '-- All Airlines --'}</option>
            {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{lang === 'th' ? 'เดือนที่เดินทาง' : 'Travel Month'}</label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">{lang === 'th' ? '-- ทุกเดือน --' : '-- Any Month --'}</option>
            {monthOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={handleSearch} style={{
          background: 'linear-gradient(135deg, var(--primary), #ff8c33)', color: '#fff', border: 'none', borderRadius: 9,
          padding: '15px 0', fontSize: 16.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 14px rgba(230,92,0,.36)', marginTop: 4,
        }}>
          <Icon name="search" size={18} color="#fff" /> {lang === 'th' ? 'ค้นหาทัวร์' : 'Search Tours'}
        </button>
        {/* Quick links */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 7 }}>{lang === 'th' ? 'ค้นหาด่วน' : 'Quick Links'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {QUICK_LINKS.map(ql => (
              <button key={ql.label} onClick={() => navigate('tours', null, { tourType: ql.tourType, continent: ql.continent, country: ql.country })} style={{
                background: 'var(--primary-light)', color: 'var(--primary)',
                border: '1px solid #ffc89a', borderRadius: 999,
                padding: '3px 10px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{lang === 'en' ? ql.labelEn : ql.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
function SectionHeader({ title, emoji, sub, onMore, moreLabel = 'ดูทั้งหมด' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 5, height: 26, background: 'var(--primary)', borderRadius: 3 }} />
          {emoji && <span>{emoji}</span>} {title}
        </h2>
        {sub && <p style={{ margin: '4px 0 0 13px', fontSize: 13, color: 'var(--muted)' }}>{sub}</p>}
      </div>
      {onMore && (
        <button
          onClick={onMore}
          style={{
            background: 'transparent', border: '1px solid var(--primary)',
            color: 'var(--primary)', padding: '7px 18px',
            borderRadius: 4, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {moreLabel} <Icon name="arrow-r" size={13} color="var(--primary)" />
        </button>
      )}
    </div>
  );
}

// ─── HOT DEALS SECTION ───────────────────────────────────────
function HotDealsSection({ tours, navigate, t, compareList, toggleCompare, inner, lang }) {
  const hotTours = tours.filter(tr => tr.featured).slice(0, inner ? 3 : 4);
  if (!hotTours.length) return null;

  const content = (
    <>
      <SectionHeader
        title={lang === 'th' ? 'ทัวร์โปรไฟไหม้' : 'Hot Deals'}
        emoji="🔥"
        sub={lang === 'th' ? 'โปรโมชั่นพิเศษ ราคาถูกมาก จองด่วน ก่อนเต็ม!' : 'Special deals — book fast before sold out!'}
        onMore={() => navigate('tours')}
        moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'}
      />
      <div className={inner ? 'grid-cols-3' : 'grid-cols-4'} style={{ gap: 16 }}>
        {hotTours.map(tr => (
          <TourCard
            key={tr.id} tour={tr} t={t} navigate={navigate}
            inCompare={compareList.includes(tr.id)}
            onCompare={() => toggleCompare(tr.id)}
          />
        ))}
      </div>
    </>
  );

  if (inner) return content;
  return (
    <section style={{ background: '#fff7f0', padding: '36px 0', borderTop: '3px solid var(--primary)' }}>
      <div className="wrap">{content}</div>
    </section>
  );
}

// ─── NEW TOURS ───────────────────────────────────────────────
function NewToursSection({ tours, navigate, t, compareList, toggleCompare, lang }) {
  const newTours = tours.slice(0, 4);
  if (!newTours.length) return null;

  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader
          title={lang === 'th' ? 'โปรแกรมทัวร์มาใหม่' : 'New Tours'}
          emoji="✨"
          sub={lang === 'th' ? 'อัพเดทโปรแกรมท่องเที่ยวใหม่ล่าสุด พร้อมออกเดินทาง' : 'Latest tour programs, ready to depart'}
          onMore={() => navigate('tours')}
          moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'}
        />
        <div className="grid-cols-4" style={{ gap: 16 }}>
          {newTours.map(tr => (
            <TourCard
              key={tr.id} tour={tr} t={t} navigate={navigate}
              inCompare={compareList.includes(tr.id)}
              onCompare={() => toggleCompare(tr.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DESTINATION CATEGORIES ──────────────────────────────────
const DESTINATIONS = [
  { name: 'ทัวร์จีน',        nameEn: 'China Tours',        count: 120, emoji: '🇨🇳', img: 'https://picsum.photos/seed/china1/400/300',     country: 'จีน',         continent: 'Asia-East',  tourType: 'outbound'},
  { name: 'ทัวร์ญี่ปุ่น',    nameEn: 'Japan Tours',        count: 98,  emoji: '🇯🇵', img: 'https://picsum.photos/seed/japan1/400/300',     country: 'ญี่ปุ่น',     continent: 'Asia-East',  tourType: 'outbound'},
  { name: 'ทัวร์เกาหลี',     nameEn: 'Korea Tours',        count: 64,  emoji: '🇰🇷', img: 'https://picsum.photos/seed/korea1/400/300',     country: 'เกาหลีใต้',   continent: 'Asia-East',  tourType: 'outbound'},
  { name: 'ทัวร์ยุโรป',      nameEn: 'Europe Tours',       count: 85,  emoji: '🏰',  img: 'https://picsum.photos/seed/europe1/400/300',    country: '',             continent: 'Europe',     tourType: 'outbound'},
  { name: 'ทัวร์ไต้หวัน',    nameEn: 'Taiwan Tours',       count: 42,  emoji: '🇹🇼', img: 'https://picsum.photos/seed/taiwan1/400/300',    country: 'ไต้หวัน',     continent: 'Asia-East',  tourType: 'outbound'},
  { name: 'ทัวร์สิงคโปร์',   nameEn: 'Singapore Tours',    count: 38,  emoji: '🇸🇬', img: 'https://picsum.photos/seed/singapore1/400/300', country: 'สิงคโปร์',    continent: 'Asia-SE',    tourType: 'outbound'},
  { name: 'ทัวร์ฮ่องกง',     nameEn: 'Hong Kong Tours',    count: 55,  emoji: '🏙️', img: 'https://picsum.photos/seed/hongkong1/400/300',  country: 'ฮ่องกง',      continent: 'Asia-East',  tourType: 'outbound'},
  { name: 'ทัวร์อเมริกา',    nameEn: 'USA Tours',          count: 29,  emoji: '🗽',  img: 'https://picsum.photos/seed/america1/400/300',   country: 'สหรัฐอเมริกา', continent: 'Americas',  tourType: 'outbound'},
  { name: 'ทัวร์เวียดนาม',   nameEn: 'Vietnam Tours',      count: 47,  emoji: '🇻🇳', img: 'https://picsum.photos/seed/vietnam1/400/300',   country: 'เวียดนาม',    continent: 'Asia-SE',    tourType: 'outbound'},
  { name: 'ทัวร์อินเดีย',    nameEn: 'India Tours',        count: 31,  emoji: '🇮🇳', img: 'https://picsum.photos/seed/india1/400/300',     country: 'อินเดีย',     continent: 'Asia-S-ME',  tourType: 'outbound'},
  { name: 'ทัวร์สหรัฐอาหรับ', nameEn: 'UAE Tours',         count: 22,  emoji: '🕌',  img: 'https://picsum.photos/seed/dubai1/400/300',     country: 'สหรัฐอาหรับเอมิเรตส์', continent: 'Asia-S-ME', tourType: 'outbound'},
  { name: 'ทัวร์มัลดีฟส์',   nameEn: 'Maldives Tours',     count: 18,  emoji: '🏝️', img: 'https://picsum.photos/seed/maldives1/400/300',  country: 'มัลดีฟส์',    continent: 'Asia-S-ME',  tourType: 'outbound'},
];

function DestinationsSection({ navigate, inner, lang }) {
  const cols = inner ? 'grid-cols-4' : 'grid-cols-6';
  const content = (
    <>
      <SectionHeader title={lang === 'th' ? 'หมวดหมู่ยอดนิยม' : 'Popular Destinations'} emoji="🌏" sub={lang === 'th' ? 'เลือกปลายทางที่คุณฝัน' : 'Choose your dream destination'} onMore={() => navigate('tours')} moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'} />
      <div className={cols} style={{ gap: 12 }}>
        {DESTINATIONS.map(d => (
          <div key={d.name} className="cat-card" onClick={() => navigate('tours', null, { tourType: d.tourType, continent: d.continent, country: d.country })}>
            <img src={d.img} alt={d.name} loading="lazy" />
            <div className="cat-card-overlay">
              <div className="cat-card-title">{d.emoji} {lang === 'en' ? (d.nameEn || d.name).replace('Tours','') : d.name.replace('ทัวร์', '')}</div>
              <div className="cat-card-count">{d.count} {lang === 'th' ? 'โปรแกรม' : 'tours'}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (inner) return content;
  return (
    <section style={{ background: 'var(--canvas-2)', padding: '36px 0' }}>
      <div className="wrap">{content}</div>
    </section>
  );
}

// ─── WHY US ──────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: 'plane',   title: 'ใบอนุญาตนำเที่ยว',                  titleEn: 'Licensed Agency',    desc: 'ได้รับใบอนุญาตประกอบธุรกิจนำเที่ยวจากกรมการท่องเที่ยว เลขที่ 11/11550', descEn: 'Licensed tour operator by the Tourism Department, no. 11/11550' },
  { icon: 'shield',  title: 'ประกันภัยการเดินทาง',                 titleEn: 'Travel Insurance',   desc: 'ทุกทริปมีประกันภัยครบถ้วน คุ้มครองอุบัติเหตุและการเจ็บป่วย',           descEn: 'Every trip fully insured — accident & illness coverage included' },
  { icon: 'headset', title: 'ทีมงานมืออาชีพ',                     titleEn: 'Professional Team',  desc: 'ไกด์ผู้ชำนาญ ดูแลตลอด 24 ชั่วโมง ตั้งแต่ต้นทางถึงปลายทาง',           descEn: 'Expert guides, 24/7 support from departure to return' },
  { icon: 'check',   title: 'ราคาโปร่งใส ไม่มีค่าใช้จ่ายแอบแฝง', titleEn: 'Transparent Pricing', desc: 'ระบุรายละเอียดชัดเจน ทำให้คุณวางแผนได้อย่างสบายใจ',                    descEn: 'Clear itemised costs — no hidden charges, ever' },
];

function WhyUsSection({ lang }) {
  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title={lang === 'th' ? 'เหตุผลที่นักท่องเที่ยวมั่นใจให้เราดูแล' : 'Why Travellers Trust Us'} emoji="❤️" />
        <div className="why-grid">
          {WHY_ITEMS.map((w, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '24px 16px',
              borderRadius: 10, border: '1px solid var(--line)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(230,92,0,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--primary-light)', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={w.icon} size={26} color="var(--primary)" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{lang === 'en' ? w.titleEn : w.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>{lang === 'en' ? w.descEn : w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROMOTIONS BANNER ───────────────────────────────────────
function PromoBanners({ promotions, navigate, t, lang }) {
  const promos = promotions.slice(0, 3);
  if (!promos.length) return null;

  return (
    <section style={{ background: '#fff7f0', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title={lang === 'th' ? 'โปรโมชั่นพิเศษ' : 'Special Promotions'} emoji="🎁" sub={lang === 'th' ? 'ส่วนลดพิเศษ จำกัดจำนวน' : 'Limited time offers'} onMore={() => navigate('promotions')} moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'} />
        <div className="grid-cols-3" style={{ gap: 16 }}>
          {promos.map((p, i) => (
            <div key={p.id} style={{
              borderRadius: 10, overflow: 'hidden',
              background: i === 0 ? 'linear-gradient(135deg, #e65c00, #ff8f00)' : i === 1 ? 'linear-gradient(135deg, #1565C0, #1976D2)' : 'linear-gradient(135deg, #2E7D32, #43A047)',
              color: '#fff', padding: 24,
              display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180,
            }}>
              <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
                {p.discount || 10}<span style={{ fontSize: 22 }}>%</span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>
                  {t ? t(p.title) : (p.title?.th || p.title || '')}
                </h3>
                <p style={{ margin: 0, fontSize: 13, opacity: .88 }}>
                  {t ? t(p.description) : (p.description?.th || '')}
                </p>
              </div>
              {p.code && (
                <div style={{
                  background: 'rgba(255,255,255,.2)', borderRadius: 6,
                  padding: '6px 14px', alignSelf: 'flex-start',
                  fontSize: 14, fontWeight: 700, letterSpacing: 1,
                }}>
                  CODE: {p.code}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── REVIEWS ─────────────────────────────────────────────────
function ReviewsSection({ reviews, lang }) {
  const [idx, setIdx] = useState(0);
  const approved = reviews.filter(r => r.approved && !r.text?._hidden).slice(0, 6);
  if (!approved.length) return null;

  return (
    <section style={{ background: 'var(--canvas-2)', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title={lang === 'th' ? 'รีวิวจากลูกค้าจริง' : 'Customer Reviews'} emoji="💬" sub={lang === 'th' ? `${approved.length}+ รีวิว จากลูกค้าที่เดินทางกับเราจริง` : `${approved.length}+ reviews from real travellers`} />
        <div className="grid-cols-3" style={{ gap: 16 }}>
          {approved.slice(0, 3).map((r, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 10,
              padding: 20, border: '1px solid var(--line)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(s => (
                  <Icon key={s} name="star" size={16} />
                ))}
              </div>
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                <span style={{ position: 'absolute', left: 0, top: -2, fontSize: 24, color: 'var(--primary)', opacity: .3 }}>"</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', fontStyle: 'italic' }}>
                  {r.text?.th || r.text?.en || r.text || r.quote || ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #ff8f00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {(r.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.tourId}</div>
                </div>
              </div>
              {r.text?._reply && (
                <div style={{ marginTop: 2, padding: '10px 12px', background: 'var(--canvas-2)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 3 }}>💬 {lang === 'th' ? 'ตอบกลับจาก WeCraft Travel' : 'Reply from WeCraft Travel'}</div>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{r.text._reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ARTICLES ────────────────────────────────────────────────
function ArticlesSection({ articles, navigate, t, lang }) {
  const list = articles.slice(0, 4);
  if (!list.length) return null;

  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title={lang === 'th' ? 'บทความท่องเที่ยว' : 'Travel Blog'} emoji="📝" sub={lang === 'th' ? 'เคล็ดลับ ข้อมูล และแรงบันดาลใจในการเดินทาง' : 'Tips, info & travel inspiration'} onMore={() => navigate('articles')} moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'} />
        <div className="grid-cols-4" style={{ gap: 16 }}>
          {list.map(a => {
            const title = t ? t(a.title) : (a.title?.th || a.title?.en || a.title || '');
            return (
              <article key={a.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('article-detail', a.id)}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--canvas-2)' }}>
                  {a.image
                    ? <img src={a.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseOut={e => e.currentTarget.style.transform = ''} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ff8f00, #e65c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>✈</div>
                  }
                </div>
                <div style={{ padding: '12px 14px' }}>
                  {a.category && (
                    <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {a.category}
                    </span>
                  )}
                  <h3 style={{ margin: '6px 0 8px', fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: 'var(--ink)' }}>
                    {title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.date}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── STATS STRIP ─────────────────────────────────────────────
function StatsStrip({ lang }) {
  const stats = [
    { num: '50,000+', label: 'นักท่องเที่ยวที่ไว้ใจเรา', labelEn: 'Happy Travellers' },
    { num: '500+',    label: 'โปรแกรมทัวร์',             labelEn: 'Tour Programs' },
    { num: '60+',     label: 'ประเทศทั่วโลก',             labelEn: 'Countries Worldwide' },
    { num: '15 ปี',   label: 'ประสบการณ์',               labelEn: 'Years Experience' },
  ];
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--primary-deep), var(--primary))',
      color: '#fff', padding: '28px 0',
    }}>
      <div className="wrap">
        <div className="stats-strip-grid" style={{ gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '10px 20px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,.2)' : 'none',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{s.num}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: .9 }}>{lang === 'en' ? s.labelEn : s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GROUP QUOTE BANNER ──────────────────────────────────────
function GroupQuoteBanner({ navigate, lang }) {
  const th = lang !== 'en';
  const stats = [
    { num: '500+',  label: th ? 'กรุ๊ปที่จัดสำเร็จ'      : 'Groups Arranged' },
    { num: '30+',   label: th ? 'ประเทศทั่วโลก'           : 'Countries' },
    { num: '10+ ปี', label: th ? 'ประสบการณ์กรุ๊ปเหมา'   : 'Years Experience' },
    { num: '24 ชม.', label: th ? 'รับใบเสนอราคา'          : 'Quote Turnaround' },
  ];
  const benefits = [
    { icon: '✈️', title: th ? 'ออกแบบเส้นทางได้เอง' : 'Custom Itinerary', desc: th ? 'Tailor-made ทุก route ตามใจคุณ 100%' : '100% tailor-made routes' },
    { icon: '💰', title: th ? 'ควบคุมงบประมาณ'      : 'Budget Control',    desc: th ? 'ทุกงบ — ประหยัด จนถึง VVIP'          : 'Economy to VVIP — any budget' },
    { icon: '🏨', title: th ? 'จัดการครบวงจร'       : 'Full Package',      desc: th ? 'ตั๋ว โรงแรม รถ ไกด์ ประกัน'           : 'Flights, hotel, guide, insurance' },
    { icon: '📋', title: th ? 'ใบเสนอราคาฟรี'       : 'Free Quote',        desc: th ? 'ไม่มีข้อผูกมัด ตอบกลับใน 24 ชม.'     : 'No commitment, reply within 24h' },
  ];
  return (
    <section style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff', padding: '60px 0', position: 'relative', overflow: 'hidden',
    }}>
      {/* decorative circles */}
      <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,140,0,.08)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,140,0,.06)', pointerEvents:'none' }} />

      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>

          {/* Left */}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,140,0,.18)', border:'1px solid rgba(255,140,0,.4)', borderRadius:999, padding:'6px 16px', fontSize:13, fontWeight:700, color:'#ffb347', marginBottom:20 }}>
              🎯 {th ? 'บริการหลักของเรา — เชี่ยวชาญมากกว่า 10 ปี' : 'Our Core Service — 10+ Years Expertise'}
            </div>
            <h2 style={{ margin:'0 0 16px', fontSize:'clamp(24px,3vw,40px)', fontWeight:800, lineHeight:1.2 }}>
              {th ? <>จัดกรุ๊ปทัวร์ส่วนตัว<br/><span style={{color:'#ff8c00'}}>ทั่วโลก ในราคาพิเศษ</span></> : <>Private Group Tours<br/><span style={{color:'#ff8c00'}}>Worldwide, Special Rates</span></>}
            </h2>
            <p style={{ margin:'0 0 28px', fontSize:15, opacity:.85, lineHeight:1.7 }}>
              {th ? 'ไม่ว่าจะเป็น Family Trip, Company Outing หรือ Incentive Group — เราออกแบบ Itinerary และใบเสนอราคาให้คุณ ภายใน 24 ชั่วโมง ฟรี!'
                  : 'Family trips, company outings or incentive groups — we design your itinerary and send a free quote within 24 hours.'}
            </p>

            {/* Mini stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
              {stats.map((s,i) => (
                <div key={i} style={{ textAlign:'center', background:'rgba(255,255,255,.07)', borderRadius:10, padding:'12px 8px', border:'1px solid rgba(255,255,255,.1)' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'#ff8c00' }}>{s.num}</div>
                  <div style={{ fontSize:11, opacity:.8, marginTop:4, lineHeight:1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('group-quote')}
              style={{
                background:'linear-gradient(135deg, #ff8c00, #e65c00)', color:'#fff', border:'none',
                borderRadius:10, padding:'16px 36px', fontSize:16, fontWeight:800,
                cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:10,
                boxShadow:'0 6px 24px rgba(230,92,0,.55)',
                animation:'gq-pulse 2.2s ease-in-out infinite',
              }}>
              🎯 {th ? 'ขอใบเสนอราคา — ฟรี!' : 'Get Free Quote!'}
              <span style={{ fontSize:20 }}>→</span>
            </button>
            <p style={{ marginTop:10, fontSize:12, opacity:.6 }}>
              {th ? '* ไม่มีค่าใช้จ่าย · ไม่มีข้อผูกมัด · ตอบกลับภายใน 24 ชม.' : '* No cost · No commitment · Reply within 24h'}
            </p>
          </div>

          {/* Right — benefit cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {benefits.map((b,i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)',
                borderRadius:12, padding:'20px 16px',
                transition:'background .2s, transform .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,140,0,.15)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.transform=''; }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{b.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{b.title}</div>
                <div style={{ fontSize:12, opacity:.75, lineHeight:1.5 }}>{b.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <style>{`
        @keyframes gq-pulse {
          0%,100% { box-shadow: 0 6px 24px rgba(230,92,0,.55); }
          50%      { box-shadow: 0 8px 36px rgba(230,92,0,.85), 0 0 0 8px rgba(255,140,0,.12); }
        }
        @media (max-width: 768px) {
          .gq-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── CONTACT CTA ─────────────────────────────────────────────
function ContactCta({ navigate, lang }) {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #1a237e, #283593)',
      color: '#fff', padding: '48px 0', textAlign: 'center',
    }}>
      <div className="wrap" style={{ maxWidth: 700 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800 }}>
          {lang === 'th' ? 'ยังไม่แน่ใจว่าจะไปที่ไหน? 🤔' : "Not sure where to go? 🤔"}
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 16, opacity: .9 }}>
          {lang === 'th' ? 'ทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษา ฟรี! ไม่มีข้อผูกมัด' : 'Our experts are ready to advise — free, no obligation.'}<br />
          {lang === 'th' ? 'โทรหาเรา หรือแอดไลน์ได้เลยทันที จ-ส 09:00-18:00 น.' : 'Call or LINE us anytime — Mon–Sat 09:00–18:00.'}
        </p>
        <div className="cta-btns">
          <button
            onClick={() => navigate('contact')}
            style={{
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '14px 32px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </button>
          <button
            style={{
              background: '#4CAF50', color: '#fff',
              border: 'none', borderRadius: 6, padding: '14px 32px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            LINE: @wecrafttravel
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export default function HomePage({ lang, t, navigate, tours, supplierTours = [], articles, promotions, faqs, reviews, settings, compareList, toggleCompare }) {
  const featured = tours.filter(tr => tr.featured).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  // โปรแกรมทัวร์มาใหม่ — คัดหลากหลายจากทุกซัพ · ญี่ปุ่น/จีน แสดงเยอะกว่า
  const diverseNew = useMemo(() => {
    const ok = [...(tours || []), ...(supplierTours || [])].filter(t => t.image && t.price > 0);
    const byNew = [...ok].sort((a, b) =>
      (Date.parse(b.updatedAt || b.createdAt || 0) || 0) - (Date.parse(a.updatedAt || a.createdAt || 0) || 0));
    // กระจายให้มาจากหลายซัพพลายเออร์ (round-robin ตามแหล่งที่มา)
    const spread = (arr) => {
      const bySrc = {}; arr.forEach(t => { const s = t._source || 'own'; (bySrc[s] = bySrc[s] || []).push(t); });
      const srcs = Object.keys(bySrc); const res = []; let i = 0, guard = 0;
      while (res.length < arr.length && guard++ < arr.length * 3) { const q = bySrc[srcs[i % srcs.length]]; if (q && q.length) res.push(q.shift()); i++; }
      return res;
    };
    const jp   = spread(byNew.filter(t => t.country === 'JP'));
    const cn   = spread(byNew.filter(t => t.country === 'CN'));
    const rest = spread(byNew.filter(t => t.country !== 'JP' && t.country !== 'CN'));
    // สัดส่วน: ญี่ปุ่น 4 · จีน 3 · ประเทศอื่น 2 (รวม 9 · กริด 3×3)
    const out = [...jp.slice(0, 4), ...cn.slice(0, 3), ...rest.slice(0, 2)];
    const used = new Set(out.map(t => t.id));
    for (const t of byNew) { if (out.length >= 9) break; if (!used.has(t.id)) { out.push(t); used.add(t.id); } }
    return out.slice(0, 9);
  }, [tours, supplierTours]);

  return (
    <main className="page-enter" style={{ background: 'var(--canvas-2)' }}>
      {/* Hero — full width */}
      <HeroSection navigate={navigate} lang={lang} />

      {/* Tagline Banner */}
      <div style={{
        background: 'linear-gradient(90deg, var(--primary-deep, #1a5276), var(--primary, #e65c00))',
        color: '#fff', textAlign: 'center', padding: '14px 20px',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.04em' }}>
          WE CRAFT TRAVEL · WE CRAFT HAPPINESS
        </span>
        <span style={{ fontSize: 14, marginLeft: 16, opacity: 0.9 }}>
          {lang === 'th' ? 'ดีไซน์ความสุข ให้สนุกทุกโลเคชั่น' : 'Designing happiness for every journey'}
        </span>
      </div>

      {/* 2-column: search sidebar (left) + โปรแกรมทัวร์มาใหม่ (right) */}
      <div className="home-2col">
        {/* Left: sticky search */}
        <div className="home-sidebar">
          <SearchSidebar navigate={navigate} lang={lang} />
        </div>

        {/* Right: โปรแกรมทัวร์มาใหม่ — หลากหลายจากทุกซัพ (แทนที่ทัวร์ไฟไหม้) */}
        <div className="home-2col-main">
          {diverseNew.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '24px 20px', borderTop: '3px solid var(--primary)' }}>
              <SectionHeader
                title={lang === 'th' ? 'โปรแกรมทัวร์มาใหม่' : 'New Tours'}
                emoji="✨"
                sub={lang === 'th' ? 'คัดโปรแกรมหลากหลายจากทุกซัพพลายเออร์ · ญี่ปุ่น จีน และอีกเพียบ' : 'Fresh picks from all suppliers — Japan, China & more'}
                onMore={() => navigate('tours')}
                moreLabel={lang === 'th' ? 'ดูทั้งหมด' : 'View all'}
              />
              <div className="grid-cols-3" style={{ gap: 16 }}>
                {diverseNew.map(tr => (
                  <TourCard key={tr.id} tour={tr} t={t} navigate={navigate}
                    inCompare={compareList.includes(tr.id)} onCompare={() => toggleCompare(tr.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-width sections below */}
      <WhyUsSection lang={lang} />
      <GroupQuoteBanner navigate={navigate} lang={lang} />
      <StatsStrip lang={lang} />
      <PromoBanners promotions={promotions} navigate={navigate} t={t} lang={lang} />
      <ArticlesSection articles={articles} navigate={navigate} t={t} lang={lang} />
      <ReviewsSection reviews={reviews} lang={lang} />
      <ContactCta navigate={navigate} lang={lang} />
    </main>
  );
}

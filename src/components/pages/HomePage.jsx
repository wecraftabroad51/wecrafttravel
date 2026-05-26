import { useState, useEffect, useRef } from 'react';
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
const SLIDES = [
  {
    tag: '🔥 Hot Deal',
    title: 'ยุโรป 9 ประเทศ 15 วัน',
    sub: 'ฝรั่งเศส · อิตาลี · สวิตเซอร์แลนด์ · เยอรมัน',
    price: '79,900',
    img: 'https://picsum.photos/seed/europe1/1400/520',
  },
  {
    tag: '✨ มาใหม่',
    title: 'ญี่ปุ่น โตเกียว โอซาก้า 7 วัน',
    sub: 'นิกโก้ · ฟูจิ · เกียวโต · นารา · ยูนิเวอร์แซล',
    price: '39,900',
    img: 'https://picsum.photos/seed/japan1/1400/520',
  },
  {
    tag: '⭐ แนะนำ',
    title: 'จีน เซี่ยงไฮ้ ปักกิ่ง 8 วัน',
    sub: 'กำแพงเมืองจีน · พระราชวังต้องห้าม · หยูหยวน',
    price: '29,900',
    img: 'https://picsum.photos/seed/china1/1400/520',
  },
];

// ─── HERO (full-width carousel) ───────────────────────────────
function HeroSection({ navigate }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const go = (n) => setIdx((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const s = SLIDES[idx];
  return (
    <div style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
      {/* Slides */}
      {SLIDES.map((sl, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === idx ? 1 : 0, transition: 'opacity .7s ease' }}>
          <img src={sl.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.65) 0%, rgba(0,0,0,.15) 60%)' }} />
        </div>
      ))}
      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ color: '#fff' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-block', background: 'var(--primary)', padding: '4px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              {s.tag}
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>
              {s.title}
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 16, opacity: .9, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{s.sub}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <button onClick={() => navigate('tours')} style={{
                background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6,
                padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(230,92,0,.5)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ดูโปรแกรม <Icon name="arrow-r" size={15} color="#fff" />
              </button>
              <div>
                <div style={{ fontSize: 12, opacity: .8 }}>ราคาเริ่มต้น</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#FFD54F', lineHeight: 1 }}>฿{s.price}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Arrows */}
      <button onClick={() => go(idx - 1)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.22)', border: '1px solid rgba(255,255,255,.5)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="arrow-l" size={18} color="#fff" />
      </button>
      <button onClick={() => go(idx + 1)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.22)', border: '1px solid rgba(255,255,255,.5)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="arrow-r" size={18} color="#fff" />
      </button>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {SLIDES.map((_, i) => <button key={i} className={`carousel-dot${i === idx ? ' active' : ''}`} onClick={() => go(i)} />)}
      </div>
      {/* Counter */}
      <div style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(0,0,0,.45)', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
        {idx + 1} / {SLIDES.length}
      </div>
    </div>
  );
}

// ─── SEARCH BOX (left sidebar) ────────────────────────────────
const ZONES = ['ยุโรป', 'เอเชีย', 'อเมริกา', 'แอฟริกา', 'โอเชียเนีย', 'ตะวันออกกลาง'];
const COUNTRIES = {
  'ยุโรป': ['ฝรั่งเศส', 'อิตาลี', 'สวิตเซอร์แลนด์', 'เยอรมัน', 'อังกฤษ', 'สเปน', 'โปรตุเกส', 'นอร์เวย์', 'สวีเดน'],
  'เอเชีย': ['ญี่ปุ่น', 'จีน', 'เกาหลีใต้', 'ไต้หวัน', 'ฮ่องกง', 'สิงคโปร์', 'เวียดนาม', 'อินเดีย'],
  'อเมริกา': ['สหรัฐอเมริกา', 'แคนาดา', 'เม็กซิโก', 'เปรู', 'บราซิล'],
};
const AIRLINES = ['การบินไทย', 'Thai Airways', 'AirAsia', 'Nok Air', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Korean Air', 'Japan Airlines', 'Cathay Pacific'];

function SearchSidebar({ navigate }) {
  const [zone, setZone] = useState('');
  const [country, setCountry] = useState('');
  const [airline, setAirline] = useState('');
  const [month, setMonth] = useState('');
  const countries = zone ? (COUNTRIES[zone] || []) : [];
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

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
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '14px 18px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="search" size={17} color="#fff" /> ค้นหาทัวร์ที่ต้องการ
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>ประเภทการเดินทาง</label>
          <select>
            <option>ทัวร์ต่างประเทศ</option>
            <option>ทัวร์ในประเทศ</option>
            <option>ทัวร์พรีเมี่ยม</option>
            <option>เรือสำราญ</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>โซน / ทวีป</label>
          <select value={zone} onChange={e => { setZone(e.target.value); setCountry(''); }}>
            <option value="">-- เลือกโซน --</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>ประเทศ</label>
          <select value={country} onChange={e => setCountry(e.target.value)} disabled={!zone}>
            <option value="">-- เลือกประเทศ --</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>สายการบิน</label>
          <select value={airline} onChange={e => setAirline(e.target.value)}>
            <option value="">-- ทุกสายการบิน --</option>
            {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>เดือนที่เดินทาง</label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">-- ทุกเดือน --</option>
            {months.map((m, i) => <option key={i} value={m}>{m} 2569</option>)}
          </select>
        </div>
        <button onClick={() => navigate('tours')} style={{
          background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6,
          padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 3px 10px rgba(230,92,0,.3)', marginTop: 2,
        }}>
          <Icon name="search" size={15} color="#fff" /> ค้นหาทัวร์
        </button>
        {/* Quick links */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 7 }}>ค้นหาด่วน</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {['ญี่ปุ่น','เกาหลี','จีน','ยุโรป','มัลดีฟส์','สิงคโปร์','เวียดนาม','ไต้หวัน'].map(c => (
              <button key={c} onClick={() => navigate('tours')} style={{
                background: 'var(--primary-light)', color: 'var(--primary)',
                border: '1px solid #ffc89a', borderRadius: 999,
                padding: '3px 10px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{c}</button>
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
function HotDealsSection({ tours, navigate, t, compareList, toggleCompare, inner }) {
  const hotTours = tours.filter(tr => tr.featured).slice(0, inner ? 3 : 4);
  if (!hotTours.length) return null;

  const content = (
    <>
      <SectionHeader
        title="ทัวร์โปรไฟไหม้"
        emoji="🔥"
        sub="โปรโมชั่นพิเศษ ราคาถูกมาก จองด่วน ก่อนเต็ม!"
        onMore={() => navigate('tours')}
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
function NewToursSection({ tours, navigate, t, compareList, toggleCompare }) {
  const newTours = tours.slice(0, 4);
  if (!newTours.length) return null;

  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader
          title="โปรแกรมทัวร์มาใหม่"
          emoji="✨"
          sub="อัพเดทโปรแกรมท่องเที่ยวใหม่ล่าสุด พร้อมออกเดินทาง"
          onMore={() => navigate('tours')}
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
  { name: 'ทัวร์จีน', count: 120, emoji: '🇨🇳', img: 'https://picsum.photos/seed/china1/400/300' },
  { name: 'ทัวร์ญี่ปุ่น', count: 98, emoji: '🇯🇵', img: 'https://picsum.photos/seed/japan1/400/300' },
  { name: 'ทัวร์เกาหลี', count: 64, emoji: '🇰🇷', img: 'https://picsum.photos/seed/korea1/400/300' },
  { name: 'ทัวร์ยุโรป', count: 85, emoji: '🏰', img: 'https://picsum.photos/seed/europe1/400/300' },
  { name: 'ทัวร์ไต้หวัน', count: 42, emoji: '🇹🇼', img: 'https://picsum.photos/seed/taiwan1/400/300' },
  { name: 'ทัวร์สิงคโปร์', count: 38, emoji: '🇸🇬', img: 'https://picsum.photos/seed/singapore1/400/300' },
  { name: 'ทัวร์ฮ่องกง', count: 55, emoji: '🏙️', img: 'https://picsum.photos/seed/hongkong1/400/300' },
  { name: 'ทัวร์อเมริกา', count: 29, emoji: '🗽', img: 'https://picsum.photos/seed/america1/400/300' },
  { name: 'ทัวร์เวียดนาม', count: 47, emoji: '🇻🇳', img: 'https://picsum.photos/seed/vietnam1/400/300' },
  { name: 'ทัวร์อินเดีย', count: 31, emoji: '🇮🇳', img: 'https://picsum.photos/seed/india1/400/300' },
  { name: 'ทัวร์สหรัฐอาหรับ', count: 22, emoji: '🕌', img: 'https://picsum.photos/seed/dubai1/400/300' },
  { name: 'ทัวร์มัลดีฟส์', count: 18, emoji: '🏝️', img: 'https://picsum.photos/seed/maldives1/400/300' },
];

function DestinationsSection({ navigate, inner }) {
  const cols = inner ? 'grid-cols-4' : 'grid-cols-6';
  const content = (
    <>
      <SectionHeader title="หมวดหมู่ยอดนิยม" emoji="🌏" sub="เลือกปลายทางที่คุณฝัน" onMore={() => navigate('tours')} />
      <div className={cols} style={{ gap: 12 }}>
        {DESTINATIONS.map(d => (
          <div key={d.name} className="cat-card" onClick={() => navigate('tours')}>
            <img src={d.img} alt={d.name} loading="lazy" />
            <div className="cat-card-overlay">
              <div className="cat-card-title">{d.emoji} {d.name.replace('ทัวร์', '')}</div>
              <div className="cat-card-count">{d.count} โปรแกรม</div>
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
  { icon: 'plane', title: 'ใบอนุญาตนำเที่ยว', desc: 'ได้รับใบอนุญาตประกอบธุรกิจนำเที่ยวจากกรมการท่องเที่ยว เลขที่ 11/06310' },
  { icon: 'shield', title: 'ประกันภัยการเดินทาง', desc: 'ทุกทริปมีประกันภัยครบถ้วน คุ้มครองอุบัติเหตุและการเจ็บป่วย' },
  { icon: 'headset', title: 'ทีมงานมืออาชีพ', desc: 'ไกด์ผู้ชำนาญ ดูแลตลอด 24 ชั่วโมง ตั้งแต่ต้นทางถึงปลายทาง' },
  { icon: 'check', title: 'ราคาโปร่งใส ไม่มีค่าใช้จ่ายแอบแฝง', desc: 'ระบุรายละเอียดชัดเจน ทำให้คุณวางแผนได้อย่างสบายใจ' },
];

function WhyUsSection() {
  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title="ทำไมต้องเลือกเรา?" emoji="💎" />
        <div className="grid-cols-4" style={{ gap: 20 }}>
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
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{w.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROMOTIONS BANNER ───────────────────────────────────────
function PromoBanners({ promotions, navigate, t }) {
  const promos = promotions.slice(0, 3);
  if (!promos.length) return null;

  return (
    <section style={{ background: '#fff7f0', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title="โปรโมชั่นพิเศษ" emoji="🎁" sub="ส่วนลดพิเศษ จำกัดจำนวน" onMore={() => navigate('promotions')} />
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
function ReviewsSection({ reviews }) {
  const [idx, setIdx] = useState(0);
  const approved = reviews.filter(r => r.approved).slice(0, 6);
  if (!approved.length) return null;

  return (
    <section style={{ background: 'var(--canvas-2)', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title="รีวิวจากลูกค้าจริง" emoji="💬" sub={`${approved.length}+ รีวิว จากลูกค้าที่เดินทางกับเราจริง`} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ARTICLES ────────────────────────────────────────────────
function ArticlesSection({ articles, navigate, t }) {
  const list = articles.slice(0, 4);
  if (!list.length) return null;

  return (
    <section style={{ background: '#fff', padding: '36px 0' }}>
      <div className="wrap">
        <SectionHeader title="บทความท่องเที่ยว" emoji="📝" sub="เคล็ดลับ ข้อมูล และแรงบันดาลใจในการเดินทาง" onMore={() => navigate('articles')} />
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
function StatsStrip() {
  const stats = [
    { num: '50,000+', label: 'นักท่องเที่ยวที่ไว้ใจเรา' },
    { num: '500+', label: 'โปรแกรมทัวร์' },
    { num: '60+', label: 'ประเทศทั่วโลก' },
    { num: '15 ปี', label: 'ประสบการณ์' },
  ];
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--primary-deep), var(--primary))',
      color: '#fff', padding: '28px 0',
    }}>
      <div className="wrap">
        <div className="grid-cols-4" style={{ gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '10px 20px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,.2)' : 'none',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{s.num}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: .9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT CTA ─────────────────────────────────────────────
function ContactCta({ navigate }) {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #1a237e, #283593)',
      color: '#fff', padding: '48px 0', textAlign: 'center',
    }}>
      <div className="wrap" style={{ maxWidth: 700 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800 }}>
          ยังไม่แน่ใจว่าจะไปที่ไหน? 🤔
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 16, opacity: .9 }}>
          ทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษา ฟรี! ไม่มีข้อผูกมัด<br />
          โทรหาเรา หรือแอดไลน์ได้เลยทันที จ-ศ 09:00-18:00 น.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('contact')}
            style={{
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '14px 32px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ติดต่อเรา
          </button>
          <button
            style={{
              background: '#4CAF50', color: '#fff',
              border: 'none', borderRadius: 6, padding: '14px 32px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            LINE: @sanookholiday
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export default function HomePage({ lang, t, navigate, tours, articles, promotions, faqs, reviews, settings, compareList, toggleCompare }) {
  const featured = tours.filter(tr => tr.featured).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  return (
    <main className="page-enter" style={{ background: 'var(--canvas-2)' }}>
      {/* Hero — full width */}
      <HeroSection navigate={navigate} />

      {/* 2-column: search sidebar (left) + hot deals & categories (right) */}
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, padding: '24px 20px', alignItems: 'start' }}>
        {/* Left: sticky search */}
        <SearchSidebar navigate={navigate} />

        {/* Right: hot deals + destinations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
          {featured.length > 0 && (
            <div style={{ background: '#fff7f0', borderRadius: 10, padding: '24px 20px', borderTop: '3px solid var(--primary)' }}>
              <HotDealsSection tours={featured} navigate={navigate} t={t} compareList={compareList} toggleCompare={toggleCompare} inner />
            </div>
          )}
          <div style={{ background: 'var(--canvas-2)', borderRadius: 10, padding: '24px 20px' }}>
            <DestinationsSection navigate={navigate} inner />
          </div>
        </div>
      </div>

      {/* Full-width sections below */}
      <WhyUsSection />
      <NewToursSection tours={tours} navigate={navigate} t={t} compareList={compareList} toggleCompare={toggleCompare} />
      <StatsStrip />
      <PromoBanners promotions={promotions} navigate={navigate} t={t} />
      <ReviewsSection reviews={reviews} />
      <ArticlesSection articles={articles} navigate={navigate} t={t} />
      <ContactCta navigate={navigate} />
    </main>
  );
}

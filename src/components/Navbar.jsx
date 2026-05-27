import { useState, useEffect, useRef } from 'react';

const MENU = [
  {
    label: 'ทัวร์ต่างประเทศ', labelEn: 'Outbound Tours',
    key: 'tours', tourType: 'outbound',
    mega: [
      { continent: 'ยุโรป', countries: ['ฝรั่งเศส','อิตาลี','สวิตเซอร์แลนด์','เยอรมัน','อังกฤษ','สเปน','โปรตุเกส','ออสเตรีย','เนเธอร์แลนด์','เบลเยียม','นอร์เวย์','สวีเดน','เดนมาร์ก'] },
      { continent: 'เอเชียตะวันออก', countries: ['ญี่ปุ่น','จีน','เกาหลีใต้','ไต้หวัน','ฮ่องกง','มาเก๊า'] },
      { continent: 'เอเชียตะวันออกเฉียงใต้', countries: ['สิงคโปร์','เวียดนาม','มาเลเซีย','อินโดนีเซีย','ฟิลิปปินส์','พม่า','กัมพูชา','ลาว'] },
      { continent: 'เอเชียใต้ / ตะวันออกกลาง', countries: ['อินเดีย','มัลดีฟส์','ศรีลังกา','สหรัฐอาหรับเอมิเรตส์','ซาอุดีอาระเบีย','กาตาร์','จอร์แดน'] },
      { continent: 'อเมริกา / แปซิฟิก', countries: ['สหรัฐอเมริกา','แคนาดา','เม็กซิโก','เปรู','บราซิล','ออสเตรเลีย','นิวซีแลนด์'] },
      { continent: 'แอฟริกา', countries: ['โมร็อกโก','แอฟริกาใต้','เคนยา','อียิปต์','แทนซาเนีย'] },
    ],
  },
  {
    label: 'ทัวร์ในประเทศ', labelEn: 'Inbound Tours',
    key: 'tours', tourType: 'inbound',
    mega: [
      { continent: 'ภาคเหนือ', countries: ['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','น่าน','ลำปาง','พะเยา'] },
      { continent: 'ภาคกลาง / ตะวันออก', countries: ['กรุงเทพฯ','พัทยา','ระยอง','เกาะเสม็ด','เกาะช้าง','กาญจนบุรี'] },
      { continent: 'ภาคใต้', countries: ['ภูเก็ต','กระบี่','เกาะสมุย','เกาะพะงัน','เกาะลันตา','ตรัง','สตูล'] },
      { continent: 'ภาคอีสาน', countries: ['เขาใหญ่','โคราช','ขอนแก่น','อุดรธานี','หนองคาย','เลย'] },
    ],
  },
  {
    label: 'ทัวร์พรีเมี่ยม', labelEn: 'Premium Tours',
    key: 'tours', tourType: 'premiumtour',
    mega: [
      { continent: 'ยุโรปพรีเมี่ยม', countries: ['สวิตเซอร์แลนด์ VIP','อิตาลีหรูหรา','ฝรั่งเศสไฮเอนด์','นอร์เวย์ Fjord'] },
      { continent: 'เอเชียพรีเมี่ยม', countries: ['ญี่ปุ่น Luxury','มัลดีฟส์ Overwater Villa','บาหลี Exclusive','สิงคโปร์ Fine Dining'] },
      { continent: 'ไฟลท์ชั้นธุรกิจ', countries: ['ยุโรปธุรกิจ','ญี่ปุ่นธุรกิจ','อเมริกาธุรกิจ','ออสเตรเลียธุรกิจ'] },
    ],
  },
  { label: 'ทัวร์โปรไฟไหม้ 🔥', labelEn: '🔥 Hot Tours', key: 'tours', tourType: 'hottour', mega: null },
  { label: 'ทัวร์โปรโมชั่น', labelEn: 'Promotions', key: 'promotions', mega: null },
  {
    label: 'แพ็คเกจทัวร์', labelEn: 'Tour Packages',
    key: 'tours', tourType: 'tourpackage',
    mega: [
      { continent: 'แพ็คเกจยอดนิยม', countries: ['แพ็คเกจฮันนีมูน','แพ็คเกจครอบครัว','แพ็คเกจกลุ่มใหญ่','แพ็คเกจวันเกิด'] },
      { continent: 'แพ็คเกจตามธีม', countries: ['ทัวร์ซากุระ','ทัวร์ใบไม้เปลี่ยนสี','ทัวร์คริสต์มาส','ทัวร์ปีใหม่'] },
    ],
  },
  {
    label: 'จองตั๋ว', labelEn: 'Ticket & Services',
    key: 'ticket-booking', tourType: null,
    mega: [
      { continent: 'จองตั๋ว', continentEn: 'Ticket Booking', countries: ['จองตั๋วเครื่องบิน','เรือสำราญ','บัตรเข้าชม'] },
      { continent: 'รถเช่า', continentEn: 'Car Rental', countries: ['รถเช่าในประเทศ','รถเช่าต่างประเทศ','รับ-ส่งสนามบิน'] },
      { continent: 'บริการอื่น', continentEn: 'Other Services', countries: ['ประกันเดินทาง','SIM Card ต่างประเทศ'] },
    ],
  },
  {
    label: 'บริการอื่นๆ', labelEn: 'Other Services',
    key: 'contact',
    mega: [
      { continent: 'บริการของเรา', countries: ['บริการยื่นวีซ่า','ประกันการเดินทาง','จองโรงแรม','เช่ารถต่างประเทศ','รับ-ส่งสนามบิน','SIM Card ต่างประเทศ'] },
    ],
  },
];

// Quick links in teal top bar
const QUICK_LINKS = [
  { label: 'หน้าหลัก',        labelEn: 'Home',           key: 'home' },
  { label: 'ขอราคากรุ๊ปเหมา', labelEn: 'Group Quote',    key: 'group-quote' },
  { label: 'บริการยื่นวีซ่า',  labelEn: 'Visa Service',   key: 'visa' },
  { label: 'บทความท่องเที่ยว', labelEn: 'Travel Blog',    key: 'articles' },
  { label: 'ผลงานที่ผ่านมา',   labelEn: 'Gallery',        key: 'gallery' },
  { label: 'เกี่ยวกับเรา',     labelEn: 'About Us',       key: 'about' },
  { label: 'ติดต่อเรา',        labelEn: 'Contact',        key: 'contact' },
];

const CONTINENT_EN = {
  'ยุโรป': 'Europe', 'เอเชียตะวันออก': 'East Asia',
  'เอเชียตะวันออกเฉียงใต้': 'Southeast Asia',
  'เอเชียใต้ / ตะวันออกกลาง': 'South Asia / Middle East',
  'อเมริกา / แปซิฟิก': 'Americas / Pacific', 'แอฟริกา': 'Africa',
  'ยุโรปพรีเมี่ยม': 'Premium Europe', 'เอเชียพรีเมี่ยม': 'Premium Asia',
  'ไฟลท์ชั้นธุรกิจ': 'Business Class', 'ภาคเหนือ': 'Northern Thailand',
  'ภาคกลาง / ตะวันออก': 'Central / Eastern', 'ภาคใต้': 'Southern Thailand',
  'ภาคอีสาน': 'Northeastern Thailand', 'แพ็คเกจยอดนิยม': 'Popular Packages',
  'แพ็คเกจตามธีม': 'Themed Packages', 'เส้นทางเรือสำราญ': 'Cruise Routes',
  'บริการของเรา': 'Our Services',
  'จองตั๋ว': 'Ticket Booking', 'รถเช่า': 'Car Rental', 'บริการอื่น': 'Other Services',
};

function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}
function CloseIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>;
}
function ChevronDown() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}

function MegaDropdown({ menu, navigate, onClose, topOffset, lang }) {
  if (!menu.mega) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: topOffset,
        left: 0, right: 0,
        background: '#fff',
        borderTop: '3px solid var(--primary)',
        boxShadow: '0 8px 32px rgba(0,0,0,.15)',
        zIndex: 200,
        padding: '24px 0',
      }}
      onMouseLeave={onClose}
    >
      <div className="wrap" style={{ display: 'flex', gap: 0 }}>
        {menu.mega.map((group, gi) => (
          <div key={gi} style={{
            flex: 1, padding: '0 20px',
            borderRight: gi < menu.mega.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 800, color: 'var(--primary)',
              textTransform: 'uppercase', letterSpacing: '.08em',
              marginBottom: 10, paddingBottom: 8,
              borderBottom: '2px solid var(--primary-light)',
            }}>
              {lang === 'en' ? (CONTINENT_EN[group.continent] || group.continent) : group.continent}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.countries.map(c => (
                <button key={c}
                  onClick={() => {
                    if (menu.key === 'ticket-booking') {
                      if (group.continent === 'รถเช่า') { navigate('car-rental'); }
                      else { navigate('ticket-booking'); }
                    } else {
                      navigate(menu.key, null, menu.tourType ? { tourType: menu.tourType, country: c } : null);
                    }
                    onClose();
                  }}
                  style={{
                    background: 'none', border: 'none', textAlign: 'left',
                    padding: '5px 6px', fontSize: 13, color: 'var(--ink-2)',
                    cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit',
                    transition: 'background .12s, color .12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ink-2)'; }}
                >
                  › {c}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Navbar({ lang, setLang, page, navigate, t, onAdminClick }) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [headerH, setHeaderH]       = useState(172);
  const closeTimer = useRef(null);
  const headerRef  = useRef(null);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 8);
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    return () => window.removeEventListener('scroll', onS);
  }, []);

  // Measure header height for mega-dropdown positioning
  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => {
      setHeaderH(headerRef.current?.offsetHeight || 172);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  const openMenu  = (i) => { clearTimeout(closeTimer.current); setActiveMenu(i); };
  const closeMenu = ()  => { closeTimer.current = setTimeout(() => setActiveMenu(null), 120); };
  const keepMenu  = ()  => clearTimeout(closeTimer.current);

  return (
    <header ref={headerRef} style={{ position: 'sticky', top: 0, zIndex: 150 }}>

      {/* ── Row 1: teal quick-links bar ─────────────────── */}
      <div style={{ background: 'var(--primary)', color: '#fff', fontSize: 13 }}>
        <div className="wrap" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '6px 20px',
        }}>
          {/* Left spacer */}
          <div />
          {/* Quick links — center column */}
          <div className="navbar-topbar-phone" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
            {QUICK_LINKS.map((ql, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,.4)', padding: '0 8px' }}>|</span>}
                <button
                  onClick={() => navigate(ql.key)}
                  style={{
                    background: 'none', border: 'none', color: '#fff',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    padding: '2px 0',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.75)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                >
                  {lang === 'en' ? (ql.labelEn || ql.label) : ql.label}
                </button>
              </span>
            ))}
          </div>
          {/* Right: lang */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              style={{
                background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.35)',
                color: '#fff', padding: '2px 10px', borderRadius: 3,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            {onAdminClick && (
              <button onClick={onAdminClick}
                style={{
                  background: 'rgba(0,0,0,.2)', border: 'none',
                  color: '#fff', padding: '2px 10px', borderRadius: 3,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: logo + info bar ──────────────────────── */}
      <div className="navbar-topbar-phone" style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <div className="wrap" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 20px',
          gap: 0,
        }}>

          {/* Logo */}
          <button onClick={() => navigate('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginRight: 28 }}>
            <img src="/logo.png" alt="WeCraft Travel" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>WeCraft Travel</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em' }}>WE CRAFT ABROAD · ททท. 11/11550</div>
            </div>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: '#e8e8e8', marginRight: 28, flexShrink: 0 }} />

          {/* เวลาทำการ */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginRight: 28 }}>
            <span style={{ color: 'var(--primary)', marginTop: 2 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{lang === 'th' ? 'เวลาทำการ' : 'Office Hours'}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 1 }}>{lang === 'th' ? 'จันทร์-เสาร์ : 09.00-18.00 น.' : 'Mon–Sat : 09:00–18:00'}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: '#e8e8e8', marginRight: 28, flexShrink: 0 }} />

          {/* Hotline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginRight: 28 }}>
            <span style={{ color: 'var(--primary)', marginTop: 2 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>
                {lang === 'th' ? 'สายด่วน' : 'Hotline'}{' '}
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {lang === 'th' ? 'Hot Line 24 ชม.' : 'Hot Line 24 hrs'}
                </span>
              </div>
              <a href="tel:0618686889" style={{ display: 'block', fontSize: 13, color: '#555', textDecoration: 'none', marginTop: 1 }}>
                061-868-6889
              </a>
              <a href="tel:0652398915" style={{ display: 'block', fontSize: 12, color: '#555', textDecoration: 'none', marginTop: 2 }}>
                065-239-8915
              </a>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: '#e8e8e8', marginRight: 28, flexShrink: 0 }} />

          {/* LINE */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer"
              style={{
                background: '#06c755', borderRadius: 8,
                width: 36, height: 36, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0, textDecoration: 'none',
              }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
              </svg>
            </a>
            <div>
              <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer"
                style={{ fontWeight: 800, fontSize: 15, color: '#06c755', textDecoration: 'none' }}>
                @wecrafttravel
              </a>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 1 }}>We Craft Travel · We Craft Happiness</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{lang === 'th' ? 'ใบอนุญาต ททท. 11/11550' : 'Travel License : 11/11550'}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Row 3: main nav ──────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderBottom: '3px solid var(--primary)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,.1)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', height: 50, gap: 0 }}>

          {/* Mobile-only logo (Row 2 is hidden on mobile) */}
          <button onClick={() => navigate('home')} className="mobile-menu-btn"
            style={{ alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginRight: 8 }}>
            <img src="/logo.png" alt="WeCraft Travel" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>WeCraft Travel</div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>WE CRAFT ABROAD</div>
            </div>
          </button>

          {/* Desktop nav — centered, no logo */}
          <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: '100%', flex: 1, justifyContent: 'center' }}>
            {MENU.map((m, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
                onMouseEnter={() => openMenu(i)}
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { navigate(m.key, null, m.tourType ? { tourType: m.tourType } : null); setActiveMenu(null); }}
                  style={{
                    padding: '0 10px', border: 'none',
                    borderBottom: activeMenu === i || page === m.key ? '3px solid var(--primary)' : '3px solid transparent',
                    color: activeMenu === i || page === m.key ? 'var(--primary)' : 'var(--ink-2)',
                    background: 'transparent',
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 3,
                    whiteSpace: 'nowrap',
                    transition: 'color .12s, border-color .12s',
                  }}
                >
                  {lang === 'en' ? (m.labelEn || m.label) : m.label}
                  {m.mega && <ChevronDown />}
                </button>
                {activeMenu === i && m.mega && (
                  <div onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
                    <MegaDropdown menu={m} navigate={navigate} onClose={() => setActiveMenu(null)} topOffset={headerH} lang={lang} />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile: ขอราคากรุ๊ปเหมา shortcut */}
          <button
            className="mobile-menu-btn"
            onClick={() => navigate('group-quote')}
            style={{
              marginLeft: 'auto',
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 20,
              padding: '6px 12px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
            {lang === 'en' ? '🎯 Group Quote' : '🎯 กรุ๊ปเหมา'}
          </button>


          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-menu-btn"
            style={{ padding: 7, borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}>
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', maxHeight: '80vh', overflowY: 'auto' }}>
          {MENU.map((m, i) => (
            <div key={i}>
              <button
                onClick={() => { navigate(m.key, null, m.tourType ? { tourType: m.tourType } : null); setMobileOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '13px 20px', border: 'none',
                  borderBottom: '1px solid var(--line)',
                  background: page === m.key ? 'var(--primary-light)' : '#fff',
                  color: page === m.key ? 'var(--primary)' : 'var(--ink-2)',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {lang === 'en' ? (m.labelEn || m.label) : m.label}
              </button>
              {m.mega && (
                <div style={{ background: '#fafafa', padding: '8px 20px 12px' }}>
                  {m.mega.map((g, gi) => (
                    <div key={gi} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{g.continent}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                        {g.countries.map(c => (
                          <button key={c}
                            onClick={() => { navigate(m.key, null, m.tourType ? { tourType: m.tourType, country: c } : null); setMobileOpen(false); }}
                            style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0' }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Mobile quick links */}
          <div style={{ padding: '14px 16px', borderTop: '2px solid var(--primary)', background: '#fff3e0' }}>
            {/* ขอราคากรุ๊ปเหมา — CTA ใหญ่ */}
            <button
              onClick={() => { navigate('group-quote'); setMobileOpen(false); }}
              style={{
                display: 'block', width: '100%',
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '12px 16px', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 10, textAlign: 'center',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}>
              {lang === 'en' ? '🎯 Group Quote' : '🎯 ขอราคากรุ๊ปเหมา'}
            </button>
            {/* Other quick links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}>
              {QUICK_LINKS.slice(1).map((ql, i) => (
                <button key={i}
                  onClick={() => { navigate(ql.key); setMobileOpen(false); }}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: 13, color: 'var(--primary)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    padding: '3px 10px 3px 0', fontWeight: 600,
                  }}>
                  › {lang === 'en' ? (ql.labelEn || ql.label) : ql.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

import { useState, useEffect, useRef } from 'react';

const MENU = [
  {
    label: 'ทัวร์ต่างประเทศ',
    key: 'tours',
    mega: [
      {
        continent: 'ยุโรป',
        countries: ['ฝรั่งเศส', 'อิตาลี', 'สวิตเซอร์แลนด์', 'เยอรมัน', 'อังกฤษ', 'สเปน', 'โปรตุเกส', 'ออสเตรีย', 'เนเธอร์แลนด์', 'เบลเยียม', 'นอร์เวย์', 'สวีเดน', 'เดนมาร์ก'],
      },
      {
        continent: 'เอเชียตะวันออก',
        countries: ['ญี่ปุ่น', 'จีน', 'เกาหลีใต้', 'ไต้หวัน', 'ฮ่องกง', 'มาเก๊า'],
      },
      {
        continent: 'เอเชียตะวันออกเฉียงใต้',
        countries: ['สิงคโปร์', 'เวียดนาม', 'มาเลเซีย', 'อินโดนีเซีย', 'ฟิลิปปินส์', 'พม่า', 'กัมพูชา', 'ลาว'],
      },
      {
        continent: 'เอเชียใต้ / ตะวันออกกลาง',
        countries: ['อินเดีย', 'มัลดีฟส์', 'ศรีลังกา', 'สหรัฐอาหรับเอมิเรตส์', 'ซาอุดีอาระเบีย', 'กาตาร์', 'จอร์แดน'],
      },
      {
        continent: 'อเมริกา / แปซิฟิก',
        countries: ['สหรัฐอเมริกา', 'แคนาดา', 'เม็กซิโก', 'เปรู', 'บราซิล', 'ออสเตรเลีย', 'นิวซีแลนด์'],
      },
      {
        continent: 'แอฟริกา',
        countries: ['โมร็อกโก', 'แอฟริกาใต้', 'เคนยา', 'อียิปต์', 'แทนซาเนีย'],
      },
    ],
  },
  {
    label: 'ทัวร์ในประเทศ',
    key: 'tours',
    mega: [
      {
        continent: 'ภาคเหนือ',
        countries: ['เชียงใหม่', 'เชียงราย', 'แม่ฮ่องสอน', 'น่าน', 'ลำปาง', 'พะเยา'],
      },
      {
        continent: 'ภาคกลาง / ตะวันออก',
        countries: ['กรุงเทพฯ', 'พัทยา', 'ระยอง', 'เกาะเสม็ด', 'เกาะช้าง', 'กาญจนบุรี'],
      },
      {
        continent: 'ภาคใต้',
        countries: ['ภูเก็ต', 'กระบี่', 'เกาะสมุย', 'เกาะพะงัน', 'เกาะลันตา', 'ตรัง', 'สตูล'],
      },
      {
        continent: 'ภาคอีสาน',
        countries: ['เขาใหญ่', 'โคราช', 'ขอนแก่น', 'อุดรธานี', 'หนองคาย', 'เลย'],
      },
    ],
  },
  {
    label: 'ทัวร์พรีเมี่ยม',
    key: 'tours',
    mega: [
      {
        continent: 'ยุโรปพรีเมี่ยม',
        countries: ['สวิตเซอร์แลนด์ VIP', 'อิตาลีหรูหรา', 'ฝรั่งเศสไฮเอนด์', 'นอร์เวย์ Fjord'],
      },
      {
        continent: 'เอเชียพรีเมี่ยม',
        countries: ['ญี่ปุ่น Luxury', 'มัลดีฟส์ Overwater Villa', 'บาหลี Exclusive', 'สิงคโปร์ Fine Dining'],
      },
      {
        continent: 'ไฟลท์ชั้นธุรกิจ',
        countries: ['ยุโรปธุรกิจ', 'ญี่ปุ่นธุรกิจ', 'อเมริกาธุรกิจ', 'ออสเตรเลียธุรกิจ'],
      },
    ],
  },
  {
    label: 'ทัวร์โปรไฟไหม้ 🔥',
    key: 'promotions',
    mega: null,
  },
  {
    label: 'ทัวร์โปรโมชั่น',
    key: 'promotions',
    mega: null,
  },
  {
    label: 'แพ็คเกจทัวร์',
    key: 'tours',
    mega: [
      {
        continent: 'แพ็คเกจยอดนิยม',
        countries: ['แพ็คเกจฮันนีมูน', 'แพ็คเกจครอบครัว', 'แพ็คเกจกลุ่มใหญ่', 'แพ็คเกจวันเกิด'],
      },
      {
        continent: 'แพ็คเกจตามธีม',
        countries: ['ทัวร์ซากุระ', 'ทัวร์ใบไม้เปลี่ยนสี', 'ทัวร์คริสต์มาส', 'ทัวร์ปีใหม่'],
      },
    ],
  },
  {
    label: 'เรือสำราญ',
    key: 'tours',
    mega: [
      {
        continent: 'เส้นทางเรือสำราญ',
        countries: ['เมดิเตอร์เรเนียน', 'แคริบเบียน', 'สแกนดิเนเวีย', 'เอเชียตะวันออกเฉียงใต้', 'ญี่ปุ่น-เกาหลี'],
      },
    ],
  },
  {
    label: 'บริการอื่นๆ',
    key: 'contact',
    mega: [
      {
        continent: 'บริการของเรา',
        countries: ['บริการยื่นวีซ่า', 'ประกันการเดินทาง', 'จองโรงแรม', 'เช่ารถต่างประเทศ', 'รับ-ส่งสนามบิน', 'SIM Card ต่างประเทศ'],
      },
    ],
  },
];

function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
}
function ClockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}
function LineIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
}
function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}
function CloseIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>;
}
function ChevronDown() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}

function MegaDropdown({ menu, navigate, onClose }) {
  if (!menu.mega) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 112, left: 0, right: 0,
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
            flex: 1,
            padding: '0 20px',
            borderRight: gi < menu.mega.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 800, color: 'var(--primary)',
              textTransform: 'uppercase', letterSpacing: '.08em',
              marginBottom: 10, paddingBottom: 8,
              borderBottom: '2px solid var(--primary-light)',
            }}>
              {group.continent}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.countries.map(c => (
                <button key={c}
                  onClick={() => { navigate(menu.key); onClose(); }}
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 8);
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    return () => window.removeEventListener('scroll', onS);
  }, []);

  const openMenu = (i) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(i);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };
  const keepMenu = () => clearTimeout(closeTimer.current);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 150 }}>
      {/* Top info bar */}
      <div style={{ background: '#222', color: '#fff', fontSize: 12, padding: '5px 0' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PhoneIcon /> 02-123-4567 | 098-765-4321
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ClockIcon /> จ–ศ 09:00–18:00 น.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4CAF50' }}>
              <LineIcon /> LINE: @tourholiday
            </span>
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.35)', color: '#fff', padding: '1px 8px', borderRadius: 3, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            {onAdminClick && (
              <button onClick={onAdminClick}
                style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '2px 10px', borderRadius: 3, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logo bar */}
      <div style={{
        background: '#fff',
        borderBottom: '3px solid var(--primary)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,.1)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>
          {/* Logo */}
          <button onClick={() => navigate('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--primary), #ff8f00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(230,92,0,.3)',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 13.5 21 6l-6 16-3-7-7-2z"/>
              </svg>
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--primary)' }}>สนุก ฮอลิเดย์</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em' }}>SANOOK HOLIDAYS · ใบอนุญาต 11/06310</div>
            </div>
          </button>

          {/* Desktop nav — full width */}
          <nav className="nav-desktop" style={{ display: 'flex', flex: 1, alignItems: 'stretch', gap: 0, height: '100%' }}>
            {MENU.map((m, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
                onMouseEnter={() => openMenu(i)}
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { navigate(m.key); setActiveMenu(null); }}
                  style={{
                    padding: '0 11px',
                    border: 'none',
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
                  {m.label}
                  {m.mega && <ChevronDown />}
                </button>
                {/* Mega dropdown */}
                {activeMenu === i && m.mega && (
                  <div onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
                    <MegaDropdown menu={m} navigate={navigate} onClose={() => setActiveMenu(null)} />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-menu-btn"
            style={{ padding: 7, borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer', marginLeft: 'auto' }}>
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
                onClick={() => { navigate(m.key); setMobileOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '13px 20px', border: 'none',
                  borderBottom: '1px solid var(--line)',
                  background: page === m.key ? 'var(--primary-light)' : '#fff',
                  color: page === m.key ? 'var(--primary)' : 'var(--ink-2)',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {m.label}
              </button>
              {m.mega && (
                <div style={{ background: '#fafafa', padding: '8px 20px 12px' }}>
                  {m.mega.map((g, gi) => (
                    <div key={gi} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{g.continent}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                        {g.countries.map(c => (
                          <button key={c}
                            onClick={() => { navigate(m.key); setMobileOpen(false); }}
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
        </div>
      )}
    </header>
  );
}

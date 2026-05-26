import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { key: 'tours',      label: { th: 'ทัวร์',      en: 'Tours' } },
  { key: 'promotions', label: { th: 'โปรโมชั่น',  en: 'Promotions' } },
  { key: 'gallery',    label: { th: 'แกลเลอรี่',  en: 'Gallery' } },
  { key: 'articles',   label: { th: 'บทความ',     en: 'Journal' } },
  { key: 'faq',        label: { th: 'FAQ',         en: 'FAQ' } },
  { key: 'contact',    label: { th: 'ติดต่อเรา',  en: 'Contact' } },
];

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
    </svg>
  );
}

function ArrowRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M9 22 L14 12 L18 20 L22 12 L27 22"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="18" cy="18" r="1.6" fill="var(--accent)"/>
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>
          WeCraft <span style={{ fontStyle: 'italic', fontWeight: 400, fontFamily: 'Instrument Serif, serif' }}>Travel</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.18em', marginTop: 2, textTransform: 'uppercase' }}>
          Crafted journeys · est. 2015
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ lang, setLang, page, navigate, t, onAdminClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 12);
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    return () => window.removeEventListener('scroll', onS);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 60,
      background: scrolled ? 'var(--canvas)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'background .2s, border-color .2s',
    }}>
      <div className="wrap-wide" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, gap: 24,
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: 0 }}
        >
          <Logo />
        </button>

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map(l => {
            const active = page === l.key;
            return (
              <button
                key={l.key}
                onClick={() => navigate(l.key)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: 'none',
                  color: active ? 'var(--canvas)' : 'var(--ink)',
                  background: active ? 'var(--ink)' : 'transparent',
                  fontSize: 14, fontWeight: 500,
                  letterSpacing: '-0.005em',
                  cursor: 'pointer',
                  transition: 'background .2s, color .2s',
                }}
              >
                {t(l.label)}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', border: '1px solid var(--line)',
              borderRadius: 999, background: 'transparent',
              color: 'var(--ink)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <GlobeIcon />
            <span style={{ minWidth: 18 }}>{lang === 'th' ? 'TH' : 'EN'}</span>
            <span style={{ color: 'var(--muted)' }}>/</span>
            <span style={{ color: 'var(--muted)' }}>{lang === 'th' ? 'EN' : 'TH'}</span>
          </button>
          <button
            onClick={() => navigate('tours')}
            className="btn btn-primary btn-sm nav-right-btn"
          >
            Browse tours <ArrowRightIcon />
          </button>
          {onAdminClick && (
            <button
              onClick={onAdminClick}
              className="nav-right-btn"
              style={{
                padding: '8px 14px', borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Admin
            </button>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              padding: 8, borderRadius: 'var(--r-md)',
              border: '1px solid var(--line)', background: 'transparent',
              color: 'var(--ink)', cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--canvas)',
          borderTop: '1px solid var(--line)',
          padding: '16px 32px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(l => {
              const active = page === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => { navigate(l.key); setOpen(false); }}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    color: active ? 'var(--canvas)' : 'var(--ink)',
                    background: active ? 'var(--ink)' : 'transparent',
                    fontSize: 15, fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {t(l.label)}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="btn btn-light btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <GlobeIcon /> {lang === 'th' ? 'Switch to EN' : 'Switch to TH'}
            </button>
            <button
              onClick={() => { navigate('tours'); setOpen(false); }}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Browse tours
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState } from 'react';

const SOCIALS = [
  {
    id: 'facebook',
    color: '#1877f2',
    href: 'https://facebook.com/wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    id: 'line',
    color: '#06c755',
    href: 'https://line.me/R/ti/p/@wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    color: '#e1306c',
    href: 'https://instagram.com/wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    color: '#010101',
    href: 'https://tiktok.com/@wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M13 4v10a3.5 3.5 0 1 1-3.5-3.5M13 4c.5 2.5 2 4 4.5 4.5"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    color: '#ff0000',
    href: 'https://youtube.com/@wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <rect x="2" y="6" width="20" height="12" rx="3"/>
        <path d="m10 9 5 3-5 3z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'mail',
    color: '#e53e3e',
    href: 'mailto:info@wecraft-travel.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="m4 7 8 6 8-6"/>
      </svg>
    ),
  },
];

const LINE_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
    <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
  </svg>
);

export default function FloatingContact({ settings }) {
  const [open, setOpen] = useState(true); // auto-open on load

  // Merge social URLs from settings
  const socialMap = {};
  (settings?.social || []).forEach(s => { socialMap[s.platform] = s; });

  const phone = settings?.contact?.phone || '061-868-6889';
  const email = settings?.contact?.email || 'info@wecraft-travel.com';
  const lineId = '@wecrafttravel';
  const lineHref = socialMap.line?.url || 'https://line.me/R/ti/p/@wecrafttravel';
  const fbHref   = socialMap.facebook?.url || 'https://facebook.com/wecrafttravel';

  const socials = SOCIALS.map(s => {
    if (s.id === 'line')      return { ...s, href: lineHref };
    if (s.id === 'facebook')  return { ...s, href: fbHref };
    if (s.id === 'mail')      return { ...s, href: `mailto:${email}` };
    return s;
  });

  return (
    <>
      <style>{`
        .fc-panel {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
        }
        .fc-popup {
          background: #2db04b;
          border-radius: 16px;
          padding: 16px 14px 14px;
          width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          pointer-events: all;
          transition: transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
          transform-origin: bottom right;
        }
        .fc-popup.closed {
          transform: scale(0.85) translateY(10px);
          opacity: 0;
          pointer-events: none;
        }
        .fc-popup.open {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        .fc-tab {
          width: 56px;
          height: 56px;
          background: #2db04b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          border: none;
          color: #fff;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .fc-tab:hover { background: #24a040; transform: scale(1.08); }
        .fc-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.25);
          margin: 12px 0;
        }
        .fc-social-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          text-decoration: none;
          transition: transform 0.15s, filter 0.15s;
          flex-shrink: 0;
        }
        .fc-social-btn:hover { transform: scale(1.15); filter: brightness(1.15); }
        .fc-qr {
          width: 110px; height: 110px;
          display: block;
          margin: 8px auto;
          border-radius: 8px;
          background: #fff;
          padding: 4px;
          object-fit: contain;
        }
      `}</style>

      <div className="fc-panel">
        {/* Popup panel — sits above the trigger button */}
        <div className={`fc-popup ${open ? 'open' : 'closed'}`}>
            {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
            <img src="/logo.png" alt="WeCraft Travel"
              style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, marginTop: 4, lineHeight: 1.2, textAlign: 'center' }}>WeCraft Travel</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, textAlign: 'center' }}>WE CRAFT ABROAD</div>
          </div>

          <hr className="fc-divider" />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, marginTop: 8 }}>
            <span style={{
              background: '#fff', borderRadius: 7,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#06c755', flexShrink: 0,
            }}>
              {LINE_ICON}
            </span>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>จองผ่านไลน์</div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, marginBottom: 4 }}>
            ติดต่อข่าวสารโปรโมชั่นทัวร์
          </div>

          {/* QR Code */}
          <img
            src={`https://qr-official.line.me/sid/L/wecrafttravel.png`}
            alt="LINE QR Code"
            className="fc-qr"
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback QR placeholder */}
          <div style={{
            display: 'none', width: 110, height: 110,
            background: '#fff', borderRadius: 8,
            margin: '8px auto',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4,
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" style={{ color: '#06c755' }}>
              <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
            </svg>
            <span style={{ fontSize: 11, color: '#333' }}>LINE QR Code</span>
          </div>

          {/* LINE ID */}
          <div style={{ textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            {lineId}
          </div>

          <hr className="fc-divider" />

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: '#fff', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>
              </svg>
            </span>
            <div>
              <a href={`tel:${phone.replace(/-/g,'')}`}
                style={{ display: 'block', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                {phone}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, textAlign: 'center', marginBottom: 2 }}>
            จันทร์-เสาร์ :
          </div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
            09.00 - 18.00 น.
          </div>

          <hr className="fc-divider" />

          {/* Social icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
            {socials.map(s => (
              <a key={s.id} href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="fc-social-btn"
                style={{ background: s.color }}
                title={s.id}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Trigger tab — always visible */}
        <button className="fc-tab" onClick={() => setOpen(v => !v)} title={open ? 'ปิด' : 'ติดต่อเรา'}>
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" width="20" height="20">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : LINE_ICON}
        </button>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';

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
  const [open, setOpen] = useState(false);
  // เปิดอัตโนมัติเฉพาะจอใหญ่ · มือถือเริ่มแบบปิด (กันบังเนื้อหา)
  useEffect(() => { setOpen(window.innerWidth >= 768); }, []);

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
        .fc-drawer {
          position: fixed; top: 50%; right: 0;
          transform: translateY(-50%) translateX(0);
          z-index: 9999;
          width: min(288px, 86vw);
          background: linear-gradient(165deg, #0e7c66 0%, #10996f 52%, #16a985 100%);
          border-radius: 24px 0 0 24px;
          box-shadow: -12px 0 48px rgba(6,50,40,.32);
          padding: 22px 20px 20px;
          color: #fff;
          max-height: 94vh; overflow-y: auto;
          transition: transform .42s cubic-bezier(.4,0,.2,1), box-shadow .42s;
          -webkit-overflow-scrolling: touch;
        }
        .fc-drawer.fc-closed {
          transform: translateY(-50%) translateX(calc(100% + 12px));
          box-shadow: none;
        }
        .fc-x {
          position: absolute; top: 12px; right: 14px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,.16); border: none; color: #fff;
          cursor: pointer; font-size: 16px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .fc-x:hover { background: rgba(255,255,255,.3); }
        .fc-divider {
          border: none; border-top: 1px solid rgba(255,255,255,.22);
          margin: 14px 0;
        }
        .fc-title { color: #fff; font-weight: 800; font-size: 18px; line-height: 1.2; }
        .fc-sub   { color: rgba(255,255,255,.92); font-size: 13px; margin-top: 3px; }
        .fc-id    { text-align: center; color: #fff; font-weight: 800; font-size: 16px; letter-spacing: .01em; }
        .fc-phone { color: #fff; text-decoration: none; font-size: 16px; font-weight: 700; }
        .fc-hours-l { color: rgba(255,255,255,.85); font-size: 12.5px; text-align: center; }
        .fc-hours-v { color: #fff; font-size: 14px; font-weight: 800; text-align: center; margin-top: 1px; }
        .fc-social-btn {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; text-decoration: none; flex-shrink: 0;
          transition: transform .15s, filter .15s;
        }
        .fc-social-btn:hover { transform: scale(1.15); filter: brightness(1.12); }
        .fc-qr {
          width: 138px; height: 138px; display: block; margin: 10px auto 4px;
          border-radius: 12px; background: #fff; padding: 7px; object-fit: contain;
        }
        /* แท็บเปิดใหม่ (โผล่ตอนปิด) */
        .fc-reopen {
          position: fixed; top: 50%; right: 0; transform: translateY(-50%);
          z-index: 9999; cursor: pointer; border: none;
          background: linear-gradient(135deg, #10996f, #16a985);
          color: #fff; border-radius: 16px 0 0 16px;
          padding: 13px 11px 11px; font-family: inherit;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          box-shadow: -5px 5px 20px rgba(6,50,40,.28);
          transition: opacity .25s .18s, transform .2s;
        }
        .fc-reopen span { font-size: 11px; font-weight: 800; letter-spacing: .02em; }
        .fc-reopen:hover { transform: translateY(-50%) scale(1.06); }
        .fc-reopen.fc-hidden {
          opacity: 0; pointer-events: none;
          transform: translateY(-50%) translateX(110%);
          transition: opacity .18s, transform .18s;
        }
        @media (max-width: 480px) {
          .fc-drawer { padding: 18px 16px 16px; border-radius: 20px 0 0 20px; }
          .fc-qr { width: 128px; height: 128px; }
        }
      `}</style>

      {/* ── Slide drawer (ชิดขอบขวา · ปิดแล้วเลื่อนออกทางขวา) ── */}
      <div className={`fc-drawer ${open ? '' : 'fc-closed'}`} aria-hidden={!open}>
        <button className="fc-x" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}>
          <img src="/logo.png" alt="WeCraft Travel" style={{ width: 62, height: 62, objectFit: 'contain' }} />
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, marginTop: 5, lineHeight: 1.15, textAlign: 'center' }}>WeCraft Travel</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: '.08em', textAlign: 'center' }}>WE CRAFT ABROAD</div>
        </div>

        <hr className="fc-divider" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
          <span style={{ background: '#fff', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06c755', flexShrink: 0 }}>
            {LINE_ICON}
          </span>
          <div>
            <div className="fc-title">จองผ่านไลน์</div>
          </div>
        </div>
        <div className="fc-sub">รับข่าวสาร โปรโมชั่นทัวร์ก่อนใคร</div>

        {/* QR */}
        <img src="https://qr-official.line.me/sid/L/wecrafttravel.png" alt="LINE QR Code" className="fc-qr"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div style={{ display: 'none', width: 138, height: 138, background: '#fff', borderRadius: 12, margin: '10px auto 4px', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="46" height="46" style={{ color: '#06c755' }}>
            <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
          </svg>
          <span style={{ fontSize: 12, color: '#333' }}>LINE QR Code</span>
        </div>

        <div className="fc-id">{lineId}</div>

        <hr className="fc-divider" />

        {/* Phone + hours */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ color: '#fff', flexShrink: 0 }}>
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>
          </svg>
          <a href={`tel:${phone.replace(/-/g,'')}`} className="fc-phone">{phone}</a>
        </div>
        <div className="fc-hours-l">จันทร์ - เสาร์</div>
        <div className="fc-hours-v">09.00 - 18.00 น.</div>

        <hr className="fc-divider" />

        {/* Socials */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 9, flexWrap: 'wrap' }}>
          {socials.map(s => (
            <a key={s.id} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              className="fc-social-btn" style={{ background: s.color }} title={s.id}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* ── แท็บเปิดใหม่ (โผล่ตอนปิด) ── */}
      <button className={`fc-reopen ${open ? 'fc-hidden' : ''}`} onClick={() => setOpen(true)} aria-label="ติดต่อเรา">
        {LINE_ICON}
        <span>ติดต่อ</span>
      </button>
    </>
  );
}

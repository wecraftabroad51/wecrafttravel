import { useState } from 'react';

const CONTACTS = [
  {
    id: 'line',
    label: 'LINE',
    sublabel: '@wecrafttravel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/>
      </svg>
    ),
    bg: '#06c755',
    href: 'https://line.me/R/ti/p/@wecrafttravel',
  },
  {
    id: 'phone',
    label: 'โทรหาเรา',
    sublabel: '061-868-6889',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>
      </svg>
    ),
    bg: '#0ea5e9',
    href: 'tel:0618686889',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sublabel: 'WeCraft Travel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    bg: '#1877f2',
    href: 'https://facebook.com/wecrafttravel',
  },
  {
    id: 'mail',
    label: 'อีเมล',
    sublabel: 'info@wecraft-travel.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="m4 7 8 6 8-6"/>
      </svg>
    ),
    bg: '#f59e0b',
    href: 'mailto:info@wecraft-travel.com',
  },
];

export default function FloatingContact({ settings }) {
  const [open, setOpen] = useState(false);

  // Override LINE href and Facebook href from settings if available
  const socialMap = {};
  (settings?.social || []).forEach(s => { socialMap[s.platform] = s; });

  const items = CONTACTS.map(c => {
    if (c.id === 'line' && socialMap.line?.url) return { ...c, href: socialMap.line.url };
    if (c.id === 'facebook' && socialMap.facebook?.url) return { ...c, href: socialMap.facebook.url };
    if (c.id === 'mail' && settings?.contact?.email) return { ...c, sublabel: settings.contact.email, href: `mailto:${settings.contact.email}` };
    if (c.id === 'phone' && settings?.contact?.phone) return { ...c, sublabel: settings.contact.phone, href: `tel:${settings.contact.phone.replace(/-/g, '')}` };
    return c;
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 10,
    }}>
      {/* Contact items — slide in when open */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          {items.map((c, i) => (
            <a
              key={c.id}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              title={c.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                borderRadius: 50,
                padding: '8px 16px 8px 8px',
                boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
                textDecoration: 'none',
                color: '#1a1a2e',
                animation: `fcSlideIn 0.2s ease ${i * 0.05}s both`,
                whiteSpace: 'nowrap',
                border: '1px solid rgba(0,0,0,0.07)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-4px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.15)'; }}
            >
              <span style={{
                width: 38, height: 38, borderRadius: '50%',
                background: c.bg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {c.icon}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.2 }}>{c.sublabel}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'ปิด' : 'ติดต่อเรา'}
        style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: open ? '#1a1a2e' : 'var(--primary, #f97316)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'background .2s, transform .2s',
          transform: open ? 'rotate(45deg)' : 'none',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
        onMouseLeave={e => e.currentTarget.style.filter = ''}
      >
        {open ? (
          /* X icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" width="22" height="22">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          /* Headset / contact icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      <style>{`
        @keyframes fcSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

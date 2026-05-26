function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'line':      return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'facebook':  return <svg {...p}><path d="M14 8h3V5h-3c-2 0-3 1.5-3 3v2H8v3h3v8h3v-8h3l1-3h-4V8z"/></svg>;
    case 'instagram': return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>;
    case 'phone':     return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'youtube':   return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>;
    case 'tiktok':    return <svg {...p}><path d="M13 4v10a3.5 3.5 0 1 1-3.5-3.5M13 4c.5 2.5 2 4 4.5 4.5"/></svg>;
    default: return null;
  }
}

const DEFAULT_ITEMS = [
  { name: 'line',      label: 'LINE',      href: '#' },
  { name: 'facebook',  label: 'Facebook',  href: '#' },
  { name: 'instagram', label: 'Instagram', href: '#' },
  { name: 'phone',     label: 'Call',      href: '#' },
];

export default function SocialBar({ settings }) {
  const configured = settings?.social?.filter(s => s.enabled && s.url) || [];
  const items = configured.length
    ? configured.map(s => ({ name: s.platform, label: s.platform, href: s.url }))
    : DEFAULT_ITEMS;

  return (
    <aside style={{
      position: 'fixed', left: 16, top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 40,
    }}>
      {items.map(it => (
        <a
          key={it.name}
          href={it.href}
          title={it.label}
          target={it.href !== '#' ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={it.href === '#' ? e => e.preventDefault() : undefined}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--card)', border: '1px solid var(--line)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink)', textDecoration: 'none',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background .2s, color .2s, transform .15s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--ink)';
            e.currentTarget.style.color = 'var(--canvas)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'var(--card)';
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Icon name={it.name} size={16} />
        </a>
      ))}
    </aside>
  );
}

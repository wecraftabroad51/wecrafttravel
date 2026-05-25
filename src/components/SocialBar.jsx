export default function SocialBar({ settings }) {
  const active = settings.social.filter(s => s.enabled && s.url);
  if (!active.length) return null;
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 hidden md:flex">
      {active.map(s => (
        <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
          title={s.platform}
          className="w-10 h-10 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all hover:w-12 rounded-r-lg"
          style={{ backgroundColor: s.color }}>
          {s.platform === 'facebook' ? 'f'
           : s.platform === 'instagram' ? 'ig'
           : s.platform === 'youtube' ? '▶'
           : s.platform === 'line' ? 'L'
           : s.platform === 'tiktok' ? 'tt'
           : s.platform[0].toUpperCase()}
        </a>
      ))}
    </div>
  );
}

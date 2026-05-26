import { useState } from 'react';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'close':  return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'camera': return <svg {...p}><path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'arrow-left':  return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    default: return null;
  }
}

const PHOTO_TAGS = ['Mountains', 'Cities', 'Coast', 'Food', 'Mountains', 'Cities', 'Coast', 'People',
                    'Mountains', 'Cities', 'Coast', 'Food', 'Mountains', 'Cities', 'Coast', 'People',
                    'Mountains', 'Cities', 'Coast', 'Food', 'Mountains', 'Cities', 'Coast', 'People'];

const RATIOS = [
  [1.2, 0.8, 1.1, 1.5, 1.0, 1.3, 0.9],
  [0.9, 1.3, 1.0, 0.8, 1.4, 1.1, 0.85],
  [1.4, 0.9, 1.2, 1.0, 0.85, 1.3, 1.1],
  [0.85, 1.1, 1.4, 0.9, 1.2, 1.0, 0.8],
];

export default function GalleryPage({ lang, t, navigate, tours }) {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  // Collect all images from tours
  const allImages = [];
  tours.forEach(tr => {
    if (tr.image) allImages.push({ src: tr.image, tour: t ? t(tr.name) : (tr.name?.en || tr.name?.th || ''), continent: tr.continent });
    (tr.gallery || []).forEach(src => allImages.push({ src, tour: t ? t(tr.name) : (tr.name?.en || tr.name?.th || ''), continent: tr.continent }));
  });

  const filters = ['All', 'Mountains', 'Cities', 'Coast', 'Food', 'People'];
  const tagged = allImages.map((img, i) => ({ ...img, tag: PHOTO_TAGS[i % PHOTO_TAGS.length] }));
  const visible = tagged.filter(p => filter === 'All' || p.tag === filter);

  // Distribute into 4 columns for masonry
  const cols = [[], [], [], []];
  visible.forEach((p, idx) => cols[idx % 4].push({ ...p, colIdx: idx % 4, rowIdx: Math.floor(idx / 4) }));

  const lightboxItems = visible;

  return (
    <main className="page-enter">
      {/* Header */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="wrap-wide">
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
              {t ? t({ th: 'หน้าหลัก', en: 'Home' }) : 'Home'}
            </button>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{t ? t({ th: 'แกลเลอรี่', en: 'Gallery' }) : 'Gallery'}</span>
          </nav>
          <div className="layout-hero" style={{ gap: 64, alignItems: 'end' }}>
            <h1 className="h-display">
              <span className="serif-accent" style={{ color: 'var(--primary)' }}>{allImages.length}+</span><br />
              photos from<br />the road.
            </h1>
            <div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16 }}>
                {t ? t({
                  th: 'ทุกภาพถ่ายจากการเดินทางจริง — ส่งโดยนักท่องเที่ยวและไกด์ของเรา',
                  en: 'Every shot is from an actual departure — submitted by travelers and our guides.'
                }) : 'Every shot is from an actual departure — no stock, no marketing.'}
              </p>
              <button className="btn btn-light btn-sm">
                <Icon name="camera" size={13} /> Submit your photo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section style={{
        position: 'sticky', top: 76, zIndex: 30,
        background: 'var(--canvas)', borderBottom: '1px solid var(--line)',
        padding: '16px 0',
      }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 14px', borderRadius: 999,
                  border: `1px solid ${filter === f ? 'var(--ink)' : 'var(--line)'}`,
                  background: filter === f ? 'var(--ink)' : 'var(--card)',
                  color: filter === f ? 'var(--canvas)' : 'var(--ink)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{f}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{visible.length} of {allImages.length} shown</div>
        </div>
      </section>

      {/* Masonry grid */}
      <section style={{ padding: '32px 0 80px' }}>
        <div className="wrap-wide">
          {visible.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)', color: 'var(--muted)' }}>
              {t ? t({ th: 'ไม่พบภาพ', en: 'No photos in this category.' }) : 'No photos in this category.'}
            </div>
          ) : (
            <div className="grid-cols-4" style={{ gap: 12 }}>
              {cols.map((col, ci) => (
                <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.map((p, idx) => {
                    const ratio = RATIOS[ci][idx % RATIOS[ci].length];
                    const globalIdx = lightboxItems.findIndex(x => x.src === p.src && x.tag === p.tag);
                    return (
                      <div key={idx}
                        style={{
                          aspectRatio: `1 / ${ratio}`,
                          borderRadius: 'var(--r-md)',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'zoom-in',
                        }}
                        onClick={() => setLightbox(globalIdx)}
                      >
                        <img src={p.src} alt={p.tour || p.tag}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                        <div style={{
                          position: 'absolute', left: 10, bottom: 10,
                          fontSize: 10, padding: '4px 8px',
                          background: 'rgba(244,239,230,.92)',
                          borderRadius: 999, fontWeight: 600,
                          letterSpacing: '.06em', textTransform: 'uppercase',
                        }}>{p.tag}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && lightboxItems[lightbox] && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLightbox(null)}>
          <img src={lightboxItems[lightbox].src} alt=""
            style={{ maxHeight: '88vh', maxWidth: '88vw', borderRadius: 'var(--r-lg)', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={20} />
          </button>
          {lightbox > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-left" size={20} />
            </button>
          )}
          {lightbox < lightboxItems.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-right" size={20} />
            </button>
          )}
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.7)', fontSize: 13, textAlign: 'center' }}>
            {lightboxItems[lightbox].tour && <div style={{ fontWeight: 600 }}>{lightboxItems[lightbox].tour}</div>}
            <div style={{ fontSize: 11, marginTop: 4 }}>{lightbox + 1} / {lightboxItems.length}</div>
          </div>
        </div>
      )}
    </main>
  );
}

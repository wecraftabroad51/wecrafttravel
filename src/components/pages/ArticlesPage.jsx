import { useState } from 'react';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up-right': return <svg {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>;
    default: return null;
  }
}

export default function ArticlesPage({ lang, t, navigate, articles, promotions, faqs, reviews, settings, compareList, toggleCompare, setBookings, setReviews, setMessages }) {
  const [cat, setCat] = useState('All');

  // Build category list from data
  const cats = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  const list = articles.filter(a => cat === 'All' || a.category === cat);

  const getTitle  = a => t ? t(a.title)       : (a.title?.en || a.title?.th || a.title || '');
  const getExcerpt= a => t ? t(a.excerpt)     : (a.excerpt?.en || a.excerpt?.th || a.excerpt || '');
  const getAuthor = a => a.author || '';

  return (
    <main className="page-enter">
      {/* Header */}
      <section style={{ padding: '48px 0 24px' }}>
        <div className="wrap-wide">
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
              {t ? t({ th: 'หน้าหลัก', en: 'Home' }) : 'Home'}
            </button>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{t ? t({ th: 'บทความ', en: 'Journal' }) : 'Journal'}</span>
          </nav>
          <div className="layout-hero" style={{ gap: 64, alignItems: 'end' }}>
            <h1 className="h-display">
              The <span className="serif-accent" style={{ color: 'var(--accent)' }}>journal</span>.<br />
              Field notes &<br />slow guides.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 12, maxWidth: 360 }}>
              {t ? t({
                th: 'เคล็ดลับที่ยั่งยืน ไม่มี clickbait ไม่มีบทความ "10 เหตุผล" แค่สิ่งที่เราอยากรู้ก่อนเดินทางครั้งแรก',
                en: 'Tips that age well. No SEO clickbait. Just things we wish someone had told us before our first trip.'
              }) : 'Tips that age well. No clickbait — just what we wish we knew.'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured article */}
      {list[0] && (
        <section style={{ padding: '32px 0 48px' }}>
          <div className="wrap-wide">
            <div className="layout-feat" style={{
              gap: 32, alignItems: 'center',
              background: 'var(--card-alt)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-xl)',
              padding: 32,
            }}>
              <div style={{ aspectRatio: '16/10', borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate('article-detail', list[0].id)}>
                {list[0].image
                  ? <img src={list[0].image} alt={getTitle(list[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-deep), var(--ink-2))' }} />
                }
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {list[0].category && <span className="chip chip-jade">{list[0].category}</span>}
                  {list[0].readTime && <span className="chip">{list[0].readTime} min</span>}
                  {list[0].date && <span className="chip">{list[0].date}</span>}
                </div>
                <h2 className="h-2">{getTitle(list[0])}</h2>
                {list[0].excerpt && (
                  <p style={{ marginTop: 16, color: 'var(--ink-2)', lineHeight: 1.6, fontSize: 15 }}>{getExcerpt(list[0])}</p>
                )}
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--canvas-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                      {(getAuthor(list[0]) || 'A')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{getAuthor(list[0])}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>WeCraft Journal</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('article-detail', list[0].id)} className="btn btn-primary btn-sm">
                    {t ? t({ th: 'อ่านต่อ', en: 'Read article' }) : 'Read article'} <Icon name="arrow-right" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sticky category filter */}
      <section style={{
        position: 'sticky', top: 76, zIndex: 30,
        background: 'var(--canvas)', borderBottom: '1px solid var(--line)',
        padding: '16px 0',
      }}>
        <div className="wrap-wide" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{
                padding: '8px 14px', borderRadius: 999,
                border: `1px solid ${cat === c ? 'var(--ink)' : 'var(--line)'}`,
                background: cat === c ? 'var(--ink)' : 'var(--card)',
                color: cat === c ? 'var(--canvas)' : 'var(--ink)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{c}</button>
          ))}
        </div>
      </section>

      {/* Article grid */}
      <section style={{ padding: '48px 0 80px' }}>
        <div className="wrap-wide">
          {list.length <= 1 && articles.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)', color: 'var(--muted)' }}>
              {t ? t({ th: 'ยังไม่มีบทความ', en: 'No articles yet.' }) : 'No articles yet.'}
            </div>
          ) : (
            <div className="grid-cols-3" style={{ gap: 24 }}>
              {list.slice(1).map(a => (
                <article key={a.id} className="card"
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => navigate('article-detail', a.id)}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                    {a.image
                      ? <img src={a.image} alt={getTitle(a)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--canvas-2)' }} />
                    }
                  </div>
                  <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      {a.category && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{a.category}</span>}
                      {a.readTime && <><span>·</span><span>{a.readTime} min</span></>}
                      {a.date && <><span>·</span><span>{a.date}</span></>}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{getTitle(a)}</h3>
                    {a.excerpt && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, flex: 1 }}>{getExcerpt(a)}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{getAuthor(a) ? `By ${getAuthor(a)}` : ''}</div>
                      <Icon name="arrow-up-right" size={14} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

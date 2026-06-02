import { useState } from 'react';

const ARTICLE_CATS = [
  'บทความท่องเที่ยว',
  'บทความอาหาร',
  'บทความน่าอ่าน',
  'เกี่ยวกับการเดินทาง',
];

const FOREIGN_CATS = [
  { label: 'ท่องเที่ยวยุโรป',            key: 'Europe' },
  { label: 'ท่องเที่ยวญี่ปุ่น',          key: 'Japan' },
  { label: 'ท่องเที่ยวเกาหลีใต้',        key: 'Korea' },
  { label: 'ท่องเที่ยวจีน',              key: 'China' },
  { label: 'ท่องเที่ยวไต้หวัน',          key: 'Taiwan' },
  { label: 'ท่องเที่ยวอเมริกา',          key: 'America' },
];

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
}

export default function ArticlesPage({ lang, t, navigate, articles }) {
  const [activeCat, setActiveCat] = useState('ทั้งหมด');

  const getTitle   = a => t ? t(a.title)   : (a.title?.th   || a.title?.en   || a.title   || '');
  const getExcerpt = a => t ? t(a.excerpt) : (a.excerpt?.th || a.excerpt?.en || a.excerpt || '');

  const filtered = activeCat === 'ทั้งหมด'
    ? articles
    : articles.filter(a => a.category === activeCat);

  const allCats = ['ทั้งหมด', ...ARTICLE_CATS];

  return (
    <main style={{ background: '#f5f6fa', minHeight: '100vh' }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e8eaf0',
        padding: '32px 0 0',
      }}>
        <div className="wrap" style={{ textAlign: 'center', paddingBottom: 0 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: '#1a6b5a',
            marginBottom: 8, letterSpacing: '-0.01em',
          }}>
            เที่ยวบทความท่องเที่ยว
          </h1>
          {/* Wave underline */}
          <svg viewBox="0 0 300 14" style={{ width: 300, display: 'block', margin: '0 auto 24px' }}>
            <path d="M0 7 Q15 0 30 7 Q45 14 60 7 Q75 0 90 7 Q105 14 120 7 Q135 0 150 7 Q165 14 180 7 Q195 0 210 7 Q225 14 240 7 Q255 0 270 7 Q285 14 300 7"
              fill="none" stroke="#4dd0b1" strokeWidth="2.5"/>
          </svg>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────── */}
      <div className="wrap" style={{ padding: '28px 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>

          {/* ── LEFT: Article List ───────────────────── */}
          <div>
            {/* Mobile cat pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }} className="mobile-cats">
              {allCats.map(c => (
                <button key={c} onClick={() => setActiveCat(c)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${activeCat === c ? '#1a6b5a' : '#dde1ea'}`,
                  background: activeCat === c ? '#1a6b5a' : '#fff',
                  color: activeCat === c ? '#fff' : '#555',
                  transition: 'all .15s',
                }}>{c}</button>
              ))}
            </div>

            {/* Article rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filtered.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', color: '#aaa', background: '#fff', borderRadius: 12 }}>
                  ยังไม่มีบทความในหมวดนี้
                </div>
              )}
              {filtered.map((a, idx) => (
                <article key={a.id}
                  onClick={() => navigate('article-detail', a.id)}
                  style={{
                    display: 'flex', gap: 0,
                    background: '#fff',
                    borderBottom: '1px solid #edf0f5',
                    cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 200, minWidth: 200, height: 140,
                    overflow: 'hidden', flexShrink: 0,
                    background: '#e8eaf0',
                  }}>
                    {a.image
                      ? <img src={a.image} alt={getTitle(a)}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                            transition: 'transform .4s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      : <div style={{ width: '100%', height: '100%',
                          background: 'linear-gradient(135deg,#1a6b5a,#4dd0b1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 13, fontWeight: 600 }}>
                          ✈ WeCraft
                        </div>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <h2 style={{
                        margin: 0, fontSize: 16, fontWeight: 700,
                        color: '#1a1a2e', lineHeight: 1.35,
                        flex: 1,
                      }}>
                        {getTitle(a)}
                      </h2>
                      {/* Views */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: '#7c8db5', fontSize: 13, flexShrink: 0, marginTop: 2,
                      }}>
                        <EyeIcon />
                        <span>{a.views ?? Math.floor(Math.random() * 200 + 50)}</span>
                      </div>
                    </div>

                    {/* Category + readTime */}
                    {(a.category || a.readTime) && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {a.category && (
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            background: '#e6f7f3', color: '#1a6b5a',
                            padding: '2px 10px', borderRadius: 999,
                          }}>{a.category}</span>
                        )}
                        {a.readTime && (
                          <span style={{ fontSize: 11, color: '#aaa' }}>อ่าน {a.readTime} นาที</span>
                        )}
                      </div>
                    )}

                    {/* Excerpt */}
                    {getExcerpt(a) && (
                      <p style={{
                        margin: 0, fontSize: 13, color: '#555',
                        lineHeight: 1.65,
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {getExcerpt(a)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>

            {/* Category block */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
              <div style={{
                background: '#1a2744', color: '#fff',
                padding: '13px 18px', fontSize: 15, fontWeight: 700,
              }}>
                ข้อมูลประเภทบทความ
              </div>
              <div style={{ padding: '8px 0' }}>
                {allCats.filter(c => c !== 'ทั้งหมด').map(c => (
                  <button key={c} onClick={() => setActiveCat(c)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 18px',
                    background: activeCat === c ? '#e6f7f3' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 14, color: activeCat === c ? '#1a6b5a' : '#333',
                    fontWeight: activeCat === c ? 700 : 400,
                    transition: 'background .15s',
                    borderLeft: activeCat === c ? '3px solid #1a6b5a' : '3px solid transparent',
                  }}
                    onMouseEnter={e => { if (activeCat !== c) e.currentTarget.style.background = '#f5faf8'; }}
                    onMouseLeave={e => { if (activeCat !== c) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{c}</span>
                    <ChevronRight />
                  </button>
                ))}
                <button onClick={() => setActiveCat('ทั้งหมด')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '10px 18px',
                  background: activeCat === 'ทั้งหมด' ? '#e6f7f3' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: 14, color: activeCat === 'ทั้งหมด' ? '#1a6b5a' : '#333',
                  fontWeight: activeCat === 'ทั้งหมด' ? 700 : 400,
                  transition: 'background .15s',
                  borderLeft: activeCat === 'ทั้งหมด' ? '3px solid #1a6b5a' : '3px solid transparent',
                }}>
                  <span>ทั้งหมด</span>
                  <ChevronRight />
                </button>
              </div>
            </div>

            {/* Foreign travel block */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
              <div style={{
                background: '#1a2744', color: '#fff',
                padding: '13px 18px', fontSize: 15, fontWeight: 700,
              }}>
                ข้อมูลท่องเที่ยวต่างประเทศ
              </div>
              <div style={{ padding: '8px 0' }}>
                {FOREIGN_CATS.map(fc => (
                  <button key={fc.key} onClick={() => navigate('tours')} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 18px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    fontSize: 14, color: '#333',
                    transition: 'background .15s',
                    borderLeft: '3px solid transparent',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f5faf8'; e.currentTarget.style.color = '#1a6b5a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333'; }}
                  >
                    <span>{fc.label}</span>
                    <ChevronRight />
                  </button>
                ))}
              </div>
            </div>

            {/* CTA block */}
            <div style={{
              background: 'linear-gradient(135deg,#1a6b5a,#4dd0b1)',
              borderRadius: 12, padding: '20px 18px', color: '#fff', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>สนใจจองทัวร์?</div>
              <p style={{ fontSize: 12, opacity: .85, lineHeight: 1.55, marginBottom: 14 }}>
                เราพร้อมจัดทริปในฝันของคุณ<br/>ทั้งในและต่างประเทศ
              </p>
              <button onClick={() => navigate('contact')} style={{
                background: '#fff', color: '#1a6b5a',
                border: 'none', borderRadius: 8,
                padding: '9px 20px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer', width: '100%',
              }}>
                ติดต่อเรา
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .wrap > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .wrap > div > aside {
            position: static !important;
          }
          article > div:first-child {
            width: 130px !important;
            min-width: 130px !important;
          }
        }
      `}</style>
    </main>
  );
}

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-left':     return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-right':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'clock':          return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'user':           return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
    case 'calendar':       return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    default: return null;
  }
}

export default function ArticleDetailPage({ lang, t, navigate, articles, articleId }) {
  const article = articles.find(a => String(a.id) === String(articleId));

  if (!article) {
    return (
      <main style={{ background: 'var(--canvas)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          {lang === 'th' ? 'ไม่พบบทความ' : 'Article not found.'}
        </div>
      </main>
    );
  }

  const title   = t ? t(article.title)   : (article.title?.en   || article.title?.th   || article.title   || '');
  const excerpt = t ? t(article.excerpt) : (article.excerpt?.en || article.excerpt?.th || article.excerpt || '');
  // content field (rich HTML from editor); fall back to legacy body field
  const rawContent = article.content || article.body || '';
  const body = t ? t(rawContent) : (rawContent?.en || rawContent?.th || rawContent || '');
  const isHtml = typeof body === 'string' && body.trim().startsWith('<');

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)' }}>
      {/* Hero */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="wrap-wide">
          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
            <button onClick={() => navigate('home')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
              {lang === 'th' ? 'หน้าหลัก' : 'Home'}
            </button>
            <span>/</span>
            <button onClick={() => navigate('articles')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
              {lang === 'th' ? 'บทความ' : 'Journal'}
            </button>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{title}</span>
          </nav>

          {/* Category chip */}
          {article.category && (
            <div style={{ marginBottom: 14 }}>
              <span className="chip chip-jade">{article.category}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="h-1" style={{ maxWidth: 800, margin: '0 0 20px' }}>{title}</h1>

          {/* Author + meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            {article.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', color: 'var(--canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15,
                }}>
                  {article.author[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{article.author}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>WeCraft Journal</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {article.readTime && (
                <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="clock" size={11} /> {article.readTime} min read
                </span>
              )}
              {article.date && (
                <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="calendar" size={11} /> {article.date}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {(article.image || article.coverImage) && (
        <section style={{ padding: '0 0 48px' }}>
          <div className="wrap-wide">
            <div style={{ aspectRatio: '16/7', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <img
                src={article.image || article.coverImage}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Article body */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="wrap-wide">
          <div className="layout-sidebar" style={{ gap: 80, alignItems: 'start' }}>

            {/* Body text */}
            <div style={{ maxWidth: 720 }}>
              {excerpt && (
                <p style={{
                  fontSize: 19, lineHeight: 1.6, color: 'var(--ink-2)',
                  borderLeft: '3px solid var(--primary)',
                  paddingLeft: 20, marginBottom: 36,
                  fontStyle: 'italic',
                }}>
                  {excerpt}
                </p>
              )}
              <div style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)' }} className="article-body">
                {body ? (
                  isHtml
                    /* Rich HTML from editor — render directly */
                    ? <div dangerouslySetInnerHTML={{ __html: body }} />
                    /* Legacy plain text — split by newline */
                    : body.split('\n').map((line, i) => {
                        if (!line.trim()) return <div key={i} style={{ height: 12 }} />;
                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={i} style={{ margin: '0 0 16px' }}>
                            {parts.map((part, j) =>
                              part.startsWith('**') && part.endsWith('**')
                                ? <strong key={j}>{part.slice(2, -2)}</strong>
                                : part
                            )}
                          </p>
                        );
                      })
                ) : (
                  <p style={{ color: 'var(--muted)' }}>
                    {lang === 'th' ? 'ยังไม่มีเนื้อหา' : 'No content yet.'}
                  </p>
                )}
              </div>
              <style>{`
                .article-body h1 { font-size:1.8em;font-weight:900;margin:1.4em 0 .5em;color:var(--ink);line-height:1.2 }
                .article-body h2 { font-size:1.45em;font-weight:800;margin:1.3em 0 .45em;color:var(--ink);line-height:1.25 }
                .article-body h3 { font-size:1.15em;font-weight:700;margin:1.1em 0 .4em;color:var(--ink) }
                .article-body blockquote {
                  border-left:4px solid var(--primary);margin:1.2em 0;padding:.7em 1.2em;
                  background:#f0fdfa;color:#0f766e;font-style:italic;border-radius:0 8px 8px 0;
                }
                .article-body hr { border:none;border-top:2px solid var(--line);margin:1.5em 0; }
                .article-body ul { list-style:disc;padding-left:1.8em;margin:.7em 0 1.1em; }
                .article-body ol { list-style:decimal;padding-left:1.8em;margin:.7em 0 1.1em; }
                .article-body li { margin-bottom:.4em; }
                .article-body strong { font-weight:700;color:var(--ink); }
                .article-body em { font-style:italic; }
                .article-body u  { text-decoration:underline; }
                .article-body s  { text-decoration:line-through; }
                .article-body p  { margin-bottom:.9em; }
                .article-body a  { color:var(--primary);text-decoration:underline; }
                .article-body a:hover { opacity:.8; }
                .article-body img { max-width:100%;height:auto;border-radius:10px;margin:1em 0;display:block; }
                .article-body sup { vertical-align:super;font-size:.75em; }
                .article-body sub { vertical-align:sub;font-size:.75em; }
              `}</style>

              {/* Back link */}
              <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
                <button
                  onClick={() => navigate('articles')}
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Icon name="arrow-left" size={14} />
                  {lang === 'th' ? 'กลับไปยังบทความทั้งหมด' : 'Back to all articles'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ position: 'sticky', top: 100 }}>
              <div style={{
                padding: 24, background: 'var(--ink)', color: 'var(--canvas)',
                borderRadius: 'var(--r-lg)',
              }}>
                <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>
                  {lang === 'th' ? 'สำรวจทัวร์' : 'Explore tours'}
                </div>
                <h3 style={{ margin: '12px 0 0', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {lang === 'th' ? 'พร้อมเดินทางหรือยัง?' : 'Ready to travel?'}
                </h3>
                <p style={{ fontSize: 13, opacity: .8, marginTop: 10, lineHeight: 1.5 }}>
                  {lang === 'th'
                    ? 'ดูทัวร์คัดสรรและออกเดินทางในครั้งต่อไปของคุณ'
                    : 'Browse our curated tours and plan your next journey.'}
                </p>
                <button
                  onClick={() => navigate('tours')}
                  className="btn"
                  style={{ marginTop: 18, width: '100%', justifyContent: 'space-between', background: 'var(--accent)', border: 'none', color: '#fff' }}>
                  <span>{lang === 'th' ? 'ดูทัวร์ทั้งหมด' : 'Browse all tours'}</span>
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useState, useEffect } from 'react';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    default: return null;
  }
}

function Countdown({ endDate }) {
  const calc = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      {[
        { v: String(time.h).padStart(2, '0'), l: 'hours' },
        { v: String(time.m).padStart(2, '0'), l: 'min' },
        { v: String(time.s).padStart(2, '0'), l: 'sec' },
      ].map(b => (
        <div key={b.l} style={{
          padding: '12px 16px', background: 'rgba(244,239,230,.08)',
          borderRadius: 'var(--r-md)', textAlign: 'center', minWidth: 76,
        }}>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>{b.v}</div>
          <div style={{ fontSize: 10, opacity: .6, letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 6 }}>{b.l}</div>
        </div>
      ))}
    </div>
  );
}

function PromoCard({ p, highlight, t }) {
  const title = t ? t(p.title) : (p.title?.en || p.title?.th || p.title || '');
  const desc  = t ? t(p.description) : (p.description?.en || p.description?.th || p.description || '');
  return (
    <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 280, background: 'var(--card)' }}>
      <div className="tabular" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--accent)' }}>
        −{p.discount || 10}<span style={{ fontSize: 24, marginLeft: -2 }}>%</span>
      </div>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
        {desc && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{desc}</div>}
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0, flex: 1 }}>{desc}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
        {p.code && (
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '.04em' }}>{p.code}</div>
        )}
        {p.validUntil && (
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
            Ends {new Date(p.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromotionsPage({ lang, t, navigate, promotions, tours, faqs, reviews, settings, compareList, toggleCompare, setBookings, setReviews, setMessages }) {
  const active = promotions.filter(p => p.active !== false);
  const featured = active[0];
  const rest = active.slice(1);

  const getTitle = p => t ? t(p.title) : (p.title?.en || p.title?.th || p.title || '');
  const getDesc  = p => t ? t(p.description) : (p.description?.en || p.description?.th || p.description || '');

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
            <span style={{ color: 'var(--ink)' }}>{t ? t({ th: 'โปรโมชั่น', en: 'Promotions' }) : 'Promotions'}</span>
          </nav>
          <div className="layout-hero" style={{ gap: 64, alignItems: 'end' }}>
            <h1 className="h-display">
              Live <span className="serif-accent" style={{ color: 'var(--accent)' }}>offers</span>.<br />
              Stack them if<br />you can.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 12, maxWidth: 360 }}>
              {t ? t({
                th: 'ส่วนลดทั้งหมดใช้กับราคาทัวร์ก่อนบินและภาษี ส่วนใหญ่สามารถใช้ร่วมกันได้',
                en: 'All discounts apply to the tour price before flights and taxes. Most stack — except where noted.'
              }) : 'Discounts on tour price before flights and taxes. Most can be combined.'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured promo banner */}
      {featured && (
        <section style={{ padding: '32px 0 48px' }}>
          <div className="wrap-wide">
            <div className="layout-feat" style={{
              background: 'var(--ink)', color: 'var(--canvas)',
              borderRadius: 'var(--r-xl)', padding: '48px 56px',
              gap: 48, alignItems: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background number */}
              <div style={{ position: 'absolute', right: -100, top: -100, fontSize: 320, fontWeight: 700, lineHeight: 1, color: 'rgba(255,90,31,.1)', letterSpacing: '-0.04em', userSelect: 'none', pointerEvents: 'none' }}>
                {featured.discount || 10}%
              </div>
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>
                  {t ? t({ th: 'ข้อเสนอพิเศษ', en: 'Featured offer' }) : 'Featured offer'}
                </div>
                <h2 className="h-1" style={{ marginTop: 14 }}>
                  {getTitle(featured)}<br />
                  <span className="serif-accent" style={{ color: 'var(--accent)' }}>−{featured.discount || 10}% off</span> everything.
                </h2>
                <p style={{ marginTop: 20, fontSize: 15, opacity: .85, lineHeight: 1.55, maxWidth: 460 }}>
                  {getDesc(featured)}
                </p>
                {featured.validUntil && <Countdown endDate={featured.validUntil} />}
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--canvas)', color: 'var(--ink)', padding: 24, borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {featured.code && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="eyebrow">Use code at checkout</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 700, letterSpacing: '.05em', marginTop: 6 }}>{featured.code}</div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard?.writeText(featured.code)}
                          className="btn btn-light btn-sm">Copy</button>
                      </div>
                      <div style={{ height: 1, background: 'var(--line)' }} />
                    </>
                  )}
                  {featured.validUntil && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--muted)' }}>Expires</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(featured.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={() => navigate('tours')} className="btn btn-accent btn-lg" style={{ justifyContent: 'space-between' }}>
                  <span>{t ? t({ th: 'ดูทัวร์ที่เข้าร่วม', en: 'Browse eligible tours' }) : 'Browse eligible tours'}</span>
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All promotions grid */}
      <section style={{ padding: '32px 0 80px' }}>
        <div className="wrap-wide">
          <h2 className="h-2" style={{ marginBottom: 32 }}>
            {t ? t({ th: 'ข้อเสนอทั้งหมด', en: 'All current offers' }) : 'All current offers'}
          </h2>
          {active.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)', color: 'var(--muted)' }}>
              {t ? t({ th: 'ยังไม่มีโปรโมชั่น', en: 'No active promotions right now.' }) : 'No active promotions right now.'}
            </div>
          ) : (
            <div className="grid-cols-4" style={{ gap: 14 }}>
              {active.map((p, i) => {
                const title = t ? t(p.title) : (p.title?.en || p.title?.th || p.title || '');
                const desc  = t ? t(p.description) : (p.description?.en || p.description?.th || p.description || '');
                return (
                  <div key={p.id} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 280, background: 'var(--card)' }}>
                    <div className="tabular" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--accent)' }}>
                      −{p.discount || 10}<span style={{ fontSize: 24, marginLeft: -2 }}>%</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
                      {desc && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{desc}</div>}
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px dashed var(--line)', marginTop: 'auto' }}>
                      {p.code && (
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '.04em' }}>{p.code}</div>
                      )}
                      {p.validUntil && (
                        <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
                          Ends {new Date(p.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

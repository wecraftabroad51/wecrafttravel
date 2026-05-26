import { useState } from 'react';
import TourCard from '../TourCard.jsx';

function Icon({ name, size = 18, stroke = 1.6 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up-right': return <svg {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>;
    case 'arrow-left':     return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'search':         return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'map-pin':        return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'calendar':       return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'users':          return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    case 'sparkle':        return <svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>;
    case 'globe':          return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case 'shield':         return <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z"/></svg>;
    case 'leaf':           return <svg {...p}><path d="M5 19c2-9 8-14 16-14-1 9-7 15-16 14zM5 19l7-7"/></svg>;
    case 'play':           return <svg {...p} fill="currentColor" stroke="none"><path d="m8 5 12 7-12 7z"/></svg>;
    case 'check':          return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'line':           return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    default: return null;
  }
}

// ---- HERO ----
function HomeHero({ navigate }) {
  return (
    <section style={{ position: 'relative', paddingTop: 12 }}>
      <div className="wrap-wide" style={{ position: 'relative' }}>
        {/* eyebrow row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 500 }}>
              Now booking · 2026 departures
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 24, alignItems: 'center' }}>
            <span>14 countries</span>
            <span className="dot" />
            <span>62 departures</span>
            <span className="dot" />
            <span>4,800+ travelers</span>
          </div>
        </div>

        {/* big title + description */}
        <div style={{ marginTop: 56, position: 'relative' }}>
          <h1 className="h-display">
            We craft<br />
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>journeys</span>,
            <br />not itineraries.
          </h1>

          <div style={{
            position: 'absolute', right: 0, top: 0,
            maxWidth: 340, textAlign: 'right',
          }}>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Small-group European tours for Thai travelers who want pace, people, and the quiet hours between the postcard moments.
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => navigate('tours')} className="btn btn-primary">
                See 2026 tours <Icon name="arrow-right" size={14} />
              </button>
              <button onClick={() => navigate('contact')} className="btn btn-ghost">
                Talk to a specialist
              </button>
            </div>
          </div>
        </div>

        {/* hero image collage */}
        <div className="layout-hero-3" style={{
          marginTop: 56,
          gridTemplateRows: 'auto auto',
          gap: 12,
          height: 540,
        }}>
          {/* Big left image */}
          <div style={{ position: 'relative', gridRow: 'span 2', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--canvas-2)' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-deep), var(--ink-2))' }} />
            <div style={{
              position: 'absolute', left: 24, bottom: 24,
              background: 'rgba(244,239,230,.95)', padding: '10px 16px',
              borderRadius: 999, fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="play" size={11} /> Watch — 2 min on the road
            </div>
            <div style={{
              position: 'absolute', top: 24, right: 24,
              background: 'var(--ink)', color: 'var(--canvas)',
              padding: '12px 18px', borderRadius: 'var(--r-md)',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>Now in season</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Swiss alpine — Jun→Sep</span>
            </div>
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--sand)' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #c8d6cf, #a8b8b0)' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,31,26,.7), transparent 50%)',
              display: 'flex', alignItems: 'flex-end', padding: 16, color: 'var(--canvas)',
              fontSize: 13, fontWeight: 600,
            }}>
              Sognefjord, NO
            </div>
          </div>

          <div style={{
            position: 'relative', gridRow: 'span 2', borderRadius: 'var(--r-lg)', overflow: 'hidden',
            background: 'var(--primary-deep)', color: 'var(--canvas)',
            padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>Most-booked itinerary</div>
              <h3 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 12, lineHeight: 1.1 }}>
                Italy · Switzerland · France
              </h3>
              <div style={{ marginTop: 8, fontSize: 13, opacity: .75 }}>9D7N · Qatar Airways · max 24</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {["Vatican + St. Peter's", "Jungfraujoch summit", "Eiffel + Versailles"].map(h => (
                <div key={h} style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, opacity: .9 }}>
                  <Icon name="check" size={12} /> {h}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>From</div>
                <div className="tabular" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
                  ฿131,999
                </div>
                <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>per traveler · 5 departures left</div>
              </div>
              <button className="btn btn-accent" onClick={() => navigate('tours')}>
                Reserve <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--canvas-2)' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #d8c9b0, #c0ae94)' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,31,26,.7), transparent 50%)',
              display: 'flex', alignItems: 'flex-end', padding: 16, color: 'var(--canvas)',
              fontSize: 13, fontWeight: 600,
            }}>
              Cabo da Roca, PT
            </div>
          </div>
        </div>

        {/* hero search bar */}
        <div className="search-bar" style={{
          marginTop: 28,
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-xl)',
          padding: 8,
          gap: 4,
          boxShadow: 'var(--shadow-md)',
        }}>
          <SearchField label="Where to" icon="map-pin" placeholder="Italy, Switzerland, Norway…" />
          <SearchField label="When" icon="calendar" placeholder="Any month in 2026" />
          <SearchField label="Travelers" icon="users" placeholder="2 adults" />
          <SearchField label="Budget" icon="sparkle" placeholder="Up to ฿140k" />
          <button
            onClick={() => navigate('tours')}
            className="btn btn-accent btn-lg"
            style={{ borderRadius: 999, margin: 4 }}
          >
            <Icon name="search" size={16} /> Search tours
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchField({ label, icon, placeholder }) {
  return (
    <div style={{ padding: '14px 18px', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <label style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={14} stroke={1.8} />
        <input
          type="text"
          placeholder={placeholder}
          style={{ border: 'none', padding: 0, fontSize: 14, fontWeight: 500, background: 'transparent', width: '100%' }}
        />
      </div>
    </div>
  );
}

// ---- MARQUEE ----
function HomeMarquee() {
  const items = [
    'Italy', 'Switzerland', 'France', 'Portugal', 'Spain',
    'Norway', 'Sweden', 'Denmark', 'Iceland', 'Austria',
    'Czechia', 'Germany', 'Slovakia', 'UK', 'Netherlands',
  ];
  const doubled = [...items, ...items];
  return (
    <section style={{
      borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      overflow: 'hidden', marginTop: 80,
      padding: '22px 0',
    }}>
      <div className="marquee-track" style={{ gap: 48 }}>
        {doubled.map((it, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 48, whiteSpace: 'nowrap' }}>
            <span style={{
              fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em',
              color: i % 3 === 1 ? 'var(--primary)' : 'var(--ink)',
              fontStyle: i % 4 === 2 ? 'italic' : 'normal',
              fontFamily: i % 4 === 2 ? 'Instrument Serif, serif' : 'inherit',
            }}>
              {it}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 20 }}>✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- FEATURED ----
function HomeFeatured({ tours, navigate, t, compareList, toggleCompare }) {
  return (
    <section className="section">
      <div className="wrap-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow">Featured · summer 2026</div>
            <h2 className="h-1" style={{ marginTop: 12 }}>
              The four<br />
              <span className="serif-accent" style={{ color: 'var(--primary)' }}>most-booked</span> right now.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('tours'); }}
              className="link-u"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              See all tours
            </a>
            <button onClick={() => navigate('tours')} className="btn btn-primary btn-sm">
              <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
        <div className="grid-cols-4" style={{ gap: 16, alignItems: 'stretch' }}>
          {tours.slice(0, 4).map(tr => (
            <TourCard
              key={tr.id}
              tour={tr}
              t={t}
              navigate={navigate}
              inCompare={compareList.includes(tr.id)}
              onCompare={() => toggleCompare(tr.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- WHY US ----
function HomeWhy() {
  const items = [
    { num: '01', k: 'Max 26 travelers', v: 'Small enough to fit on one coach, large enough to keep prices honest.', icon: 'users' },
    { num: '02', k: 'Bilingual TH/EN guides', v: 'Every tour has a Thai lead and a local English guide. Two perspectives on every place.', icon: 'globe' },
    { num: '03', k: 'Visa support included', v: 'We prepare your full Schengen file and book your VFS appointment. Refund if refused.', icon: 'shield' },
    { num: '04', k: 'No hidden costs', v: 'Tips, transfers, optional excursions: all costed up-front on the tour page.', icon: 'leaf' },
  ];
  return (
    <section style={{ background: 'var(--ink)', color: 'var(--canvas)', padding: '120px 0' }}>
      <div className="wrap-wide">
        <div className="layout-half" style={{ gap: 80, alignItems: 'start' }}>
          <div className="sticky-aside" style={{ top: 100 }}>
            <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>Why WeCraft</div>
            <h2 className="h-1" style={{ marginTop: 14 }}>
              Eleven<br />years.<br />
              <span style={{ color: 'var(--accent)' }}>One</span>{' '}
              <span className="serif-accent">promise:</span>
            </h2>
            <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.6, color: 'rgba(244,239,230,.75)', maxWidth: 420 }}>
              That the tour you booked is the tour you take. No swapped hotels, no surprise upgrades, no "the bus is full" at 6am. We over-document so you under-worry.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
              <button className="btn" style={{ background: 'var(--canvas)', color: 'var(--ink)' }}>
                Meet the guides <Icon name="arrow-right" size={14} />
              </button>
              <button className="btn btn-ghost" style={{ color: 'var(--canvas)', borderColor: 'rgba(244,239,230,.4)' }}>
                Read reviews
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((it, i) => (
              <div key={i} className="grid-review-item" style={{
                gap: 24, alignItems: 'start',
                padding: '32px 0',
                borderTop: '1px solid rgba(244,239,230,.15)',
              }}>
                <div className="tabular" style={{
                  fontSize: 42, fontWeight: 300, letterSpacing: '-0.04em',
                  color: 'var(--accent)', lineHeight: 1,
                }}>{it.num}</div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>{it.k}</h3>
                  <p style={{ marginTop: 10, color: 'rgba(244,239,230,.7)', fontSize: 14, lineHeight: 1.55, maxWidth: 380 }}>{it.v}</p>
                </div>
                <Icon name={it.icon} size={22} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- PROMOTIONS ----
function HomePromos({ promotions, navigate, t }) {
  const promos = promotions.slice(0, 3);
  return (
    <section className="section">
      <div className="wrap-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow">Live offers</div>
            <h2 className="h-1" style={{ marginTop: 12 }}>
              Save now,<br />travel <span className="serif-accent" style={{ color: 'var(--accent)' }}>later</span>.
            </h2>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('promotions'); }} className="link-u" style={{ fontSize: 14, fontWeight: 500 }}>
            All offers →
          </a>
        </div>
        {promos.length > 0 ? (
          <div className="grid-cols-3" style={{ gap: 16 }}>
            {promos.map((p, i) => <PromoCard key={p.id} promo={p} highlight={i === 0} t={t} />)}
          </div>
        ) : (
          <div style={{ padding: '48px 32px', textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)', color: 'var(--muted)' }}>
            No promotions yet. Check back soon!
          </div>
        )}
      </div>
    </section>
  );
}

function PromoCard({ promo, highlight, t }) {
  return (
    <div style={{
      borderRadius: 'var(--r-lg)',
      background: highlight ? 'var(--accent)' : 'var(--card)',
      color: highlight ? '#fff' : 'var(--ink)',
      border: highlight ? '1px solid var(--accent)' : '1px solid var(--line)',
      padding: 28,
      display: 'flex', flexDirection: 'column', gap: 18,
      minHeight: 320,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="tabular" style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {promo.discount || 10}<span style={{ fontSize: 28, marginLeft: -4 }}>%</span>
        </div>
        <span className="chip" style={{
          background: highlight ? 'rgba(255,255,255,.2)' : 'var(--ink)',
          color: highlight ? '#fff' : 'var(--canvas)',
          borderColor: 'transparent',
        }}>off</span>
      </div>
      <div>
        <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>
          {t ? t(promo.title) : (promo.title?.en || promo.title?.th || promo.title || '')}
        </h3>
        <div style={{ marginTop: 6, fontSize: 13, opacity: .8 }}>
          {t ? t(promo.description) : (promo.description?.en || promo.description?.th || '')}
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 14, borderTop: `1px dashed ${highlight ? 'rgba(255,255,255,.3)' : 'var(--line)'}`,
        marginTop: 'auto',
      }}>
        {promo.code && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>Code</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, marginTop: 2 }}>{promo.code}</div>
          </div>
        )}
        {promo.validUntil && (
          <div style={{ fontSize: 11, opacity: .7, textAlign: 'right' }}>
            Ends<br />{new Date(promo.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- REVIEWS ----
function HomeReviews({ reviews }) {
  const [idx, setIdx] = useState(0);
  const approved = reviews.filter(r => r.approved);
  if (!approved.length) return null;
  const r = approved[idx % approved.length];

  return (
    <section className="section" style={{ background: 'var(--canvas-2)' }}>
      <div className="wrap-wide">
        <div className="layout-feat" style={{ gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Notes from past travelers</div>
            <h2 className="h-1" style={{ marginTop: 12, marginBottom: 32 }}>
              <span className="tabular" style={{ color: 'var(--accent)', fontWeight: 600 }}>4.94</span> / 5<br />
              <span className="serif-accent">across</span> {approved.length}+ reviews.
            </h2>

            <blockquote style={{
              margin: 0, padding: 0,
              fontFamily: 'Instrument Serif, serif',
              fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.01em',
              color: 'var(--ink)',
            }}>
              "{r.text?.th || r.text?.en || r.text || r.quote || ''}"
            </blockquote>

            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18, color: '#fff' }}>
                {(r.name || '?')[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.tourId} · {r.date}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="arrow" onClick={() => setIdx(i => (i - 1 + approved.length) % approved.length)}>
                  <Icon name="arrow-left" size={14} />
                </button>
                <button className="arrow" onClick={() => setIdx(i => (i + 1) % approved.length)}>
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="layout-half" style={{ gap: 12 }}>
            {[
              { n: '4,842', l: 'Travelers since 2015' },
              { n: '94%',   l: 'Repeat or referral' },
              { n: '62',    l: 'Departures in 2026' },
              { n: '0',     l: 'Visa refunds withheld' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--card)', padding: 28,
                borderRadius: 'var(--r-lg)', border: '1px solid var(--line)',
              }}>
                <div className="tabular" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, color: i === 0 ? 'var(--primary)' : 'var(--ink)' }}>
                  {s.n}
                </div>
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- ARTICLES ----
function HomeArticles({ articles, navigate, t }) {
  const list = articles.slice(0, 4);
  if (!list.length) return null;

  return (
    <section className="section">
      <div className="wrap-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow">From the journal</div>
            <h2 className="h-1" style={{ marginTop: 12 }}>
              Field notes &<br />
              <span className="serif-accent">small useful</span> things.
            </h2>
          </div>
          <button onClick={() => navigate('articles')} className="btn btn-ghost">
            Read journal <Icon name="arrow-right" size={14} />
          </button>
        </div>
        <div className="grid-cols-3" style={{ gap: 16 }}>
          {/* big lead */}
          {list[0] && (
            <article
              style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', aspectRatio: '5/6', cursor: 'pointer' }}
              onClick={() => navigate('article-detail', list[0].id)}
            >
              {list[0].image ? (
                <img src={list[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-deep), var(--ink-2))' }} />
              )}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,31,26,.95) 0%, rgba(10,31,26,0) 55%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 36, color: 'var(--canvas)',
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {list[0].category && (
                    <span className="chip" style={{ background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }}>
                      {list[0].category}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0, maxWidth: 480 }}>
                  {t ? t(list[0].title) : (list[0].title?.en || list[0].title?.th || list[0].title || '')}
                </h3>
                <div style={{ marginTop: 20, fontSize: 12, opacity: .7 }}>
                  {list[0].date}
                </div>
              </div>
            </article>
          )}
          {/* secondary columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {list.slice(1, 3).map(a => <ArticleSmall key={a.id} a={a} navigate={navigate} t={t} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {list.slice(3).map(a => <ArticleSmall key={a.id} a={a} navigate={navigate} t={t} />)}
            <ArticleTextOnly />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleSmall({ a, navigate, t }) {
  const title = t ? t(a.title) : (a.title?.en || a.title?.th || a.title || '');
  return (
    <article
      className="card"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, cursor: 'pointer' }}
      onClick={() => navigate('article-detail', a.id)}
    >
      <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
        {a.image
          ? <img src={a.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--canvas-2)' }} />
        }
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <span>{a.category}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.005em', margin: 0, lineHeight: 1.25 }}>{title}</h3>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 'auto' }}>{a.date}</div>
      </div>
    </article>
  );
}

function ArticleTextOnly() {
  return (
    <article style={{
      flex: 1, background: 'var(--ink)', color: 'var(--canvas)',
      borderRadius: 'var(--r-lg)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 14,
      justifyContent: 'space-between',
    }}>
      <div className="eyebrow" style={{ color: 'rgba(244,239,230,.5)' }}>Editorial</div>
      <h3 style={{
        fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, margin: 0,
        fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
      }}>
        "A good itinerary leaves room for the village you didn't plan to stop in."
      </h3>
      <div style={{ fontSize: 12, color: 'rgba(244,239,230,.7)' }}>— From our 2026 design brief</div>
    </article>
  );
}

// ---- CTA ----
function HomeCta({ navigate }) {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap-wide">
        <div className="layout-feat" style={{
          background: 'var(--primary)',
          color: 'var(--canvas)',
          borderRadius: 'var(--r-xl)',
          padding: '80px 64px',
          gap: 64, alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 360, height: 360,
            borderRadius: '50%', background: 'var(--primary-deep)', opacity: .6, pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div className="eyebrow" style={{ color: 'rgba(244,239,230,.7)' }}>Get in touch</div>
            <h2 className="h-1" style={{ marginTop: 14 }}>
              Not sure where<br />
              to go? <span className="serif-accent">Let's</span> talk.
            </h2>
            <p style={{ marginTop: 20, fontSize: 16, opacity: .85, lineHeight: 1.55, maxWidth: 420 }}>
              Tell us your dates and we'll send three tour suggestions within a day — even if none of them are ours.
            </p>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => navigate('contact')}
              className="btn btn-lg"
              style={{ background: 'var(--canvas)', color: 'var(--ink)', justifyContent: 'space-between' }}
            >
              <span>Book a free 15-min call</span>
              <Icon name="arrow-up-right" size={16} />
            </button>
            <button
              className="btn btn-lg"
              style={{ background: 'transparent', color: 'var(--canvas)', border: '1px solid rgba(244,239,230,.4)', justifyContent: 'space-between' }}
            >
              <span>Message us on LINE</span>
              <Icon name="line" size={16} />
            </button>
            <div style={{ marginTop: 14, display: 'flex', gap: 28, fontSize: 13 }}>
              <div>
                <div style={{ opacity: .7, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>Call</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>+66 2 123 4567</div>
              </div>
              <div>
                <div style={{ opacity: .7, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>hello@wecrafttravel.co</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- MAIN EXPORT ----
export default function HomePage({ lang, t, navigate, tours, articles, promotions, faqs, reviews, settings, compareList, toggleCompare, setBookings, setReviews, setMessages }) {
  const featured = tours.filter(tr => tr.featured).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  return (
    <main className="page-enter">
      <HomeHero navigate={navigate} />
      <HomeMarquee />
      <HomeFeatured tours={featured} navigate={navigate} t={t} compareList={compareList} toggleCompare={toggleCompare} />
      <HomeWhy />
      <HomePromos promotions={promotions} navigate={navigate} t={t} />
      <HomeReviews reviews={reviews} />
      <HomeArticles articles={articles} navigate={navigate} t={t} />
      <HomeCta navigate={navigate} />
    </main>
  );
}

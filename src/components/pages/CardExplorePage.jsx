import { useState, useMemo } from 'react';
import { resolveCountryCode, COUNTRIES, flagUrl } from '../../lib/countries.js';

// ── หน้าการ์ดทัวร์เลื่อนแนวนอน (สำหรับ LINE/LIFF + มือถือ) ──────────
function Meta({ icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>{children}
    </span>
  );
}

export default function CardExplorePage({ lang, t, navigate, tours = [], supplierTours = [] }) {
  const th = lang !== 'en';
  const allTours = useMemo(() => [...tours, ...supplierTours], [tours, supplierTours]);
  const [country, setCountry] = useState('');

  const tv = (o) => (o && (o[lang] || o.th || o.en)) || '';

  // ชิปประเทศ (เรียงตามจำนวน)
  const countryChips = useMemo(() => {
    const m = {};
    for (const tr of allTours) { const c = resolveCountryCode(tr); if (c) m[c] = (m[c] || 0) + 1; }
    return Object.entries(m).filter(([c]) => COUNTRIES[c])
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count, ...COUNTRIES[code] }));
  }, [allTours]);

  const list = useMemo(() => {
    let l = country
      ? allTours.filter(tr => resolveCountryCode(tr) === country || tr.country === country)
      : [...allTours];
    // เด่นก่อน แล้วสุ่มพอประมาณให้ดูหลากหลาย
    return l.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [allTours, country]);

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)', minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div className="wrap-wide" style={{ padding: '16px 0 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
          {th ? 'ค้นพบทัวร์' : 'Discover Tours'}
        </h1>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          {th ? 'ปัดขวาดูต่อ →' : 'Swipe →'}
        </span>
      </div>

      {/* Country chips */}
      <div className="wrap-wide">
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button onClick={() => setCountry('')}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              border: `1px solid ${!country ? 'var(--primary)' : 'var(--line)'}`, background: !country ? 'var(--primary)' : 'var(--card)', color: !country ? '#fff' : 'var(--ink-2)' }}>
            {th ? 'ทั้งหมด' : 'All'}
          </button>
          {countryChips.map(c => {
            const on = country === c.code;
            return (
              <button key={c.code} onClick={() => setCountry(on ? '' : c.code)}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary-light)' : 'var(--card)', color: on ? 'var(--primary)' : 'var(--ink-2)' }}>
                <img src={flagUrl(c.code, '32x24')} alt="" width={20} height={15} loading="lazy" style={{ borderRadius: 3, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }} />
                {th ? c.th : c.en}
                <span style={{ fontSize: 11, fontWeight: 700, opacity: .6 }}>{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card carousel */}
      {list.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          {th ? 'กำลังโหลดทัวร์…' : 'Loading tours…'}
        </div>
      ) : (
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 12, overflowX: 'auto', padding: '8px 16px 4px',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        }}>
          {list.map(tour => {
            const name = tv(tour.name);
            const dest = tv(tour.destination);
            const airline = tour.flight?.outbound?.airline || tour.airline || '';
            const discount = tour.discount || 0;
            const rounds = tour.departures?.length || 0;
            const open = () => navigate('tour-detail', tour.id);
            return (
              <article key={tour.id} onClick={open}
                style={{ flex: '0 0 84%', maxWidth: 360, scrollSnapAlign: 'center', cursor: 'pointer',
                  background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 190, background: '#f1f5f9' }}>
                  {tour.image
                    ? <img src={tour.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#cbd5e1' }}>🗺️</div>}
                  {dest && <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,.95)', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{dest}</span>}
                  {discount > 0 && <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--accent-red, #dc2626)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>ลด {discount}%</span>}
                </div>
                {/* Body */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 44 }}>
                    {name}
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                    {tour.duration ? <Meta icon="🕒">{tour.duration} {th ? 'วัน' : 'days'}</Meta> : null}
                    {airline ? <Meta icon="✈️">{airline}</Meta> : null}
                    {rounds ? <Meta icon="📅">{rounds} {th ? 'รอบ' : 'dates'}</Meta> : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{th ? 'เริ่มต้น/ท่าน' : 'From/pax'}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-red, #dc2626)', lineHeight: 1 }}>฿{(tour.price || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); open(); }}
                      style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {th ? 'จองเลย' : 'Book'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          <div style={{ flex: '0 0 8px' }} />
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', paddingTop: 10 }}>
        {list.length} {th ? 'ทัวร์' : 'tours'}
      </div>
    </main>
  );
}

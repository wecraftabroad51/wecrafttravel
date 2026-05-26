function Icon({ name, size = 14 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-up-right': return <svg {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>;
    case 'map-pin':        return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'clock':          return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'users':          return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    case 'plane':          return <svg {...p}><path d="M3 13.5 21 6l-6 16-3-7-7-2z"/></svg>;
    case 'swap':           return <svg {...p}><path d="M3 8h14m0 0-4-4m4 4-4 4M21 16H7m0 0 4 4m-4-4 4-4"/></svg>;
    case 'check':          return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    default: return null;
  }
}

export default function TourCard({ tour, t, navigate, inCompare, onCompare }) {
  const availDep = tour.departures?.find(d => d.bookedSeats < d.totalSeats);

  // Determine name string
  const name = t ? t(tour.name) : (tour.name?.en || tour.name?.th || tour.name || '');
  // Destination string
  const destination = t ? t(tour.destination) : (tour.destination?.en || tour.destination?.th || tour.destination || '');
  // Airline
  const airline = tour.flight?.outbound?.airline || tour.airline || '';
  // Duration
  const durationLabel = tour.duration ? `${tour.duration}D` : '';

  const handleOpen = () => navigate && navigate('tour-detail', tour.id);

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)', cursor: 'pointer' }}>
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
        <img
          src={tour.image}
          alt={name}
          onClick={handleOpen}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform .6s ease',
            display: 'block',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Badges top-left */}
        <div style={{
          position: 'absolute', top: 14, left: 14, right: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tour.featured && (
              <span className="chip chip-jade">
                {t ? t({ th: 'แนะนำ', en: 'Featured' }) : 'Featured'}
              </span>
            )}
            {tour.continent && (
              <span className="chip chip-solid">{tour.continent}</span>
            )}
            {!availDep && tour.departures?.length > 0 && (
              <span className="chip chip-accent">
                {t ? t({ th: 'เต็มแล้ว', en: 'Full' }) : 'Full'}
              </span>
            )}
          </div>
          {/* Compare button */}
          <button
            onClick={e => { e.stopPropagation(); onCompare?.(); }}
            title={inCompare
              ? (t ? t({ th: 'ยกเลิกเปรียบเทียบ', en: 'Remove from compare' }) : 'Remove')
              : (t ? t({ th: 'เปรียบเทียบ', en: 'Compare' }) : 'Compare')}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: inCompare ? 'var(--accent)' : 'rgba(255,255,255,.92)',
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: inCompare ? '#fff' : 'var(--ink)',
            }}
          >
            <Icon name={inCompare ? 'check' : 'swap'} size={14} />
          </button>
        </div>

        {/* Destination strip */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(10,31,26,.85), transparent)',
          padding: '60px 16px 14px',
          color: 'var(--canvas)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="map-pin" size={12} />
            {destination}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <h3
          style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, cursor: 'pointer' }}
          onClick={handleOpen}
        >
          {name}
        </h3>
        {tour.description && (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.45 }}>
            {t ? t(tour.description) : (tour.description?.en || tour.description?.th || tour.description || '')}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--ink-2)', marginTop: 'auto' }}>
          {tour.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="clock" size={13} /> {durationLabel}
            </span>
          )}
          {tour.groupSize && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="users" size={13} /> max {tour.groupSize}
            </span>
          )}
          {airline && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="plane" size={13} /> {airline.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="divider" />

        {/* Price + action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {t ? t({ th: 'เริ่มต้น / คน', en: 'From / pax' }) : 'From / pax'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div className="tabular" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
                ฿{tour.price?.toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={handleOpen}
            style={{
              background: 'var(--ink)', color: 'var(--canvas)',
              width: 38, height: 38, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="arrow-up-right" size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

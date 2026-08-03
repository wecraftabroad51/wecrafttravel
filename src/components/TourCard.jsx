function Icon({ name, size = 14 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'map-pin':  return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'clock':    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'plane':    return <svg {...p}><path d="M3 13.5 21 6l-6 16-3-7-7-2z"/></svg>;
    case 'users':    return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'check':    return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'arrow':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'swap':     return <svg {...p}><path d="M3 8h14m0 0-4-4m4 4-4 4M21 16H7m0 0 4 4m-4-4 4-4"/></svg>;
    default: return null;
  }
}

function StarRating({ rating = 5 }) {
  return (
    <span style={{ color: '#f9a825', fontSize: 12 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function TourCard({ tour, t, navigate, inCompare, onCompare }) {
  // ถ้า totalSeats ไม่ได้ตั้ง (null/0) = ไม่มีข้อจำกัด = ยังว่างอยู่เสมอ
  const availDep = tour.departures?.find(d => !d.totalSeats || d.bookedSeats < d.totalSeats);
  const name = t ? t(tour.name) : (tour.name?.en || tour.name?.th || tour.name || '');
  const destination = t ? t(tour.destination) : (tour.destination?.en || tour.destination?.th || tour.destination || '');
  const airline = tour.flight?.outbound?.airline || tour.airline || '';
  const durationLabel = tour.duration ? `${tour.duration} วัน` : '';
  const discountPct = tour.discount || 0;
  const originalPrice = discountPct ? Math.round(tour.price / (1 - discountPct / 100)) : null;
  const handleOpen = () => navigate && navigate('tour-detail', tour.id);

  return (
    <article
      className="card"
      style={{ display: 'flex', flexDirection: 'column', background: '#fff', cursor: 'pointer', position: 'relative' }}
      onClick={handleOpen}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        {tour.image ? (
          <img
            src={tour.image}
            alt={name}
            style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #ff8f00 0%, #e65c00 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, color: 'rgba(255,255,255,.5)',
          }}>✈</div>
        )}

        {/* โลโก้ WeCraft ทับแบนเนอร์ (รีแบรนด์ · ทับมุมที่ซัพมักใส่รหัส) */}
        {tour.image && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,.92)', borderRadius: 8, padding: '3px 8px 3px 5px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 5px rgba(0,0,0,.18)', pointerEvents: 'none' }}>
            <img src="/logo.png" alt="WeCraft Travel" width={18} height={18} style={{ objectFit: 'contain', display: 'block' }} />
            <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--primary, #e65c00)', letterSpacing: '.02em' }}>WeCraft Travel</span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            background: 'var(--accent-red)',
            color: '#fff', padding: '6px 12px',
            fontSize: 13, fontWeight: 700,
            borderBottomRightRadius: 8,
          }}>
            ลด {discountPct}%
          </div>
        )}

        {/* Featured badge */}
        {tour.featured && !discountPct && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'var(--primary)', color: '#fff',
            padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700,
          }}>
            แนะนำ
          </div>
        )}

        {/* Full badge */}
        {!availDep && tour.departures?.length > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#555', color: '#fff',
            padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700,
          }}>
            เต็มแล้ว
          </div>
        )}

        {/* Compare button */}
        <button
          onClick={e => { e.stopPropagation(); onCompare?.(); }}
          title={inCompare ? 'ยกเลิกเปรียบเทียบ' : 'เปรียบเทียบ'}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%',
            background: inCompare ? 'var(--primary)' : 'rgba(255,255,255,.9)',
            border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: inCompare ? '#fff' : 'var(--ink)',
            boxShadow: '0 2px 6px rgba(0,0,0,.15)',
          }}
        >
          <Icon name={inCompare ? 'check' : 'swap'} size={13} />
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Destination */}
        {destination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
            <Icon name="map-pin" size={12} />{destination}
          </div>
        )}

        {/* Name */}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.35, color: 'var(--ink)' }}>
          {name}
        </h3>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          {tour.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={12} />{durationLabel}
            </span>
          )}
          {airline && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="plane" size={12} />{airline}
            </span>
          )}
          {tour.groupSize && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="users" size={12} />สูงสุด {tour.groupSize} คน
            </span>
          )}
        </div>

        {/* Departure dates */}
        {availDep && (
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="calendar" size={12} />
            วันเดินทาง: {new Date(availDep.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
          </div>
        )}

        <div style={{ height: 1, background: 'var(--line)', margin: '4px 0', marginTop: 'auto' }} />

        {/* Price + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>ราคาเริ่มต้น / คน</div>
            {originalPrice && (
              <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                ฿{originalPrice.toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)', lineHeight: 1 }}>
              ฿{tour.price?.toLocaleString()}
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleOpen(); }}
            style={{
              width: '100%',
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 6,
              padding: '10px 14px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            ดูโปรแกรม <Icon name="arrow" size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

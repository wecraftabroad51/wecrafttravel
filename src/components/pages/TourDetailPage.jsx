import { useState } from 'react';
import TourCard from '../TourCard.jsx';

/* ── Icons ───────────────────────────────────────────────────── */
function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-left':  return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'phone':       return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'line':        return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'file':        return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
    case 'bookmark':    return <svg {...p}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'chevron-down':return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevron-up':  return <svg {...p}><path d="m18 15-6-6-6 6"/></svg>;
    case 'check':       return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'close':       return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'star':        return <svg {...p} fill="currentColor" stroke="none"><path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.5l1.3-6.8-5-4.7 6.8-.8z"/></svg>;
    case 'calendar':    return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'users':       return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    default: return null;
  }
}

function Stars({ value = 5, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#f59e0b' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.5l1.3-6.8-5-4.7 6.8-.8z"/>
        </svg>
      ))}
    </span>
  );
}

/* ── Accordion ───────────────────────────────────────────────── */
function Accordion({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: '#f8fafc', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, color: '#1e293b', fontFamily: 'inherit',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{icon && <span>{icon}</span>}{title}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {open && (
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Info cell ───────────────────────────────────────────────── */
function InfoCell({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0' }}>
      {icon && <span style={{ color: '#2db04b', marginTop: 1, flexShrink: 0 }}>{icon}</span>}
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{value || '-'}</div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function TourDetailPage({ lang, t, navigate, tours, reviews, setBookings, setReviews, tourId, compareList, toggleCompare }) {
  const tour = tours.find(tr => String(tr.id) === String(tourId));
  const [saved, setSaved]           = useState(false);
  const [lightbox, setLightbox]     = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, text: '' });
  const [reviewSent, setReviewSent] = useState(false);

  const tv = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return lang === 'th' ? (obj.th || obj.en || '') : (obj.en || obj.th || '');
  };

  if (!tour) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center', color: '#94a3b8' }}>
        {lang === 'th' ? 'ไม่พบทัวร์' : 'Tour not found'}
      </div>
    );
  }

  const tourReviews = reviews.filter(r => String(r.tourId) === String(tour.id) && r.approved);
  const tourName    = tv(tour.name);
  const airline     = tour.flight?.outbound?.airline || tour.airline || '';
  const basePrice   = tour.priceTiers?.[0]?.price || tour.price || 0;

  /* departure status helper */
  const depStatus = (dep) => {
    if (!dep.totalSeats) return 'open';
    if (dep.bookedSeats >= dep.totalSeats) return 'full';
    if ((dep.totalSeats - dep.bookedSeats) <= 5) return 'hurry';
    return 'open';
  };

  const submitReview = () => {
    if (!reviewForm.name || !reviewForm.text) return;
    setReviews(prev => [...prev, {
      id: Date.now(), tourId: tour.id, ...reviewForm,
      approved: false, date: new Date().toISOString().split('T')[0],
      text: { th: reviewForm.text, en: reviewForm.text }
    }]);
    setReviewSent(true);
  };

  return (
    <main className="page-enter" style={{ background: '#f8fafc', minHeight: '80vh' }}>
      <style>{`
        .td-back-btn { display:inline-flex;align-items:center;gap:6px;background:#1e293b;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s; }
        .td-back-btn:hover { background:#0f172a; }
        .td-action-btn { display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s; }
        .td-action-btn:hover { opacity:.88; }
        .td-table { width:100%;border-collapse:collapse;font-size:13px; }
        .td-table th { background:#0f3460;color:#fff;padding:10px 12px;text-align:center;font-size:12px;font-weight:600;white-space:nowrap; }
        .td-table td { padding:9px 12px;text-align:center;border-bottom:1px solid #e2e8f0;white-space:nowrap; }
        .td-table tr:last-child td { border-bottom:none; }
        .td-table tr:nth-child(even) td { background:#f8fafc; }
        .td-table tr:hover td { background:#f0fdf4; }
        .td-status-full   { display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#fee2e2;color:#dc2626; }
        .td-status-hurry  { display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a;cursor:pointer; }
        .td-status-open   { display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a;cursor:pointer; }
        .td-save-btn { display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid #e2e8f0;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s;font-family:inherit; }
        .td-save-btn:hover { border-color:#2db04b;color:#2db04b; }
        .td-save-btn.saved { border-color:#2db04b;color:#2db04b;background:#f0fdf4; }
      `}</style>

      {/* ── Back button bar ───────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 0' }}>
        <div className="wrap-wide">
          <button className="td-back-btn" onClick={() => navigate('tours')}>
            <Icon name="arrow-left" size={14} />
            {lang === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
        </div>
      </div>

      {/* ── Main card ─────────────────────────────────────────── */}
      <div className="wrap-wide" style={{ paddingTop: 20, paddingBottom: 8 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 12 }}>

          {/* Image + Info row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

            {/* Tour image */}
            <div style={{ flexShrink: 0, width: 220, minWidth: 180 }}>
              <div style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', background: '#e2e8f0' }}>
                <img
                  src={tour.image}
                  alt={tourName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Tour info */}
            <div style={{ flex: 1, minWidth: 260 }}>
              {/* Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {tour.continent && (
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {tour.continent}
                  </span>
                )}
                {tour.tourType && (
                  <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {tour.tourType}
                  </span>
                )}
                {tour.featured && (
                  <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    ⭐ แนะนำ
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 'clamp(16px,2vw,22px)', fontWeight: 800, color: '#1e293b', margin: '0 0 8px', lineHeight: 1.3 }}>
                {tourName}
              </h1>

              {/* Description */}
              {tour.description && (
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {tv(tour.description)}
                </p>
              )}

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 16, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px 0' }}>
                <InfoCell label={lang === 'th' ? 'รหัสทัวร์' : 'Tour Code'}
                  value={tour.code || `TW${String(tour.id).padStart(4,'0')}`}
                  icon={<Icon name="file" size={14} />} />
                <InfoCell label={lang === 'th' ? 'ประเภท' : 'Type'}
                  value={lang === 'th' ? (tour.tourType || 'ทัวร์') : (tour.tourType || 'Tour')}
                  icon={<Icon name="star" size={14} />} />
                <InfoCell label={lang === 'th' ? 'กำหนดการเดินทาง' : 'Travel Dates'}
                  value={tour.departures?.length > 0
                    ? `${tour.departures[0].date} - ${tour.departures[tour.departures.length-1].date}`
                    : (lang === 'th' ? 'ติดต่อสอบถาม' : 'Contact us')}
                  icon={<Icon name="calendar" size={14} />} />
                <InfoCell label={lang === 'th' ? 'จำนวนวัน' : 'Duration'}
                  value={tour.duration ? `${tour.duration} ${lang === 'th' ? 'วัน' : 'days'}` : '-'}
                  icon={<Icon name="calendar" size={14} />} />
                <InfoCell label={lang === 'th' ? 'ราคาเริ่มต้น' : 'Starting Price'}
                  value={<span style={{ color: '#dc2626', fontWeight: 800, fontSize: 16 }}>
                    {basePrice.toLocaleString()} {lang === 'th' ? 'บาท/ท่าน' : 'THB/person'}
                  </span>}
                  icon={<span style={{ color: '#dc2626', fontSize: 14 }}>฿</span>} />
                <InfoCell label={lang === 'th' ? 'เดินทางโดย' : 'Airline'}
                  value={airline || (lang === 'th' ? 'ติดต่อสอบถาม' : 'TBA')}
                  icon={<span style={{ fontSize: 14 }}>✈️</span>} />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="tel:0618686889" style={{ textDecoration: 'none' }}>
                  <button className="td-action-btn" style={{ background: '#0f3460', color: '#fff' }}>
                    <Icon name="phone" size={14} />
                    {lang === 'th' ? 'โทรจอง' : 'Call'}
                  </button>
                </a>
                <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="td-action-btn" style={{ background: '#06c755', color: '#fff' }}>
                    <Icon name="line" size={14} />
                    {lang === 'th' ? 'จองไลน์' : 'LINE'}
                  </button>
                </a>
                {tour.pdfUrl && (
                  <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="td-action-btn" style={{ background: '#e65c00', color: '#fff' }}>
                      <Icon name="file" size={14} />
                      {lang === 'th' ? 'ดูโปรแกรมทั้งวัน' : 'Full Program'}
                    </button>
                  </a>
                )}
                <button
                  className={`td-save-btn${saved ? ' saved' : ''}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Icon name="bookmark" size={13} />
                  {saved
                    ? (lang === 'th' ? 'บันทึกแล้ว' : 'Saved')
                    : (lang === 'th' ? 'กาวตรา' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Departure & Price table ────────────────────────── */}
        {tour.departures?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ background: '#0f3460', padding: '12px 20px' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                📅 {lang === 'th' ? 'วันเดินทางและราคา' : 'Departure Dates & Prices'}
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="td-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{lang === 'th' ? 'วันเดินทางไป-กลับ' : 'Travel Dates'}</th>
                    <th>{lang === 'th' ? 'ผู้ใหญ่' : 'Adult'}</th>
                    <th>{lang === 'th' ? 'เด็กเดี่ยว' : 'Child (solo)'}</th>
                    <th>{lang === 'th' ? 'พักเดี่ยว' : 'Single supp.'}</th>
                    <th>{lang === 'th' ? 'จอยแลนด์' : 'Joyland'}</th>
                    <th>Group Size</th>
                    <th>{lang === 'th' ? 'รับได้' : 'Available'}</th>
                    <th>{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.departures.map((dep, i) => {
                    const st       = depStatus(dep);
                    const adultP   = dep.price || tour.priceTiers?.[0]?.price || basePrice;
                    const childP   = dep.childPrice || tour.priceTiers?.find(p => p.tier === 'Child')?.price || null;
                    const singleP  = dep.singleSupplement || tour.priceTiers?.find(p => p.tier === 'Single')?.price || null;
                    const avail    = dep.totalSeats ? (dep.totalSeats - (dep.bookedSeats || 0)) : dep.groupSize || tour.groupSize || '-';
                    return (
                      <tr key={dep.id || i}>
                        <td style={{ textAlign: 'left', fontWeight: 600, color: '#0f3460' }}>
                          {dep.date}{dep.returnDate ? ` - ${dep.returnDate}` : ''}
                        </td>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>
                          {adultP ? adultP.toLocaleString() : '-'}
                        </td>
                        <td>{childP ? childP.toLocaleString() : '-'}</td>
                        <td>{singleP ? singleP.toLocaleString() : '-'}</td>
                        <td>-</td>
                        <td>
                          {dep.groupSize || tour.groupSize
                            ? <span style={{ fontWeight: 700, color: '#0369a1' }}>{dep.groupSize || tour.groupSize}</span>
                            : '-'}
                        </td>
                        <td style={{ fontWeight: 600 }}>{typeof avail === 'number' ? avail : avail}</td>
                        <td>
                          {st === 'full'
                            ? <span className="td-status-full">{lang === 'th' ? 'ปิดรับ' : 'Full'}</span>
                            : st === 'hurry'
                            ? <span className="td-status-hurry" onClick={() => navigate('contact')}>{lang === 'th' ? 'จองด่วน!' : 'Book fast!'}</span>
                            : <span className="td-status-open" onClick={() => navigate('contact')}>{lang === 'th' ? 'จองด่วน' : 'Book now'}</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Accordions ────────────────────────────────────── */}
        {/* Program detail */}
        {(tour.itinerary?.length > 0 || tour.includes?.length > 0) && (
          <Accordion title={lang === 'th' ? 'รายละเอียดโปรแกรม' : 'Program Details'} icon="📋" defaultOpen={false}>
            {/* Timeline */}
            {tour.itinerary?.length > 0 && (
              <div style={{ position: 'relative', paddingLeft: 32 }}>
                <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: '#e2e8f0' }} />
                {tour.itinerary.map((day, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingBottom: 20 }}>
                    <div style={{
                      position: 'absolute', left: -32, top: 2,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#0f3460', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, zIndex: 1,
                    }}>
                      {day.day || idx + 1}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                      {tv(day.title)}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                      {tv(day.description)}
                    </div>
                    {day.meals?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {day.meals.map(m => (
                          <span key={m} style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                            {m === 'breakfast' ? '☕ เช้า' : m === 'lunch' ? '🍱 กลางวัน' : '🍽️ เย็น'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Includes / Excludes */}
            {(tour.includes?.length > 0 || tour.excludes?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                {tour.includes?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#16a34a', marginBottom: 8 }}>✅ {lang === 'th' ? 'รวมในราคา' : 'Included'}</div>
                    {tour.includes.map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#374151', padding: '3px 0', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ color: '#16a34a', flexShrink: 0 }}>•</span> {tv(item)}
                      </div>
                    ))}
                  </div>
                )}
                {tour.excludes?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 8 }}>❌ {lang === 'th' ? 'ไม่รวมในราคา' : 'Not included'}</div>
                    {tour.excludes.map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#374151', padding: '3px 0', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ color: '#dc2626', flexShrink: 0 }}>•</span> {tv(item)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Accordion>
        )}

        {/* PDF program */}
        {tour.pdfUrl && (
          <Accordion title={lang === 'th' ? 'ไฟล์โปรแกรม' : 'Program File'} icon="📄" defaultOpen={false}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#0f3460', color: '#fff', borderRadius: 8,
                  padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>
                <Icon name="file" size={14} />
                {lang === 'th' ? 'ดาวน์โหลดโปรแกรมทัวร์ (PDF)' : 'Download Tour Program (PDF)'}
              </a>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {lang === 'th' ? 'ไฟล์ PDF รายละเอียดโปรแกรม' : 'Full program PDF'}
              </span>
            </div>
            {/* Embed PDF if possible */}
            <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', height: 500 }}>
              <iframe src={tour.pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Tour Program PDF" />
            </div>
          </Accordion>
        )}

        {/* Reviews accordion */}
        {tourReviews.length > 0 && (
          <Accordion title={`${lang === 'th' ? 'รีวิวจากนักท่องเที่ยว' : 'Traveler Reviews'} (${tourReviews.length})`} icon="⭐" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tourReviews.map(r => (
                <div key={r.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f3460', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {(r.name || '?')[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</span>
                        <Stars value={r.rating} />
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.date}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
                        {tv(r.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        {/* Write review accordion */}
        <Accordion title={lang === 'th' ? 'เขียนรีวิว' : 'Write a Review'} icon="✍️" defaultOpen={false}>
          {reviewSent ? (
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 8, color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
              ✅ {lang === 'th' ? 'ขอบคุณ! รีวิวของคุณรอการอนุมัติ' : 'Thank you! Your review is pending approval.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder={lang === 'th' ? 'ชื่อ *' : 'Name *'} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}
                  value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} />
                <input placeholder="Email" style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}
                  value={reviewForm.email} onChange={e => setReviewForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Rating:</span>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: s <= reviewForm.rating ? '#f59e0b' : '#e2e8f0', padding: 2 }}>
                    <Icon name="star" size={20} />
                  </button>
                ))}
              </div>
              <textarea rows={4} placeholder={lang === 'th' ? 'เขียนรีวิวของคุณ...' : 'Write your review…'}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
                value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))} />
              <button onClick={submitReview}
                style={{ alignSelf: 'flex-start', background: '#0f3460', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang === 'th' ? 'ส่งรีวิว' : 'Submit Review'}
              </button>
            </div>
          )}
        </Accordion>
      </div>

      {/* ── Related tours ─────────────────────────────────────── */}
      {tours.filter(tr => tr.id !== tour.id).length > 0 && (
        <div className="wrap-wide" style={{ paddingBottom: 60 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 18px' }}>
              {lang === 'th' ? '🗺️ ทัวร์ที่น่าสนใจอื่นๆ' : '🗺️ You may also like'}
            </h2>
            <div className="grid-cols-4" style={{ gap: 14 }}>
              {tours.filter(tr => tr.id !== tour.id).slice(0, 4).map(tr => (
                <TourCard key={tr.id} tour={tr} t={t} navigate={navigate}
                  inCompare={compareList?.includes(tr.id)}
                  onCompare={() => toggleCompare?.(tr.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {lightbox !== null && tour.gallery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLightbox(null)}>
          <img src={tour.gallery[lightbox]} alt="" style={{ maxHeight: '85vh', maxWidth: '90vw', borderRadius: 10 }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </main>
  );
}

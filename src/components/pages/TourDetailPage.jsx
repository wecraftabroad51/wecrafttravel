import { useState, useEffect } from 'react';
import TourCard from '../TourCard.jsx';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-left':   return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'phone':        return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'line':         return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'file-text':    return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
    case 'bookmark':     return <svg {...p}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'bookmark-fill':return <svg {...p} fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'chevron-down': return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevron-up':   return <svg {...p}><path d="m18 15-6-6-6 6"/></svg>;
    case 'check':        return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'x':            return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'star':         return <svg {...p} fill="currentColor" stroke="none"><path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.5l1.3-6.8-5-4.7 6.8-.8z"/></svg>;
    case 'download':     return <svg {...p}><path d="M12 3v13M7 11l5 5 5-5M3 20h18"/></svg>;
    case 'tag':          return <svg {...p}><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/></svg>;
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

function Accordion({ title, icon, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 20px', background: open ? '#f0f9ff' : '#f8fafc',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        borderBottom: open ? '1px solid #bae6fd' : 'none',
        transition: 'background .15s',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
          {icon && <span style={{ fontSize: 19 }}>{icon}</span>}
          {title}
          {badge && (
            <span style={{ background: '#0f3460', color: '#fff', fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              {badge}
            </span>
          )}
        </span>
        <span style={{ color: open ? '#0369a1' : '#94a3b8', transition: 'transform .2s', transform: open ? 'rotate(0)' : 'rotate(0)' }}>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
        </span>
      </button>
      {open && <div style={{ padding: '20px', background: '#fff' }}>{children}</div>}
    </div>
  );
}

export default function TourDetailPage({ lang, t, navigate, tours, supplierTours = [], reviews, setBookings, setReviews, tourId, compareList, toggleCompare }) {
  // supplier tour id = "sup_<source>_<code>" (code อาจมี '_' ได้ → rejoin)
  const isPb = String(tourId).startsWith('sup_');
  const _parts  = isPb ? String(tourId).split('_') : [];
  const pbSource = _parts[1];
  const pbId     = _parts.slice(2).join('_');

  // ── Fetch supplier full detail (plans, include/notInclude) ────
  const [pbDetail, setPbDetail] = useState(null);
  useEffect(() => {
    if (!isPb || !pbId || !pbSource) return;
    fetch(`/api/suppliers?supplier=${pbSource}&id=${pbId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPbDetail(data.data || data); })
      .catch(() => {});
  }, [pbId, pbSource]);

  const allTours = [...tours, ...supplierTours];
  const tour = allTours.find(tr => String(tr.id) === String(tourId));

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
  const airline     = tour.flight?.outbound?.airline || tour.airline || pbDetail?.vehicle || '';
  const basePrice   = tour.priceTiers?.[0]?.price || tour.price || 0;
  const tourCode    = tour.code || '-';

  // Travel month range from departures
  const MONTHS_TH      = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const MONTHS_TH_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const parseDate = (s) => {
    if (!s) return null;
    const parts = String(s).trim().split(/[-/]/);
    if (parts.length < 3) return null;
    const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return { d, m, y: y < 2400 ? y + 543 : y };
  };
  const formatDepRange = (dateStr, returnDateStr) => {
    const a = parseDate(dateStr);
    const b = parseDate(returnDateStr);
    if (!a) return dateStr || '';
    if (!b) return `${a.d} ${MONTHS_TH_FULL[a.m]} ${a.y}`;
    if (a.m === b.m && a.y === b.y) return `${a.d}-${b.d} ${MONTHS_TH_FULL[a.m]} ${a.y}`;
    if (a.y === b.y) return `${a.d} ${MONTHS_TH_FULL[a.m]} – ${b.d} ${MONTHS_TH_FULL[b.m]} ${a.y}`;
    return `${a.d} ${MONTHS_TH_FULL[a.m]} ${a.y} – ${b.d} ${MONTHS_TH_FULL[b.m]} ${b.y}`;
  };
  // Robustly extract month index (0-11) from a date value of any common shape:
  // "YYYY-MM-DD", "YYYY/MM/DD", Date object, timestamp, or other parseable string.
  const monthFromDateVal = (val) => {
    if (val === null || val === undefined || val === '') return NaN;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? NaN : val.getMonth();
    }
    const s = String(val).trim();
    // Direct ISO-ish match avoids timezone parsing quirks entirely
    const m1 = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m1) {
      const mo = parseInt(m1[2], 10);
      return (mo >= 1 && mo <= 12) ? mo - 1 : NaN;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? NaN : d.getMonth();
  };
  const travelMonthRange = (() => {
    const deps = Array.isArray(tour.departures) ? tour.departures : [];
    if (!deps.length) return null;
    const months = [];
    deps.forEach(d => {
      if (!d) return;
      [d.date, d.returnDate].forEach(dt => {
        const m = monthFromDateVal(dt);
        if (!isNaN(m)) months.push(m);
      });
    });
    if (!months.length) return null;
    const minM = Math.min(...months);
    const maxM = Math.max(...months);
    return minM === maxM ? MONTHS_TH[minM] : `${MONTHS_TH[minM]}-${MONTHS_TH[maxM]}`;
  })();

  const depStatus = (dep) => {
    if (!dep.totalSeats) return 'open';
    const avail = dep.totalSeats - (dep.bookedSeats || 0);
    if (avail <= 0) return 'full';
    if (avail <= 5) return 'hurry';
    return 'open';
  };

  const submitReview = () => {
    if (!reviewForm.name || !reviewForm.text) return;
    setReviews(prev => [...prev, {
      id: Date.now(), tourId: tour.id, ...reviewForm,
      approved: false, date: new Date().toISOString().split('T')[0],
      text: { th: reviewForm.text, en: reviewForm.text },
    }]);
    setReviewSent(true);
  };

  const th = lang === 'th';

  return (
    <main className="page-enter" style={{ background: '#f0f4f8', minHeight: '80vh' }}>
      <style>{`
        @keyframes tdFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .td-card { background:#fff; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 2px 12px rgba(0,0,0,.06); animation:tdFadeIn .4s ease both; }
        .td-back { display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:10px;padding:8px 18px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s; }
        .td-back:hover { background:rgba(255,255,255,.25); }
        .td-btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:10px;padding:11px 22px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;letter-spacing:.01em; }
        .td-btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,.15); }
        .td-save { display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 16px;font-size:15px;font-weight:700;color:#64748b;cursor:pointer;font-family:inherit;transition:all .2s; }
        .td-save:hover,.td-save.active { border-color:#2db04b;color:#16a34a;background:#f0fdf4; }
        .td-table { width:100%;border-collapse:collapse; }
        .td-table th { background:linear-gradient(135deg,#0f3460,#1e4a7a);color:#fff;padding:11px 14px;text-align:center;font-size:14.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap; }
        .td-table th:first-child { text-align:left;border-radius:0; }
        .td-table td { padding:10px 14px;text-align:center;border-bottom:1px solid #f1f5f9;font-size:16px;white-space:nowrap; }
        .td-table td:first-child { text-align:left; }
        .td-table tr:last-child td { border-bottom:none; }
        .td-table tbody tr:hover td { background:#f8fafc; }
        .td-full   { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:14px;font-weight:700;background:#fee2e2;color:#dc2626; }
        .td-hurry  { display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:20px;font-size:14px;font-weight:700;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,.3);transition:all .15s; }
        .td-hurry:hover { transform:scale(1.05); }
        .td-open   { display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:20px;font-size:14px;font-weight:700;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,.3);transition:all .15s; }
        .td-open:hover { transform:scale(1.05); }
        .info-cell { display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9; }
        .info-cell:last-child { border-bottom:none; }
        .info-label { font-size:13.5px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px; }
        .info-value { font-size:16.5px;font-weight:700;color:#1e293b;line-height:1.3; }
        .chip-cont { display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:14px;font-weight:700;letter-spacing:.02em; }
      `}</style>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#0f3460 0%,#1e4a7a 50%,#0f3460 100%)',
        padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,.1)',
      }}>
        <div className="wrap-wide" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="td-back" onClick={() => navigate('tours')}>
            <Icon name="arrow-left" size={14} />
            {th ? 'ย้อนกลับ' : 'Back'}
          </button>
          <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 15 }}>
              {th ? 'หน้าหลัก' : 'Home'}
            </button>
            <span>/</span>
            <button onClick={() => navigate('tours')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 15 }}>
              {th ? 'ทัวร์' : 'Tours'}
            </button>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>{tourName}</span>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="wrap-wide" style={{ padding: '20px 0 60px' }}>

        {/* ── Card: Image + Info ──────────────────────────────── */}
        <div className="td-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>

            {/* Image */}
            <div style={{ width: 420, minWidth: 280, flexShrink: 0, position: 'relative', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tour.image ? (
                <img src={tour.image} alt={tourName}
                  style={{ width: '100%', height: 'auto', maxHeight: 560, objectFit: 'contain', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 51 }}>
                  🗺️
                </div>
              )}
              {/* Overlay badges */}
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tour.featured && (
                  <span className="chip-cont" style={{ background: '#fef3c7', color: '#b45309' }}>⭐ แนะนำ</span>
                )}
                {tour.discount > 0 && (
                  <span className="chip-cont" style={{ background: '#fee2e2', color: '#dc2626' }}>-{tour.discount}%</span>
                )}
              </div>
            </div>

            {/* Info panel */}
            <div style={{ flex: 1, minWidth: 280, padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>

              {/* Type chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {tour.continent && (
                  <span className="chip-cont" style={{ background: '#e0f2fe', color: '#0369a1' }}>{tour.continent}</span>
                )}
                {tour.tourType && (
                  <span className="chip-cont" style={{ background: '#f0fdf4', color: '#16a34a' }}>{tour.tourType}</span>
                )}
                {tour.country && (
                  <span className="chip-cont" style={{ background: '#faf5ff', color: '#7c3aed' }}>📍 {tv(tour.destination) || tour.country}</span>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(18px,1.8vw,24px)', fontWeight: 800,
                color: '#0f172a', margin: '0 0 10px', lineHeight: 1.35,
                borderLeft: '4px solid #0f3460', paddingLeft: 12,
              }}>
                {tourName}
              </h1>

              {/* Description */}
              {tour.description && (
                <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 16px', lineHeight: 1.65, maxWidth: 560 }}>
                  {tv(tour.description)}
                </p>
              )}

              {/* Info grid — 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', flex: 1, alignContent: 'start' }}>
                {[
                  { icon: '🔖', label: th ? 'รหัสทัวร์' : 'Tour Code',    val: <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 15 }}>{tourCode}</span> },
                  { icon: '🏷️', label: th ? 'ประเภท' : 'Type',            val: tour.tourType || '-' },
                  { icon: '📅', label: th ? 'กำหนดการเดินทาง' : 'Travel Period',
                    val: tour.departures?.length > 0
                      ? formatDepRange(tour.departures[0].date, tour.departures[tour.departures.length-1].returnDate || tour.departures[tour.departures.length-1].date)
                      : (th ? 'ติดต่อสอบถาม' : 'Contact us') },
                  { icon: '⏱️', label: th ? 'จำนวนวัน' : 'Duration',       val: tour.duration ? `${tour.duration} ${th ? 'วัน' : 'days'}` : '-' },
                  { icon: '💰', label: th ? 'ราคาเริ่มต้น' : 'Starting Price',
                    val: <span style={{ color: '#dc2626', fontWeight: 800, fontSize: 20 }}>
                      {basePrice.toLocaleString()} <span style={{ fontSize: 15, fontWeight: 600 }}>{th ? 'บาท/ท่าน' : 'THB/pax'}</span>
                    </span> },
                  { icon: '🗓️', label: th ? 'ช่วงเดือนที่เดินทาง' : 'Travel Months',
                    val: <span style={{ fontWeight: 700, color: travelMonthRange ? '#0f766e' : '#94a3b8' }}>{travelMonthRange || '-'}</span> },
                  { icon: '✈️', label: th ? 'เดินทางโดย' : 'Airline',      val: airline || (th ? 'ติดต่อสอบถาม' : 'TBA') },
                  ...(pbDetail?.hotelStar ? [{ icon: '🏨', label: th ? 'ระดับโรงแรม' : 'Hotel', val: `${'⭐'.repeat(pbDetail.hotelStar)} (${pbDetail.hotelStar} ${th ? 'ดาว' : 'stars'})` }] : []),
                ].map(({ icon, label, val }) => (
                  <div key={label} className="info-cell">
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                    <div>
                      <div className="info-label">{label}</div>
                      <div className="info-value">{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />

              {/* PDF Banner (prominent) */}
              {tour.pdfUrl && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
                  border: '1.5px solid #fed7aa', borderRadius: 10,
                  padding: '10px 16px', marginBottom: 14,
                }}>
                  <span style={{ fontSize: 31, lineHeight: 1 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#9a3412', marginBottom: 2 }}>
                      {th ? 'ไฟล์โปรแกรมทัวร์' : 'Tour Program PDF'}
                    </div>
                    <div style={{ fontSize: 14, color: '#c2410c' }}>
                      {th ? 'ดาวน์โหลดรายละเอียดโปรแกรมฉบับเต็ม' : 'Download the full tour program details'}
                    </div>
                  </div>
                  <a href={tour.pdfUrl} download target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button className="td-btn" style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)', color: '#fff', padding: '8px 16px', fontSize: 15 }}>
                      <Icon name="download" size={14} />
                      {th ? 'ดาวน์โหลด' : 'Download'}
                    </button>
                  </a>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="tel:0618686889" style={{ textDecoration: 'none' }}>
                  <button className="td-btn" style={{ background: 'linear-gradient(135deg,#0f3460,#1e4a7a)', color: '#fff' }}>
                    <Icon name="phone" size={15} />
                    {th ? 'โทรจอง' : 'Call to Book'}
                  </button>
                </a>
                <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="td-btn" style={{ background: 'linear-gradient(135deg,#06c755,#04a845)', color: '#fff' }}>
                    <Icon name="line" size={15} />
                    {th ? 'จองไลน์' : 'LINE'}
                  </button>
                </a>
                {tour.pdfUrl && (
                  <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="td-btn" style={{ background: 'linear-gradient(135deg,#e65c00,#c74b00)', color: '#fff' }}>
                      <Icon name="file-text" size={15} />
                      {th ? 'ดูโปรแกรมทั้งวัน' : 'Full Program'}
                    </button>
                  </a>
                )}
                <button className={`td-save${saved ? ' active' : ''}`} onClick={() => setSaved(!saved)}>
                  <Icon name={saved ? 'bookmark-fill' : 'bookmark'} size={14} />
                  {saved ? (th ? 'บันทึกแล้ว ✓' : 'Saved ✓') : (th ? 'กาวตรา' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card: Departure & Price Table ───────────────────── */}
        {tour.departures?.length > 0 && (
          <div className="td-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              background: 'linear-gradient(135deg,#0f3460,#1e4a7a)',
              padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 21 }}>📅</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '.01em' }}>
                {th ? 'วันเดินทางและราคา' : 'Departure Dates & Prices'}
              </h2>
              <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginLeft: 'auto' }}>
                {tour.departures.length} {th ? 'รอบ' : 'dates'}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="td-table">
                <thead>
                  <tr>
                    <th>{th ? 'วันเดินทางไป-กลับ' : 'Travel Dates'}</th>
                    <th>{th ? 'ผู้ใหญ่ (฿)' : 'Adult (฿)'}</th>
                    <th>{th ? 'เด็กเดี่ยว (฿)' : 'Child (฿)'}</th>
                    <th>{th ? 'เด็กทารก (฿)' : 'Infant (฿)'}</th>
                    <th>{th ? 'พักเดี่ยว (฿)' : 'Single Supp.'}</th>
                    <th>{th ? 'จอยแลนด์' : 'Joyland'}</th>
                    <th>Group Size</th>
                    <th>{th ? 'รับได้' : 'Avail.'}</th>
                    <th>{th ? 'สถานะ' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.departures.map((dep, i) => {
                    const st     = depStatus(dep);
                    const adultP = dep.price || basePrice;
                    const childP = dep.childPrice || null;
                    const infantP = dep.infantPrice || null;
                    const singleP = dep.singleSupplement || null;
                    const promoP = dep.promoPrice > 0 && dep.promoPrice < adultP ? dep.promoPrice : null;
                    const total  = dep.totalSeats || tour.groupSize || '-';
                    const avail  = dep.totalSeats ? Math.max(0, dep.totalSeats - (dep.bookedSeats || 0)) : (dep.available ?? total);
                    const fmt    = (n) => n ? n.toLocaleString() : '-';
                    return (
                      <tr key={dep.id || i}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f3460', fontSize: 16 }}>
                            {formatDepRange(dep.date, dep.returnDate)}
                          </div>
                        </td>
                        <td>
                          {promoP ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: 15, textDecoration: 'line-through' }}>{fmt(adultP)}</span>
                              <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 17 }}>{fmt(promoP)}</span>
                            </div>
                          ) : (
                            <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 17 }}>{fmt(adultP)}</span>
                          )}
                        </td>
                        <td style={{ color: '#475569' }}>{fmt(childP)}</td>
                        <td style={{ color: '#475569' }}>{fmt(infantP)}</td>
                        <td style={{ color: '#475569' }}>{singleP ? `+${fmt(singleP)}` : '-'}</td>
                        <td style={{ color: '#475569' }}>{dep.joinPrice ? fmt(dep.joinPrice) : '-'}</td>
                        <td>
                          {total !== '-'
                            ? <span style={{ fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 10px', borderRadius: 20, fontSize: 15 }}>{total}</span>
                            : '-'}
                        </td>
                        <td>
                          {typeof avail === 'number'
                            ? <span style={{ fontWeight: 700, color: avail <= 5 ? '#dc2626' : '#16a34a' }}>{avail}</span>
                            : avail}
                        </td>
                        <td>
                          {st === 'full'
                            ? <span className="td-full">🔴 {th ? 'ปิดรับ' : 'Full'}</span>
                            : st === 'hurry'
                            ? <span className="td-hurry" onClick={() => navigate('join-tour', null, {
                                code: tour.code || '', name: th ? (tour.name?.th || tour.name?.en || '') : (tour.name?.en || tour.name?.th || ''),
                                date: dep.date || '', returnDate: dep.returnDate || '', price: dep.price || '',
                              })}>⚡ {th ? 'จองด่วน!' : 'Book fast!'}</span>
                            : <span className="td-open" onClick={() => navigate('join-tour', null, {
                                code: tour.code || '', name: th ? (tour.name?.th || tour.name?.en || '') : (tour.name?.en || tour.name?.th || ''),
                                date: dep.date || '', returnDate: dep.returnDate || '', price: dep.price || '',
                              })}>✓ {th ? 'จองด่วน' : 'Book now'}</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer note */}
            <div style={{ padding: '10px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: 14.5, color: '#94a3b8', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span>💡 {th ? 'ราคาต่อท่าน รวม VAT แล้ว' : 'Price per person, VAT included'}</span>
              {isPb && tour.departures?.[0]?.deposit > 0 && (
                <span>💳 {th ? `มัดจำ: ${tour.departures[0].deposit.toLocaleString()} บาท/ท่าน` : `Deposit: ฿${tour.departures[0].deposit.toLocaleString()}/pax`}</span>
              )}
              <span>📞 {th ? 'โทรจอง: 061-868-6889' : 'Book: 061-868-6889'}</span>
            </div>
          </div>
        )}

        {/* ── Accordions ──────────────────────────────────────── */}
        <div style={{ marginBottom: 4 }}>

          {/* Program detail */}
          {(tour.itinerary?.length > 0 || tour.includes?.length > 0 || tour.excludes?.length > 0) && (
            <Accordion title={th ? 'รายละเอียดโปรแกรม' : 'Program Details'} icon="📋" badge={tour.itinerary?.length ? `${tour.itinerary.length} วัน` : null}>
              {/* Timeline */}
              {tour.itinerary?.length > 0 && (
                <div style={{ position: 'relative', paddingLeft: 40, marginBottom: tour.includes?.length ? 24 : 0 }}>
                  <div style={{ position: 'absolute', left: 14, top: 4, bottom: 4, width: 2, background: 'linear-gradient(to bottom,#0f3460,#e2e8f0)', borderRadius: 2 }} />
                  {tour.itinerary.map((day, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: 20 }}>
                      <div style={{
                        position: 'absolute', left: -40, top: 0,
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#0f3460,#1e4a7a)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, boxShadow: '0 2px 8px rgba(15,52,96,.3)',
                      }}>
                        D{day.day || idx + 1}
                      </div>
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          {tv(day.title)}
                        </div>
                        {day.description && (
                          <div style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65 }}>
                            {tv(day.description)}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: day.description ? 8 : 0, flexWrap: 'wrap' }}>
                          {(day.meals || []).map(m => (
                            <span key={m} style={{ fontSize: 14, background: '#fff', color: '#16a34a', padding: '2px 9px', borderRadius: 20, border: '1px solid #bbf7d0', fontWeight: 600 }}>
                              {(m === 'เช้า' || m === 'breakfast') ? '☕ เช้า' : (m === 'กลางวัน' || m === 'lunch') ? '🍱 กลางวัน' : '🍽️ เย็น'}
                            </span>
                          ))}
                          {day.hotel && (
                            <span style={{ fontSize: 14, background: '#fff', color: '#0369a1', padding: '2px 9px', borderRadius: 20, border: '1px solid #bae6fd', fontWeight: 600 }}>
                              🏨 {day.hotel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Includes / Excludes */}
              {(tour.includes?.length > 0 || tour.excludes?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {tour.includes?.length > 0 && (
                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px 16px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#16a34a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✅ {th ? 'รวมในราคา' : 'Included'}
                      </div>
                      {tour.includes.map((item, i) => (
                        <div key={i} style={{ fontSize: 15.5, color: '#374151', padding: '3px 0', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                          <span style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }}>•</span> {tv(item)}
                        </div>
                      ))}
                    </div>
                  )}
                  {tour.excludes?.length > 0 && (
                    <div style={{ background: '#fff7f7', borderRadius: 10, padding: '14px 16px', border: '1px solid #fecaca' }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#dc2626', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ❌ {th ? 'ไม่รวมในราคา' : 'Not included'}
                      </div>
                      {tour.excludes.map((item, i) => (
                        <div key={i} style={{ fontSize: 15.5, color: '#374151', padding: '3px 0', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                          <span style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }}>•</span> {tv(item)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Accordion>
          )}

          {/* PDF */}
          {tour.pdfUrl && (
            <Accordion title={th ? 'ไฟล์โปรแกรมทัวร์ (PDF)' : 'Tour Program PDF'} icon="📄">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="td-btn" style={{ background: 'linear-gradient(135deg,#0f3460,#1e4a7a)', color: '#fff' }}>
                    <Icon name="download" size={14} />
                    {th ? 'ดาวน์โหลด PDF' : 'Download PDF'}
                  </button>
                </a>
                <span style={{ fontSize: 15, color: '#94a3b8' }}>{th ? 'รายละเอียดโปรแกรมทัวร์ฉบับเต็ม' : 'Full tour program details'}</span>
              </div>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', height: 520 }}>
                <iframe src={tour.pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Tour PDF" />
              </div>
            </Accordion>
          )}

          {/* Reviews */}
          {tourReviews.length > 0 && (
            <Accordion title={th ? 'รีวิวจากนักท่องเที่ยว' : 'Traveler Reviews'} icon="⭐" badge={`${tourReviews.length}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tourReviews.map(r => (
                  <div key={r.id} style={{ padding: '14px 18px', background: '#fafafa', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0f3460,#1e4a7a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                        {(r.name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 16 }}>{r.name}</span>
                          <Stars value={r.rating} />
                          <span style={{ fontSize: 14, color: '#94a3b8' }}>{r.date}</span>
                        </div>
                        <p style={{ margin: '7px 0 0', fontSize: 16, color: '#475569', lineHeight: 1.65 }}>
                          {tv(r.text)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {/* Write review */}
          <Accordion title={th ? 'เขียนรีวิว' : 'Write a Review'} icon="✍️">
            {reviewSent ? (
              <div style={{ padding: '14px 18px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', color: '#16a34a', fontWeight: 700, fontSize: 16 }}>
                ✅ {th ? 'ขอบคุณ! รีวิวของคุณรอการอนุมัติ' : 'Thank you! Your review is pending approval.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 15, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>{th ? 'ชื่อ *' : 'Name *'}</label>
                    <input style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                      value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 15, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Email</label>
                    <input style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                      value={reviewForm.email} onChange={e => setReviewForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>Rating:</span>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: s <= reviewForm.rating ? '#f59e0b' : '#e2e8f0', padding: 2, transition: 'color .15s' }}>
                      <Icon name="star" size={22} />
                    </button>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 15, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>{th ? 'ความคิดเห็น *' : 'Review *'}</label>
                  <textarea rows={4} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 16, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    placeholder={th ? 'แชร์ประสบการณ์การเดินทางของคุณ...' : 'Share your travel experience…'}
                    value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))} />
                </div>
                <button onClick={submitReview}
                  style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg,#0f3460,#1e4a7a)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
                  {th ? '✈️ ส่งรีวิว' : '✈️ Submit Review'}
                </button>
              </div>
            )}
          </Accordion>
        </div>

        {/* ── Related tours ────────────────────────────────────── */}
        {tours.filter(tr => tr.id !== tour.id).length > 0 && (
          <div className="td-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 23 }}>🗺️</span>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}>
                {th ? 'ทัวร์ที่น่าสนใจอื่นๆ' : 'You may also like'}
              </h2>
            </div>
            <div className="grid-cols-4" style={{ gap: 14 }}>
              {tours.filter(tr => tr.id !== tour.id).slice(0, 4).map(tr => (
                <TourCard key={tr.id} tour={tr} t={t} navigate={navigate}
                  inCompare={compareList?.includes(tr.id)}
                  onCompare={() => toggleCompare?.(tr.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && tour.gallery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLightbox(null)}>
          <img src={tour.gallery[lightbox]} alt="" style={{ maxHeight: '86vh', maxWidth: '90vw', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,.5)' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={18} />
          </button>
        </div>
      )}
    </main>
  );
}

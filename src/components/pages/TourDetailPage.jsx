import { useState } from 'react';
import TourCard from '../TourCard.jsx';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-left':     return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-up-right': return <svg {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>;
    case 'map-pin':        return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'clock':          return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'users':          return <svg {...p}><circle cx="9" cy="9" r="3.5"/><path d="M2 20c.8-3.5 3.8-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 13c3 0 5 1.6 5.5 4"/></svg>;
    case 'plane':          return <svg {...p}><path d="M3 13.5 21 6l-6 16-3-7-7-2z"/></svg>;
    case 'calendar':       return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'check':          return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'close':          return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'star':           return <svg {...p} fill="currentColor" stroke="none"><path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.5l1.3-6.8-5-4.7 6.8-.8z"/></svg>;
    case 'download':       return <svg {...p}><path d="M12 3v13M7 11l5 5 5-5M3 20h18"/></svg>;
    case 'bed':            return <svg {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 11a2 2 0 0 1 4 0"/></svg>;
    case 'camera':         return <svg {...p}><path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'bookmark':       return <svg {...p}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'minus':          return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'plus':           return <svg {...p}><path d="M5 12h14M12 5v14"/></svg>;
    default: return null;
  }
}

function Stars({ value = 5, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--accent)' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.5l1.3-6.8-5-4.7 6.8-.8z"/>
        </svg>
      ))}
    </span>
  );
}

export default function TourDetailPage({ lang, t, navigate, tours, reviews, setBookings, setReviews, tourId, compareList, toggleCompare }) {
  const tour = tours.find(tr => tr.id === tourId);
  const [activeTab, setActiveTab]     = useState('itinerary');
  const [selectedTier, setSelectedTier] = useState(tour?.priceTiers?.[0]?.tier || 'Standard');
  const [selectedDep, setSelectedDep]   = useState(null);
  const [lightbox, setLightbox]         = useState(null);
  const [reviewForm, setReviewForm]     = useState({ name: '', email: '', rating: 5, text: '', tier: 'Standard' });
  const [reviewSent, setReviewSent]     = useState(false);
  const [bookingForm, setBookingForm]   = useState({ name: '', email: '', phone: '', travelers: 1 });
  const [bookingDone, setBookingDone]   = useState(false);

  if (!tour) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--muted)' }}>
        {t ? t({ th: 'ไม่พบทัวร์', en: 'Tour not found' }) : 'Tour not found'}
      </div>
    );
  }

  const tourReviews = reviews.filter(r => r.tourId === tour.id && r.approved);
  const tier = tour.priceTiers?.find(p => p.tier === selectedTier) || tour.priceTiers?.[0];
  const basePrice = tier?.price || tour.price || 0;

  const submitBooking = () => {
    if (!bookingForm.name || !selectedDep) return;
    setBookings(prev => [...prev, {
      id: Date.now(), ...bookingForm,
      tourId: tour.id, tier: selectedTier,
      departureId: selectedDep,
      totalPrice: basePrice * bookingForm.travelers,
      status: 'pending', date: new Date().toISOString().split('T')[0]
    }]);
    setBookingDone(true);
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

  const tabs = [
    { key: 'itinerary', th: 'กำหนดการ', en: 'Itinerary' },
    { key: 'hotels',    th: 'ที่พัก',    en: 'Hotels' },
    { key: 'flights',   th: 'เที่ยวบิน', en: 'Flights' },
    { key: 'includes',  th: 'รวม/ไม่รวม',en: 'Included' },
    { key: 'gallery',   th: 'ภาพ',       en: 'Gallery' },
    { key: 'reviews',   th: 'รีวิว',     en: 'Reviews' },
  ];

  const tourName = t ? t(tour.name) : (tour.name?.en || tour.name?.th || '');
  const tourDest = t ? t(tour.destination) : (tour.destination?.en || tour.destination?.th || '');
  const airline  = tour.flight?.outbound?.airline || tour.airline || '';

  return (
    <main className="page-enter">
      {/* Hero */}
      <section style={{ position: 'relative', height: '70vh', minHeight: 520, overflow: 'hidden' }}>
        <img
          src={tour.image}
          alt={tourName}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,31,26,.55) 0%, rgba(10,31,26,.2) 30%, rgba(10,31,26,.85) 100%)',
        }} />
        <div className="wrap-wide" style={{
          position: 'relative', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 32px 200px', color: 'var(--canvas)',
        }}>
          <nav style={{ fontSize: 12, opacity: .8, display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 12 }}>
              {t ? t({ th: 'หน้าหลัก', en: 'Home' }) : 'Home'}
            </button>
            <span>/</span>
            <button onClick={() => navigate('tours')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 12 }}>
              {t ? t({ th: 'ทัวร์', en: 'Tours' }) : 'Tours'}
            </button>
            <span>/</span>
            <span style={{ opacity: .9 }}>{tourName}</span>
          </nav>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {tour.continent && (
                <span className="chip" style={{ background: 'rgba(244,239,230,.18)', color: '#fff', borderColor: 'transparent', backdropFilter: 'blur(6px)' }}>
                  {tour.continent}
                </span>
              )}
              {tourDest && (
                <span className="chip" style={{ background: 'rgba(244,239,230,.18)', color: '#fff', borderColor: 'transparent', backdropFilter: 'blur(6px)' }}>
                  <Icon name="map-pin" size={11} /> {tourDest}
                </span>
              )}
              {tour.featured && (
                <span className="chip chip-accent">Featured</span>
              )}
            </div>
            <h1 className="h-display" style={{ color: 'var(--canvas)', maxWidth: 980 }}>{tourName}</h1>
            {tour.description && (
              <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 20, opacity: .9, marginTop: 12 }}>
                "{t ? t(tour.description) : (tour.description?.en || tour.description?.th || tour.description || '')}"
              </div>
            )}
            <div style={{ marginTop: 32, display: 'flex', gap: 32, fontSize: 14, flexWrap: 'wrap' }}>
              {tour.duration && <HeroStat label="Duration" v={`${tour.duration} days`} />}
              {tour.groupSize && <HeroStat label="Group" v={`max ${tour.groupSize}`} />}
              {airline && <HeroStat label="Airline" v={airline} />}
              {tour.departures?.length > 0 && <HeroStat label="Departures" v={`${tour.departures.length} dates`} />}
            </div>
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      <div className="wrap-wide" style={{ marginTop: -120, position: 'relative', zIndex: 5, paddingBottom: 80 }}>
        <div className="layout-tour" style={{ gap: 48, alignItems: 'start' }}>
          {/* Left: tabs */}
          <div style={{
            background: 'var(--card)', borderRadius: 'var(--r-xl)',
            border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}>
            {/* Tab strip */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '0 32px', gap: 0, overflowX: 'auto' }} className="scroll-x">
              {tabs.map(tb => (
                <button key={tb.key}
                  onClick={() => setActiveTab(tb.key)}
                  style={{
                    padding: '20px 4px',
                    background: 'transparent', border: 'none',
                    borderBottom: activeTab === tb.key ? '2px solid var(--ink)' : '2px solid transparent',
                    color: activeTab === tb.key ? 'var(--ink)' : 'var(--muted)',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', marginRight: 28, whiteSpace: 'nowrap',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                  }}>
                  <span>{lang === 'th' ? tb.th : tb.en}</span>
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)' }}>{lang === 'th' ? tb.en : tb.th}</span>
                </button>
              ))}
            </div>

            <div style={{ padding: 32 }}>
              {/* Itinerary */}
              {activeTab === 'itinerary' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                    <div>
                      <div className="eyebrow">Day-by-day</div>
                      <h2 className="h-2" style={{ marginTop: 8 }}>The shape of {tour.duration} days.</h2>
                    </div>
                    <button className="btn btn-light btn-sm">
                      <Icon name="bookmark" size={13} /> Save as PDF
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 18, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
                    {(tour.itinerary || []).map((day, idx) => (
                      <div key={day.day || idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16, padding: '18px 0', position: 'relative' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'var(--ink)', color: 'var(--canvas)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, position: 'relative', zIndex: 1,
                        }}>
                          D{day.day || idx + 1}
                        </div>
                        <div>
                          <h3 style={{ margin: '4px 0 6px', fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>
                            {t ? t(day.title) : (day.title?.en || day.title?.th || day.title || '')}
                          </h3>
                          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55, maxWidth: 640 }}>
                            {t ? t(day.description) : (day.description?.en || day.description?.th || day.description || '')}
                          </p>
                          {day.meals?.length > 0 && (
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                              {day.meals.map(m => (
                                <span key={m} style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--canvas-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  {m === 'breakfast' ? '☕' : m === 'lunch' ? '🍱' : '🍽️'}
                                  {t ? t({ th: m === 'breakfast' ? 'เช้า' : m === 'lunch' ? 'กลางวัน' : 'เย็น', en: m }) : m}
                                </span>
                              ))}
                            </div>
                          )}
                          {day.hotel && (
                            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="bed" size={11} /> {day.hotel}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {activeTab === 'hotels' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div className="eyebrow">Where you'll sleep</div>
                    <h2 className="h-2" style={{ marginTop: 8 }}>Hotels for every night.</h2>
                  </div>
                  <div className="layout-half" style={{ gap: 14 }}>
                    {(tour.hotels || []).map((h, i) => (
                      <div key={i} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {h.image && (
                          <img src={h.image} alt={h.name} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div className="eyebrow">{h.nights} {t ? t({ th: 'คืน', en: 'nights' }) : 'nights'}</div>
                            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{h.name}</div>
                          </div>
                          <div style={{ color: 'var(--accent)', display: 'flex', gap: 1 }}>
                            {Array.from({ length: h.stars || 4 }).map((_, i) => <Icon key={i} name="star" size={12} />)}
                          </div>
                        </div>
                        {h.amenities && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {h.amenities.map(a => (
                              <span key={a} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'var(--canvas-2)', color: 'var(--ink-2)' }}>{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights */}
              {activeTab === 'flights' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div className="eyebrow">Flight schedule</div>
                    <h2 className="h-2" style={{ marginTop: 8 }}>Round-trip{airline ? ` on ${airline}` : ''}.</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: t ? t({ th: 'ขาไป', en: 'Outbound' }) : 'Outbound', flight: tour.flight?.outbound },
                      { label: t ? t({ th: 'ขากลับ', en: 'Return' }) : 'Return',   flight: tour.flight?.return },
                    ].filter(x => x.flight).map(({ label, flight }) => (
                      <div key={label} className="scroll-x" style={{
                        padding: '20px 24px',
                        background: 'var(--card)', border: '1px solid var(--line)',
                        borderRadius: 'var(--r-md)',
                      }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr 1.4fr', gap: 24, alignItems: 'center', minWidth: 460 }}>
                        <div>
                          <div className="tabular" style={{ fontSize: 20, fontWeight: 600 }}>{flight.from}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{flight.departure}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <Icon name="plane" size={14} />
                        </div>
                        <div>
                          <div className="tabular" style={{ fontSize: 20, fontWeight: 600 }}>{flight.to}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{flight.arrival}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{flight.airline}</div>
                          {flight.baggage && <div style={{ fontSize: 11, color: 'var(--muted)' }}>🧳 {flight.baggage}</div>}
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
                        </div>
                      </div>{/* end inner grid */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Included / Not included */}
              {activeTab === 'includes' && (
                <div className="layout-half" style={{ gap: 24 }}>
                  <div style={{ padding: 28, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={14} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                        {t ? t({ th: 'รวมในราคา', en: "What's included" }) : "What's included"}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(tour.includes || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5 }}>
                          <Icon name="check" size={14} stroke={2} />
                          <span>{t ? t(item) : (item?.en || item?.th || item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 28, background: 'var(--canvas-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--canvas)', border: '1px solid var(--line)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="close" size={14} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                        {t ? t({ th: 'ไม่รวมในราคา', en: 'Not included' }) : 'Not included'}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(tour.excludes || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                          <Icon name="close" size={14} stroke={2} />
                          <span>{t ? t(item) : (item?.en || item?.th || item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery */}
              {activeTab === 'gallery' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div className="eyebrow">Photos from past departures</div>
                    <h2 className="h-2" style={{ marginTop: 8 }}>What you'll see, more or less.</h2>
                  </div>
                  <div className="grid-cols-3" style={{ gap: 8 }}>
                    {(tour.gallery || []).map((src, i) => (
                      <button key={i} onClick={() => setLightbox(i)}
                        style={{ aspectRatio: '4/3', borderRadius: 'var(--r-md)', overflow: 'hidden', border: 'none', padding: 0, cursor: 'zoom-in' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                    <div>
                      <div className="eyebrow">Traveler reviews</div>
                      <h2 className="h-2" style={{ marginTop: 8 }}>
                        {tourReviews.length} {t ? t({ th: 'รีวิว', en: 'reviews' }) : 'reviews'}
                      </h2>
                    </div>
                  </div>
                  {tourReviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                      {tourReviews.map(r => (
                        <div key={r.id} style={{
                          padding: 24, background: 'var(--card)',
                          border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
                        }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--canvas-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                              {(r.name || '?')[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                                <Stars value={r.rating} size={12} />
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.date}</div>
                              <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                                "{t ? t(r.text) : (r.text?.th || r.text?.en || r.text || '')}"
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
                      {t ? t({ th: 'ยังไม่มีรีวิว', en: 'No reviews yet.' }) : 'No reviews yet.'}
                    </p>
                  )}

                  {/* Review form */}
                  <div style={{ paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                    <div className="eyebrow" style={{ marginBottom: 12 }}>
                      {t ? t({ th: 'เขียนรีวิว', en: 'Write a Review' }) : 'Write a Review'}
                    </div>
                    {reviewSent ? (
                      <div style={{ padding: 16, background: 'var(--primary)', color: '#fff', borderRadius: 'var(--r-md)', fontSize: 13 }}>
                        ✓ {t ? t({ th: 'ขอบคุณ! รอการอนุมัติ', en: 'Thank you! Review pending approval.' }) : 'Thank you! Pending approval.'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="layout-half" style={{ gap: 10 }}>
                          <input placeholder={t ? t({ th: 'ชื่อ', en: 'Name' }) : 'Name'} value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} />
                          <input placeholder="Email" value={reviewForm.email} onChange={e => setReviewForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Rating:</span>
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: s <= reviewForm.rating ? 'var(--accent)' : 'var(--line)', padding: 2 }}>
                              <Icon name="star" size={20} />
                            </button>
                          ))}
                        </div>
                        <textarea rows={4} placeholder={t ? t({ th: 'เขียนรีวิว...', en: 'Write your review…' }) : 'Write your review…'}
                          value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                          style={{ resize: 'vertical' }} />
                        <button onClick={submitReview} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                          {t ? t({ th: 'ส่งรีวิว', en: 'Submit Review' }) : 'Submit'} <Icon name="arrow-right" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sticky-aside" style={{
            top: 120,
            background: 'var(--card)', borderRadius: 'var(--r-xl)',
            border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}>
            {/* Price header */}
            <div style={{ padding: '22px 28px', background: 'var(--ink)', color: 'var(--canvas)' }}>
              <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>Starting from</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                <span className="tabular" style={{ fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1 }}>
                  ฿{basePrice.toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 11, opacity: .7, marginTop: 4 }}>per traveler · 25% deposit · balance 60 days before departure</div>
            </div>

            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Price tiers */}
              {tour.priceTiers && tour.priceTiers.length > 0 && (
                <div>
                  <label>{t ? t({ th: 'ประเภทห้อง', en: 'Room tier' }) : 'Room tier'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {tour.priceTiers.map(pt => (
                      <label key={pt.tier} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px',
                        border: `1px solid ${selectedTier === pt.tier ? 'var(--ink)' : 'var(--line)'}`,
                        background: selectedTier === pt.tier ? 'var(--canvas-2)' : 'transparent',
                        borderRadius: 'var(--r-md)', cursor: 'pointer',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="radio" name="tier" checked={selectedTier === pt.tier} onChange={() => setSelectedTier(pt.tier)} style={{ accentColor: 'var(--ink)' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{pt.tier}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t ? t(pt.description) : (pt.description?.en || pt.description?.th || pt.description || '')}</div>
                          </div>
                        </div>
                        <div className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>฿{pt.price?.toLocaleString()}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Departure dates */}
              {tour.departures?.length > 0 && (
                <div>
                  <label>{t ? t({ th: 'วันเดินทาง', en: 'Departure date' }) : 'Departure date'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {tour.departures.map(dep => {
                      const full = dep.bookedSeats >= dep.totalSeats;
                      const seats = dep.totalSeats - dep.bookedSeats;
                      return (
                        <button key={dep.id} onClick={() => !full && setSelectedDep(dep.id)}
                          disabled={full}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px',
                            border: `1px solid ${selectedDep === dep.id ? 'var(--ink)' : 'var(--line)'}`,
                            background: selectedDep === dep.id ? 'var(--ink)' : full ? 'var(--canvas-2)' : 'transparent',
                            color: selectedDep === dep.id ? 'var(--canvas)' : full ? 'var(--muted)' : 'var(--ink)',
                            borderRadius: 'var(--r-md)', cursor: full ? 'not-allowed' : 'pointer',
                            fontSize: 13, fontWeight: 500,
                          }}>
                          <span>{dep.date}</span>
                          <span style={{ fontSize: 11, opacity: .7 }} className="tabular">
                            {full ? 'Full' : `${seats} seats`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Travelers */}
              <div>
                <label>{t ? t({ th: 'จำนวนผู้เดินทาง', en: 'Travelers' }) : 'Travelers'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
                  <button onClick={() => setBookingForm(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="minus" size={12} />
                  </button>
                  <div className="tabular" style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{bookingForm.travelers}</div>
                  <button onClick={() => setBookingForm(p => ({ ...p, travelers: Math.min(8, p.travelers + 1) }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={12} />
                  </button>
                </div>
              </div>

              {/* Booking form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input placeholder={t ? t({ th: 'ชื่อ-นามสกุล', en: 'Full name' }) : 'Full name'} value={bookingForm.name} onChange={e => setBookingForm(p => ({ ...p, name: e.target.value }))} />
                <input type="email" placeholder="Email" value={bookingForm.email} onChange={e => setBookingForm(p => ({ ...p, email: e.target.value }))} />
                <input type="tel" placeholder={t ? t({ th: 'เบอร์โทร', en: 'Phone' }) : 'Phone'} value={bookingForm.phone} onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))} />
              </div>

              {/* Total */}
              <div style={{ padding: 16, background: 'var(--canvas-2)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <PriceRow label={`${t ? t({ th: 'ยอดรวม', en: 'Subtotal' }) : 'Subtotal'} · ${bookingForm.travelers} ×`} value={`฿${(basePrice * bookingForm.travelers).toLocaleString()}`} />
                <PriceRow label={t ? t({ th: 'มัดจำ 25%', en: 'Deposit 25%' }) : 'Deposit 25%'} value={`฿${Math.round(basePrice * bookingForm.travelers * 0.25).toLocaleString()}`} />
                <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
                <PriceRow label={t ? t({ th: 'รวมทั้งหมด', en: 'Total' }) : 'Total'} value={`฿${(basePrice * bookingForm.travelers).toLocaleString()}`} big />
              </div>

              {/* Book button */}
              {bookingDone ? (
                <div style={{ padding: 16, background: 'var(--primary)', color: '#fff', borderRadius: 'var(--r-md)', fontSize: 13, lineHeight: 1.5, textAlign: 'center' }}>
                  <div style={{ fontWeight: 600 }}>Reserved for 48 hours.</div>
                  <div style={{ opacity: .85, marginTop: 4 }}>We've emailed {bookingForm.email || 'you'} the details.</div>
                </div>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={!bookingForm.name}
                  className="btn btn-accent btn-lg"
                  style={{ width: '100%', justifyContent: 'center', opacity: !bookingForm.name ? .5 : 1 }}
                >
                  {t ? t({ th: 'จองทันที', en: 'Reserve this seat' }) : 'Reserve this seat'} <Icon name="arrow-right" size={14} />
                </button>
              )}
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: -4 }}>
                No charge yet · holds for 48h · cancel anytime
              </div>

              {/* PDF download */}
              {tour.pdfUrl && (
                <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-light"
                  style={{ width: '100%', justifyContent: 'center' }}>
                  <Icon name="download" size={14} /> {t ? t(tour.pdfLabel) : 'Download PDF'}
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related tours */}
      {tours.filter(tr => tr.id !== tour.id).length > 0 && (
        <section className="section">
          <div className="wrap-wide">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <h2 className="h-2">If you like this, you'll like…</h2>
            </div>
            <div className="grid-cols-4" style={{ gap: 16 }}>
              {tours.filter(tr => tr.id !== tour.id).slice(0, 4).map(tr => (
                <TourCard key={tr.id} tour={tr} t={t} navigate={navigate}
                  inCompare={compareList?.includes(tr.id)}
                  onCompare={() => toggleCompare?.(tr.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLightbox(null)}>
          <img src={tour.gallery[lightbox]} alt="" style={{ maxHeight: '85vh', maxWidth: '90vw', borderRadius: 'var(--r-lg)' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={18} />
          </button>
          <button onClick={() => setLightbox((lightbox - 1 + tour.gallery.length) % tour.gallery.length)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow-left" size={18} />
          </button>
          <button onClick={() => setLightbox((lightbox + 1) % tour.gallery.length)}
            style={{ position: 'absolute', right: 72, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      )}
    </main>
  );
}

function HeroStat({ label, v }) {
  return (
    <div>
      <div style={{ fontSize: 11, opacity: .6, letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 600, marginTop: 4 }}>{v}</div>
    </div>
  );
}

function PriceRow({ label, value, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: big ? 18 : 13, fontWeight: big ? 600 : 500 }}>
      <span style={{ color: big ? 'var(--ink)' : 'var(--ink-2)' }}>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}

import { useState } from 'react';
import { Clock, Users, MapPin, Plane, Star, Download, Check, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export default function TourDetailPage({ lang, t, navigate, tours, reviews, setBookings, setReviews, tourId }) {
  const tour = tours.find(tr => tr.id === tourId);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedTier, setSelectedTier] = useState(tour?.priceTiers[0]?.tier || 'Standard');
  const [selectedDep, setSelectedDep] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, text: '', tier: 'Standard' });
  const [reviewSent, setReviewSent] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', travelers: 1 });
  const [bookingDone, setBookingDone] = useState(false);

  if (!tour) return <div className="p-10 text-center text-slate-400">Tour not found</div>;

  const tourReviews = reviews.filter(r => r.tourId === tour.id && r.approved);
  const tier = tour.priceTiers.find(p => p.tier === selectedTier) || tour.priceTiers[0];

  const submitBooking = () => {
    if (!bookingForm.name || !selectedDep) return;
    setBookings(prev => [...prev, {
      id: Date.now(), ...bookingForm,
      tourId: tour.id, tier: selectedTier,
      departureId: selectedDep, totalPrice: tier.price * bookingForm.travelers,
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
    { key: 'itinerary', label: t({ th: 'กำหนดการ', en: 'Itinerary' }) },
    { key: 'hotels', label: t({ th: 'ที่พัก', en: 'Hotels' }) },
    { key: 'flights', label: t({ th: 'เที่ยวบิน', en: 'Flights' }) },
    { key: 'includes', label: t({ th: 'รวม/ไม่รวม', en: 'Inc/Excl' }) },
    { key: 'gallery', label: t({ th: 'ภาพ', en: 'Gallery' }) },
    { key: 'reviews', label: t({ th: 'รีวิว', en: 'Reviews' }) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <button onClick={() => navigate('tours')} className="hover:text-teal-700">{t({ th: 'ทัวร์', en: 'Tours' })}</button>
        <span>/</span>
        <span className="text-slate-700">{t(tour.name)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden h-72 mb-6">
            <img src={tour.image} alt={t(tour.name)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm text-amber-400 font-medium mb-1">{tour.continent}</div>
              <h1 className="text-2xl font-bold">{t(tour.name)}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t(tour.destination)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration} {t({ th: 'วัน', en: 'days' })}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Max {tour.groupSize}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap mb-6 bg-white rounded-xl p-1 shadow-sm">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {tour.itinerary.map(day => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-teal-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {day.day}
                      </div>
                      {day.day < tour.itinerary.length && <div className="w-0.5 bg-slate-200 flex-1 mt-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <h4 className="font-semibold text-slate-800">{t(day.title)}</h4>
                      <p className="text-sm text-slate-500 mt-1">{t(day.description)}</p>
                      {day.meals.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {day.meals.map(m => (
                            <span key={m} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                              {m === 'breakfast' ? '🍳' : m === 'lunch' ? '🍱' : '🍽️'}
                              {t({ th: m === 'breakfast' ? 'เช้า' : m === 'lunch' ? 'กลางวัน' : 'เย็น', en: m })}
                            </span>
                          ))}
                        </div>
                      )}
                      {day.hotel && <div className="text-xs text-teal-600 mt-1">🏨 {day.hotel}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="space-y-4">
                {tour.hotels.map((h, i) => (
                  <div key={i} className="flex gap-4 border border-slate-100 rounded-xl p-4">
                    <img src={h.image} alt={h.name} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{h.name}</h4>
                        <span className="text-amber-400 text-sm">{'★'.repeat(h.stars)}</span>
                      </div>
                      <div className="text-xs text-slate-500">{h.nights} {t({ th: 'คืน', en: 'nights' })}</div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {h.amenities.map(a => (
                          <span key={a} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flights' && (
              <div className="space-y-4">
                {[
                  { label: t({ th: 'ขาไป', en: 'Outbound' }), flight: tour.flight.outbound },
                  { label: t({ th: 'ขากลับ', en: 'Return' }), flight: tour.flight.return },
                ].map(({ label, flight }) => (
                  <div key={label} className="border border-slate-100 rounded-xl p-4">
                    <div className="text-xs font-semibold text-teal-700 mb-2">{label}</div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{flight.airline}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-bold">{flight.from}</span> → <span className="font-bold">{flight.to}</span>
                      </div>
                      <div className="text-sm text-slate-500">{flight.departure} → {flight.arrival}</div>
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded">🧳 {flight.baggage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'includes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 text-green-700">✅ {t({ th: 'รวมในราคา', en: 'Included' })}</h4>
                  <ul className="space-y-2">
                    {tour.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {t(item)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 text-red-600">❌ {t({ th: 'ไม่รวมในราคา', en: 'Not Included' })}</h4>
                  <ul className="space-y-2">
                    {tour.excludes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <X className="w-4 h-4 text-red-400 shrink-0" /> {t(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tour.gallery.map((img, i) => (
                  <button key={i} onClick={() => setLightbox(i)} className="overflow-hidden rounded-xl aspect-video">
                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {tourReviews.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {tourReviews.map(r => (
                      <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                          <span className="text-xs text-slate-400 ml-2">{r.tier}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic mb-2">"{t(r.text)}"</p>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{r.name}</span><span>{r.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm mb-6">{t({ th: 'ยังไม่มีรีวิว', en: 'No reviews yet' })}</p>
                )}

                {/* Review form */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-slate-800 mb-4">{t({ th: 'เขียนรีวิว', en: 'Write a Review' })}</h4>
                  {reviewSent ? (
                    <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm">
                      ✅ {t({ th: 'ขอบคุณสำหรับรีวิวครับ รอการอนุมัติ', en: 'Thank you! Review pending approval.' })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={t({ th: 'ชื่อ', en: 'Name' })} value={reviewForm.name}
                          onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} />
                        <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Email" value={reviewForm.email}
                          onChange={e => setReviewForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{t({ th: 'คะแนน:', en: 'Rating:' })}</span>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                            <Star className={`w-6 h-6 ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none"
                        placeholder={t({ th: 'เขียนรีวิวของคุณ...', en: 'Write your review...' })}
                        value={reviewForm.text}
                        onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))} />
                      <button onClick={submitReview}
                        className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        {t({ th: 'ส่งรีวิว', en: 'Submit Review' })}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
            <div className="text-2xl font-bold text-teal-700 mb-1">฿{tier.price.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mb-4">{t({ th: 'ต่อคน', en: 'per person' })}</div>

            {/* Tier selector */}
            <div className="space-y-2 mb-4">
              {tour.priceTiers.map(p => (
                <button key={p.tier} onClick={() => setSelectedTier(p.tier)}
                  className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                    selectedTier === p.tier ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-teal-300'
                  }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-slate-700">{p.tier}</span>
                    <span className="font-bold text-teal-700">฿{p.price.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{t(p.description)}</div>
                </button>
              ))}
            </div>

            {/* Departure dates */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                {t({ th: 'เลือกวันเดินทาง', en: 'Select Departure' })}
              </div>
              {tour.departures.map(dep => {
                const pct = (dep.bookedSeats / dep.totalSeats) * 100;
                const full = dep.bookedSeats >= dep.totalSeats;
                const almostFull = pct >= 80;
                return (
                  <button key={dep.id} disabled={full}
                    onClick={() => setSelectedDep(dep.id)}
                    className={`w-full border rounded-xl px-3 py-2.5 mb-2 text-left transition-colors ${
                      full ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                        : selectedDep === dep.id ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />{dep.date}
                      </span>
                      <span className={`text-xs font-semibold ${full ? 'text-red-500' : almostFull ? 'text-amber-600' : 'text-green-600'}`}>
                        {full ? t({ th: 'เต็มแล้ว', en: 'Full' })
                         : almostFull ? t({ th: 'ใกล้เต็ม', en: 'Almost Full' })
                         : t({ th: 'ว่าง', en: 'Available' })}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${full ? 'bg-red-400' : almostFull ? 'bg-amber-400' : 'bg-teal-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {dep.totalSeats - dep.bookedSeats} {t({ th: 'ที่ว่าง', en: 'seats left' })}
                      {dep.priceModifier !== 0 && (
                        <span className={`ml-2 font-semibold ${dep.priceModifier > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {dep.priceModifier > 0 ? `+฿${dep.priceModifier.toLocaleString()}` : `-฿${Math.abs(dep.priceModifier).toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Booking form */}
            {bookingDone ? (
              <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm text-center">
                ✅ {t({ th: 'รับคำจองแล้ว! เราจะติดต่อกลับเร็วๆ นี้', en: 'Booking received! We will contact you shortly.' })}
              </div>
            ) : (
              <div className="space-y-2">
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={t({ th: 'ชื่อ-นามสกุล', en: 'Full Name' })}
                  value={bookingForm.name} onChange={e => setBookingForm(p => ({ ...p, name: e.target.value }))} />
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Email" value={bookingForm.email}
                  onChange={e => setBookingForm(p => ({ ...p, email: e.target.value }))} />
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={t({ th: 'เบอร์โทร', en: 'Phone' })}
                  value={bookingForm.phone} onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))} />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">{t({ th: 'จำนวน', en: 'Travelers' })}:</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBookingForm(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))}
                      className="w-8 h-8 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
                    <span className="w-8 text-center font-semibold">{bookingForm.travelers}</span>
                    <button onClick={() => setBookingForm(p => ({ ...p, travelers: p.travelers + 1 }))}
                      className="w-8 h-8 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
                  </div>
                </div>
                <div className="border-t pt-3 mt-1">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-500">{t({ th: 'รวมทั้งหมด', en: 'Total' })}</span>
                    <span className="font-bold text-teal-700 text-lg">฿{(tier.price * bookingForm.travelers).toLocaleString()}</span>
                  </div>
                  <button onClick={submitBooking}
                    disabled={!selectedDep || !bookingForm.name}
                    className="w-full bg-teal-700 hover:bg-teal-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors">
                    {t({ th: 'จองทันที', en: 'Book Now' })}
                  </button>
                </div>
              </div>
            )}

            {/* PDF download */}
            {tour.pdfUrl ? (
              <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 border border-teal-600 text-teal-700 hover:bg-teal-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> {t(tour.pdfLabel)}
              </a>
            ) : (
              <button disabled className="mt-3 w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-300 py-2.5 rounded-xl text-sm cursor-not-allowed">
                <Download className="w-4 h-4" /> {t({ th: 'ไม่มีไฟล์ PDF', en: 'No PDF available' })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={tour.gallery[lightbox]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setLightbox((lightbox - 1 + tour.gallery.length) % tour.gallery.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 rounded-full p-2">◀</button>
          <button onClick={() => setLightbox((lightbox + 1) % tour.gallery.length)}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-white bg-white/20 rounded-full p-2">▶</button>
        </div>
      )}
    </div>
  );
}

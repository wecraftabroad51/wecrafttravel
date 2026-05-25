import { ArrowRight, Shield, Users, Award, Headphones, Star, ChevronRight } from 'lucide-react';
import TourCard from '../TourCard.jsx';

export default function HomePage({ lang, t, navigate, tours, promotions, reviews, compareList, toggleCompare }) {
  const featured = tours.filter(tr => tr.featured).sort((a, b) => a.featuredOrder - b.featuredOrder);
  const approvedReviews = reviews.filter(r => r.approved);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative h-[600px] md:h-[680px] flex items-center justify-center text-white overflow-hidden">
        <img
          src="https://picsum.photos/seed/hero-travel/1600/700"
          alt="travel hero"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ transition: 'transform 8s ease' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(15,118,110,0.75) 0%, rgba(15,23,42,0.65) 60%, rgba(15,23,42,0.8) 100%)'
        }} />

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-white/10 hidden lg:block" />
        <div className="absolute top-32 right-32 w-40 h-40 rounded-full border border-white/10 hidden lg:block" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 backdrop-blur-sm text-amber-300 text-sm font-semibold px-5 py-2 rounded-full mb-6">
            ✈️ {lang === 'th' ? 'ประสบการณ์กว่า 15 ปี | ลูกค้ากว่า 50,000 คน' : '15+ Years Experience | 50,000+ Happy Customers'}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight tracking-tight">
            {lang === 'th' ? (
              <><span className="text-white">สำรวจโลก</span><br /><span className="text-amber-400">กับเรา</span></>
            ) : (
              <><span className="text-white">Explore</span><br /><span className="text-amber-400">The World</span></>
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {lang === 'th'
              ? 'ทัวร์คุณภาพสูง มัคคุเทศก์ภาษาไทย ราคาสมเหตุสมผล บริการครบวงจร'
              : 'Premium tours, Thai-speaking guides, fair prices & full service'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('tours')}
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 px-8 py-4 rounded-2xl font-bold text-base shadow-2xl shadow-amber-400/30 transition-all hover:scale-105"
            >
              {lang === 'th' ? 'ดูทัวร์ทั้งหมด' : 'View All Tours'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('contact')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105"
            >
              {lang === 'th' ? 'ปรึกษาฟรี' : 'Free Consultation'}
            </button>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────── */}
      <section className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '15+', label: lang === 'th' ? 'ปีประสบการณ์' : 'Years Experience', icon: '🏆' },
            { num: '50K+', label: lang === 'th' ? 'ลูกค้าพึงพอใจ' : 'Happy Customers', icon: '😊' },
            { num: '80+', label: lang === 'th' ? 'จุดหมายปลายทาง' : 'Destinations', icon: '🌍' },
            { num: '4.9★', label: lang === 'th' ? 'คะแนนเฉลี่ย' : 'Avg. Rating', icon: '⭐' },
          ].map(s => (
            <div key={s.num} className="text-center py-2">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl md:text-3xl font-extrabold text-teal-700">{s.num}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Tours ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-2">
              {lang === 'th' ? '✦ ทัวร์คัดสรร' : '✦ Handpicked Tours'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              {lang === 'th' ? 'ทัวร์แนะนำ' : 'Featured Tours'}
            </h2>
          </div>
          <button
            onClick={() => navigate('tours')}
            className="hidden md:flex items-center gap-1 text-teal-700 hover:text-teal-600 font-semibold text-sm transition-colors"
          >
            {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(tour => (
            <TourCard
              key={tour.id} tour={tour} t={t} navigate={navigate}
              inCompare={compareList.includes(tour.id)}
              onCompare={() => toggleCompare(tour.id)}
            />
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <button
            onClick={() => navigate('tours')}
            className="inline-flex items-center gap-2 border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-8 py-3 rounded-2xl font-semibold transition-all"
          >
            {lang === 'th' ? 'ดูทัวร์ทั้งหมด' : 'View All Tours'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-teal-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              {lang === 'th' ? '✦ ทำไมต้องเรา' : '✦ Why Us'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              {lang === 'th' ? 'ทำไมต้องเลือก Wanderlust?' : 'Why Choose Wanderlust?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: lang === 'th' ? 'ปลอดภัย 100%' : '100% Safe', desc: lang === 'th' ? 'ประกันการเดินทางครบวงจร ดูแลทุกขั้นตอน' : 'Full travel insurance, every step covered', color: 'from-teal-500/20 to-teal-600/10' },
              { icon: Users, title: lang === 'th' ? 'ไกด์ภาษาไทย' : 'Thai Guides', desc: lang === 'th' ? 'มัคคุเทศก์มืออาชีพดูแลตลอดทริป' : 'Professional Thai-speaking guides throughout', color: 'from-blue-500/20 to-blue-600/10' },
              { icon: Award, title: lang === 'th' ? 'คุณภาพพรีเมียม' : 'Premium Quality', desc: lang === 'th' ? 'โรงแรมและบริการระดับพรีเมียมคัดสรร' : 'Handpicked premium hotels & services', color: 'from-amber-500/20 to-amber-600/10' },
              { icon: Headphones, title: lang === 'th' ? 'ซัพพอร์ต 24/7' : '24/7 Support', desc: lang === 'th' ? 'ทีมงานพร้อมช่วยเหลือตลอด 24 ชม.' : 'Team ready to help around the clock', color: 'from-purple-500/20 to-purple-600/10' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`bg-gradient-to-br ${color} border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-colors`}>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotions ─────────────────────────────────── */}
      {promotions.filter(p => p.active).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
                {lang === 'th' ? '✦ ข้อเสนอพิเศษ' : '✦ Special Deals'}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                {lang === 'th' ? 'โปรโมชั่นพิเศษ' : 'Special Promotions'}
              </h2>
            </div>
            <button onClick={() => navigate('promotions')}
              className="hidden md:flex items-center gap-1 text-teal-700 hover:text-teal-600 font-semibold text-sm">
              {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.filter(p => p.active).map(promo => (
              <div
                key={promo.id}
                onClick={() => navigate('promotions')}
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <img src={promo.image} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-400 text-slate-900 text-lg font-black px-4 py-1.5 rounded-full shadow-lg">
                    -{promo.discount}%
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{t(promo.title)}</h3>
                  <p className="text-white/70 text-sm line-clamp-2">{t(promo.description)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Reviews ────────────────────────────────────── */}
      {approvedReviews.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-2">
                {lang === 'th' ? '✦ รีวิวจากลูกค้าจริง' : '✦ Real Customer Reviews'}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                {lang === 'th' ? 'เสียงจากลูกค้าของเรา' : 'What Our Customers Say'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {approvedReviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-5 italic">"{t(r.text)}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{r.name}</div>
                        <div className="text-xs text-slate-400">{r.tier}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {lang === 'th' ? 'พร้อมออกเดินทางแล้วหรือยัง? 🌍' : 'Ready to Explore the World? 🌍'}
            </h2>
            <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
              {lang === 'th'
                ? 'ปรึกษาผู้เชี่ยวชาญด้านการท่องเที่ยวของเราฟรี ไม่มีข้อผูกมัด'
                : 'Consult our travel experts for free, no commitment required.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('tours')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105 shadow-lg">
                {lang === 'th' ? 'ดูทัวร์ทั้งหมด' : 'View All Tours'}
              </button>
              <button onClick={() => navigate('contact')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all">
                {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

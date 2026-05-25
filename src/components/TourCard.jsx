import { Clock, Users, MapPin, BarChart2 } from 'lucide-react';

const CONTINENT_COLORS = {
  Asia:        'bg-teal-100 text-teal-700 border border-teal-200',
  Europe:      'bg-blue-100 text-blue-700 border border-blue-200',
  Africa:      'bg-amber-100 text-amber-700 border border-amber-200',
  Americas:    'bg-orange-100 text-orange-700 border border-orange-200',
  Oceania:     'bg-green-100 text-green-700 border border-green-200',
  'Middle East':'bg-purple-100 text-purple-700 border border-purple-200',
};

export default function TourCard({ tour, t, navigate, inCompare, onCompare }) {
  const availDep = tour.departures?.find(d => d.bookedSeats < d.totalSeats);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
      style={{ transform: 'translateY(0)', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => navigate('tour-detail', tour.id)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={tour.image}
          alt={t(tour.name)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${CONTINENT_COLORS[tour.continent] || 'bg-slate-100 text-slate-700'}`}>
            {tour.continent}
          </span>
          {!availDep && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white">
              {t({ th: 'เต็มแล้ว', en: 'Full' })}
            </span>
          )}
          {tour.featured && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400 text-slate-900">
              ⭐ {t({ th: 'แนะนำ', en: 'Featured' })}
            </span>
          )}
        </div>

        {/* Compare button */}
        <button
          onClick={e => { e.stopPropagation(); onCompare?.(); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            inCompare
              ? 'bg-amber-400 text-slate-900 scale-110'
              : 'bg-white/90 text-slate-600 hover:bg-amber-400 hover:text-slate-900'
          }`}
          title={t({ th: 'เปรียบเทียบ', en: 'Compare' })}
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Price - bottom left of image */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
            <div className="text-[10px] text-slate-400 leading-none">{t({ th: 'เริ่มต้น', en: 'From' })}</div>
            <div className="text-base font-bold text-teal-700 leading-tight">฿{tour.price.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
          <MapPin className="w-3 h-3 text-teal-500" />
          <span>{t(tour.destination)}</span>
        </div>

        <h3 className="font-bold text-slate-800 mb-1.5 text-base leading-snug line-clamp-2">
          {t(tour.name)}
        </h3>

        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
          {t(tour.description)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-50">
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-teal-600" />
            </div>
            {tour.duration} {t({ th: 'วัน', en: 'days' })}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-teal-600" />
            </div>
            {t({ th: 'สูงสุด', en: 'Max' })} {tour.groupSize}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="text-amber-500 text-[9px] font-bold">✈</span>
            </div>
            {tour.flight.outbound.airline.split(' ')[0]}
          </span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); navigate('tour-detail', tour.id); }}
          className="w-full bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {t({ th: 'ดูรายละเอียด →', en: 'View Details →' })}
        </button>
      </div>
    </div>
  );
}

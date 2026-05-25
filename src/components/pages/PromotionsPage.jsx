import { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

function Countdown({ endDate }) {
  const calc = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className="flex gap-2 mt-3">
      {[['d', 'วัน'], ['h', 'ชั่วโมง'], ['m', 'นาที'], ['s', 'วินาที']].map(([k, lbl]) => (
        <div key={k} className="bg-white/20 rounded-lg px-2 py-1 text-center min-w-[44px]">
          <div className="text-xl font-bold">{String(time[k]).padStart(2, '0')}</div>
          <div className="text-xs text-white/70">{lbl}</div>
        </div>
      ))}
    </div>
  );
}

export default function PromotionsPage({ lang, t, navigate, promotions, tours }) {
  const active = promotions.filter(p => p.active);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t({ th: 'โปรโมชั่นพิเศษ', en: 'Special Promotions' })}</h1>
        <p className="text-slate-500">{t({ th: 'อย่าพลาดข้อเสนอสุดพิเศษจาก Wanderlust Tours', en: "Don't miss our special offers" })}</p>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>{t({ th: 'ไม่มีโปรโมชั่นในขณะนี้', en: 'No active promotions' })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map(promo => {
            const tour = tours.find(tr => tr.id === promo.tourId);
            const discountedPrice = tour ? Math.round(tour.price * (1 - promo.discount / 100)) : 0;
            return (
              <div key={promo.id} className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl overflow-hidden text-white shadow-lg relative">
                <div className="relative">
                  <img src={promo.image} alt="" className="w-full h-40 object-cover opacity-30" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-400 text-slate-900 text-xl font-black px-4 py-1.5 rounded-full">
                      -{promo.discount}%
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{t(promo.title)}</h3>
                  <p className="text-teal-100 text-sm mb-3">{t(promo.description)}</p>

                  {tour && (
                    <div className="bg-white/10 rounded-xl p-3 mb-3">
                      <div className="text-xs text-teal-200">{t({ th: 'ทัวร์', en: 'Tour' })}</div>
                      <div className="font-semibold">{t(tour.name)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm line-through text-teal-300">฿{tour.price.toLocaleString()}</span>
                        <span className="text-lg font-bold text-amber-400">฿{discountedPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-teal-200 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {t({ th: 'โปรโมชั่นสิ้นสุด:', en: 'Ends:' })} {promo.endDate}
                  </div>

                  <Countdown endDate={promo.endDate} />

                  <button onClick={() => navigate('tour-detail', promo.tourId)}
                    className="mt-4 w-full bg-amber-400 hover:bg-amber-300 text-slate-900 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                    {t({ th: 'จองเลย', en: 'Book Now' })} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

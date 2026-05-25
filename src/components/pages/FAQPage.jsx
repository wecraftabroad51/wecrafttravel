import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = ['general', 'booking', 'flight', 'hotel', 'payment'];

export default function FAQPage({ lang, t, faqs }) {
  const [open, setOpen] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const catLabel = { general: lang === 'th' ? 'ทั่วไป' : 'General', booking: lang === 'th' ? 'การจอง' : 'Booking', flight: lang === 'th' ? 'เที่ยวบิน' : 'Flight', hotel: lang === 'th' ? 'ที่พัก' : 'Hotel', payment: lang === 'th' ? 'การชำระ' : 'Payment' };

  const filtered = faqs.filter(f => f.active && (activeCategory === 'all' || f.category === activeCategory));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">FAQ</h1>
        <p className="text-slate-500">{t({ th: 'คำถามที่พบบ่อย', en: 'Frequently Asked Questions' })}</p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mb-8">
        <button onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {t({ th: 'ทั้งหมด', en: 'All' })}
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === c ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {catLabel[c]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(faq => (
          <div key={faq.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
              onClick={() => setOpen(open === faq.id ? null : faq.id)}>
              <span className="font-semibold text-slate-800 text-sm">{t(faq.question)}</span>
              {open === faq.id ? <ChevronUp className="w-5 h-5 text-teal-700 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
            </button>
            {open === faq.id && (
              <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                <div className="pt-3">{t(faq.answer)}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-teal-50 rounded-2xl p-6 text-center">
        <p className="text-slate-700 font-semibold mb-2">{t({ th: 'ยังมีคำถาม?', en: 'Still have questions?' })}</p>
        <p className="text-slate-500 text-sm mb-4">{t({ th: 'ติดต่อทีมงานของเราได้เลย', en: 'Contact our team directly' })}</p>
        <a href="mailto:info@wanderlust-tours.com"
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {t({ th: 'ติดต่อเรา', en: 'Contact Us' })}
        </a>
      </div>
    </div>
  );
}

import { Globe, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer({ lang, t, navigate, settings }) {
  const { contact } = settings;

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-extrabold text-white text-lg">Wanderlust<span className="text-amber-400"> Tours</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 mb-6">
              {lang === 'th'
                ? 'บริษัทนำเที่ยวชั้นนำ ประสบการณ์กว่า 15 ปี ใส่ใจทุกรายละเอียด'
                : 'Leading tour company with 15+ years of experience.'}
            </p>
            {/* Social icons */}
            <div className="flex gap-2 flex-wrap">
              {settings.social.filter(s => s.enabled && s.url).map(s => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform shadow-md"
                  style={{ backgroundColor: s.color }}
                  title={s.platform}
                >
                  {s.platform === 'facebook' ? 'f'
                   : s.platform === 'instagram' ? 'ig'
                   : s.platform === 'youtube' ? '▶'
                   : s.platform === 'line' ? 'L'
                   : s.platform[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              {lang === 'th' ? 'เมนูหลัก' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { key: 'tours', th: 'ทัวร์ทั้งหมด', en: 'All Tours' },
                { key: 'promotions', th: 'โปรโมชั่น', en: 'Promotions' },
                { key: 'gallery', th: 'แกลเลอรี่', en: 'Gallery' },
                { key: 'articles', th: 'บทความ', en: 'Articles' },
                { key: 'faq', th: 'FAQ', en: 'FAQ' },
                { key: 'contact', th: 'ติดต่อเรา', en: 'Contact' },
              ].map(item => (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.key)}
                    className="text-sm hover:text-amber-400 transition-colors"
                  >
                    → {lang === 'th' ? item.th : item.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              {lang === 'th' ? 'ติดต่อเรา' : 'Contact'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span className="text-sm text-slate-500">{t(contact.address)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Opening hours / LINE */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              {lang === 'th' ? 'เวลาทำการ' : 'Hours'}
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex justify-between"><span>{lang === 'th' ? 'จ-ศ' : 'Mon-Fri'}</span><span className="text-slate-300">08:00 – 18:00</span></li>
              <li className="flex justify-between"><span>{lang === 'th' ? 'ส-อา' : 'Sat-Sun'}</span><span className="text-slate-300">09:00 – 17:00</span></li>
            </ul>
            <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">LINE Official</div>
              <div className="text-white font-bold">{contact.line}</div>
              <div className="text-xs text-teal-400 mt-1">✓ {lang === 'th' ? 'ตอบเร็วภายใน 1 ชม.' : 'Reply within 1 hour'}</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Wanderlust Tours. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for travelers
          </p>
        </div>
      </div>
    </footer>
  );
}

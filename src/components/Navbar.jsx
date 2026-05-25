import { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';

const navItems = [
  { key: 'home',       label: { th: 'หน้าหลัก',  en: 'Home' } },
  { key: 'tours',      label: { th: 'ทัวร์',      en: 'Tours' } },
  { key: 'promotions', label: { th: 'โปรโมชั่น',  en: 'Promotions' } },
  { key: 'gallery',    label: { th: 'แกลเลอรี่',  en: 'Gallery' } },
  { key: 'articles',   label: { th: 'บทความ',     en: 'Articles' } },
  { key: 'faq',        label: { th: 'FAQ',         en: 'FAQ' } },
  { key: 'contact',    label: { th: 'ติดต่อเรา',  en: 'Contact' } },
];

export default function Navbar({ lang, setLang, page, navigate, t, onAdminClick }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => navigate('home')} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center group-hover:bg-amber-300 transition-colors shadow-md">
            <Globe className="w-5 h-5 text-slate-900" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Wanderlust<span className="text-amber-400"> Tours</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === item.key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <button
            onClick={onAdminClick}
            className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            Admin
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 pb-5 pt-2">
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { navigate(item.key); setOpen(false); }}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  page === item.key
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => { setLang(lang === 'th' ? 'en' : 'th'); }}
              className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === 'th' ? 'Switch to EN' : 'Switch to TH'}
            </button>
            <button
              onClick={() => { onAdminClick(); setOpen(false); }}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Admin Panel
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

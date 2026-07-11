import { useState, useEffect } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate,
  useNavigate, useParams, useSearchParams, useLocation,
} from 'react-router-dom';
import {
  fetchTours, fetchArticles, fetchPromotions, fetchFaqs,
  fetchReviews, fetchBookings, fetchMessages, fetchChatSessions,
  fetchSettings
} from './lib/db.js';
import { supabase } from './lib/supabase.js';
import {
  TOURS_DATA, ARTICLES_DATA, PROMOTIONS_DATA, FAQS_DATA,
  REVIEWS_DATA, SITE_SETTINGS_DEFAULT, BOOKINGS_DATA, MESSAGES_DATA, CHAT_SESSIONS_DEFAULT,
} from './data.js';
import { LEGAL_DEFAULTS } from './lib/legalDefaults.js';
import { normalizePbTours, normalizeZegoTours, normalizeTtnTours } from './lib/supplierUtils.js';
import { ENABLED_SUPPLIERS } from './lib/suppliers.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import FloatingContact from './components/FloatingContact.jsx';
import CompareBar from './components/CompareBar.jsx';
import HomePage from './components/pages/HomePage.jsx';
import ToursPage from './components/pages/ToursPage.jsx';
import TourDetailPage from './components/pages/TourDetailPage.jsx';
import GalleryPage from './components/pages/GalleryPage.jsx';
import ArticlesPage from './components/pages/ArticlesPage.jsx';
import ArticleDetailPage from './components/pages/ArticleDetailPage.jsx';
import PromotionsPage from './components/pages/PromotionsPage.jsx';
import FAQPage from './components/pages/FAQPage.jsx';
import ContactPage from './components/pages/ContactPage.jsx';
import GroupQuotePage from './components/pages/GroupQuotePage.jsx';
import AboutPage from './components/pages/AboutPage.jsx';
import VisaPage from './components/pages/VisaPage.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import TicketBookingPage from './components/pages/TicketBookingPage.jsx';
import JoinTourPage from './components/pages/JoinTourPage.jsx';
import CarRentalPage from './components/pages/CarRentalPage.jsx';
import LegalPage from './components/pages/LegalPage.jsx';
import CardExplorePage from './components/pages/CardExplorePage.jsx';

const SETTINGS_DEFAULT = {
  contact: { address: { th: '', en: '' }, phone: '', email: '', line: '' },
  social: [],
  popup: { enabled: false },
  legal: LEGAL_DEFAULTS,
};

// ── Route wrappers that inject URL params ─────────────────────
function ToursRoute(props) {
  const [searchParams] = useSearchParams();
  const initialFilters = {
    tourType:  searchParams.get('type')      || '',
    continent: searchParams.get('continent') || '',
    country:   searchParams.get('country')   || '',
    search:    searchParams.get('q')         || '',
    countries:      searchParams.get('countries') ? searchParams.get('countries').split(',') : null,
    continentLabel: searchParams.get('label') || '',
  };
  // key เปลี่ยนเมื่อ filter เปลี่ยน → remount เพื่อ reset state
  return <ToursPage {...props} initialFilters={initialFilters} key={searchParams.toString()} />;
}

function TourDetailRoute(props) {
  const { id } = useParams();
  return <TourDetailPage {...props} tourId={id} />;
}

function ArticleDetailRoute(props) {
  const { id } = useParams();
  return <ArticleDetailPage {...props} articleId={id} />;
}

// ── Sticky Group Quote Float Button ───────────────────────────
function GroupQuoteFloat({ navigate, lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes gqFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes gqPing {
          0%   { transform: scale(1);   opacity: .8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .gq-float-btn {
          position: fixed;
          right: 24px;
          bottom: 100px;
          z-index: 900;
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #0f3460, #16213e);
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 13px 20px 13px 16px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 6px 28px rgba(15,52,96,.45), 0 2px 8px rgba(0,0,0,.2);
          transition: opacity .35s, transform .25s;
          animation: gqFloat 3s ease-in-out infinite;
          white-space: nowrap;
        }
        .gq-float-btn:hover {
          background: linear-gradient(135deg, #1a4a7a, #0f3460);
          box-shadow: 0 10px 36px rgba(15,52,96,.6);
        }
        .gq-float-btn .gq-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #2db04b, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0; position: relative;
        }
        .gq-float-btn .gq-ping {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(45,176,75,.5);
          animation: gqPing 1.8s ease-out infinite;
        }
        .gq-float-btn-hidden { opacity: 0; pointer-events: none; }
      `}</style>
      <button
        className={`gq-float-btn${visible ? '' : ' gq-float-btn-hidden'}`}
        onClick={() => navigate('group-quote')}
        aria-label="ขอราคากรุ๊ปเหมา"
      >
        <span className="gq-icon">
          <span className="gq-ping" />
          🚌
        </span>
        <span>{lang === 'th' ? 'ขอราคากรุ๊ปเหมา' : 'Group Quote'}</span>
      </button>
    </>
  );
}

// ── Welcome Popup (show once per session) ─────────────────────
function GroupQuotePopup({ navigate, lang }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('gq-popup-shown')) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('gq-popup-shown', '1');
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes gqPopIn {
          0%   { opacity: 0; transform: translateY(40px) scale(.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gq-overlay {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(10,20,40,.6);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .gq-popup {
          background: #fff;
          border-radius: 20px;
          max-width: 440px; width: 100%;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,.35);
          animation: gqPopIn .45s cubic-bezier(.34,1.56,.64,1) forwards;
          position: relative;
        }
        .gq-popup-header {
          background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
          padding: 28px 28px 22px;
          text-align: center;
          color: #fff;
        }
        .gq-popup-badge {
          display: inline-block;
          background: rgba(45,176,75,.25);
          border: 1px solid rgba(45,176,75,.5);
          color: #4ade80;
          font-size: 11px; font-weight: 700; letter-spacing: .06em;
          padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
          text-transform: uppercase;
        }
        .gq-popup-title {
          font-size: 22px; font-weight: 900; margin: 0 0 8px;
          line-height: 1.25;
        }
        .gq-popup-sub {
          font-size: 13px; opacity: .75; margin: 0; line-height: 1.5;
        }
        .gq-popup-body {
          padding: 22px 28px 26px;
        }
        .gq-popup-features {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 20px;
        }
        .gq-popup-feat {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12.5px;
          color: #166534;
          display: flex; align-items: center; gap: 7px;
          font-weight: 600;
        }
        .gq-popup-cta {
          width: 100%;
          background: linear-gradient(135deg, #2db04b, #16a34a);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          transition: opacity .2s;
          letter-spacing: .01em;
        }
        .gq-popup-cta:hover { opacity: .9; }
        .gq-popup-skip {
          display: block; text-align: center; margin-top: 12px;
          font-size: 12px; color: #94a3b8; cursor: pointer;
          background: none; border: none; width: 100%;
        }
        .gq-popup-skip:hover { color: #64748b; }
        .gq-popup-close {
          position: absolute; top: 14px; right: 16px;
          background: rgba(255,255,255,.15); border: none;
          color: #fff; width: 28px; height: 28px;
          border-radius: 50%; cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .gq-popup-close:hover { background: rgba(255,255,255,.3); }
      `}</style>
      <div className="gq-overlay" onClick={() => setOpen(false)}>
        <div className="gq-popup" onClick={e => e.stopPropagation()}>
          <button className="gq-popup-close" onClick={() => setOpen(false)}>✕</button>
          <div className="gq-popup-header">
            <div className="gq-popup-badge">
              {lang === 'th' ? '🏆 บริการเด่นของเรา' : '🏆 Our Specialty'}
            </div>
            <h2 className="gq-popup-title">
              {lang === 'th' ? 'กรุ๊ปเหมาทัวร์' : 'Group Charter Tours'}
            </h2>
            <p className="gq-popup-sub">
              {lang === 'th'
                ? 'ออกแบบทริปสุดพิเศษสำหรับทีมของคุณ\nรับใบเสนอราคาฟรีภายใน 24 ชั่วโมง'
                : 'Custom trips for your team\nFree quote within 24 hours'}
            </p>
          </div>
          <div className="gq-popup-body">
            <div className="gq-popup-features">
              {[
                ['✈️', lang === 'th' ? 'ออกแบบเส้นทางได้เอง' : 'Custom itinerary'],
                ['💰', lang === 'th' ? 'ราคาพิเศษกรุ๊ป' : 'Group pricing'],
                ['🎯', lang === 'th' ? 'ดูแลครบวงจร' : 'Full service'],
                ['⚡', lang === 'th' ? 'ใบเสนอราคา 24 ชม.' : '24h quote'],
              ].map(([icon, label]) => (
                <div key={label} className="gq-popup-feat">
                  <span style={{ fontSize: 16 }}>{icon}</span> {label}
                </div>
              ))}
            </div>
            <button
              className="gq-popup-cta"
              onClick={() => { setOpen(false); navigate('group-quote'); }}
            >
              {lang === 'th' ? '📋 ขอใบเสนอราคาฟรี' : '📋 Get Free Quote'}
            </button>
            <button className="gq-popup-skip" onClick={() => setOpen(false)}>
              {lang === 'th' ? 'ข้ามไปก่อน' : 'Maybe later'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Path → page name mapping (for Navbar active state) ────────
function getPageFromPath(pathname) {
  if (pathname === '/')                       return 'home';
  if (pathname.startsWith('/tours/'))         return 'tours';
  if (pathname === '/tours')                  return 'tours';
  if (pathname === '/gallery')                return 'gallery';
  if (pathname.startsWith('/articles/'))      return 'articles';
  if (pathname === '/articles')               return 'articles';
  if (pathname === '/promotions')             return 'promotions';
  if (pathname === '/faq')                    return 'faq';
  if (pathname === '/contact')                return 'contact';
  if (pathname === '/ticket-booking')         return 'ticket-booking';
  if (pathname === '/car-rental')             return 'car-rental';
  return 'home';
}

// ── Inner app (needs router context for hooks) ─────────────────
function AppInner() {
  const routerNav  = useNavigate();
  const location   = useLocation();

  const [lang, setLang] = useState('th');

  const [tours,        setTours]        = useState([]);
  const [articles,     setArticles]     = useState([]);
  const [promotions,   setPromotions]   = useState([]);
  const [faqs,         setFaqs]         = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [bookings,     setBookings]     = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [settings,     setSettings]     = useState(SETTINGS_DEFAULT);

  const [compareList, setCompareList] = useState([]);
  const [supplierTours, setSupplierTours] = useState([]);

  const [loading, setLoading] = useState(true);
  const [minDelay, setMinDelay] = useState(true);   // splash shows at least 2.8s
  const [dbError, setDbError] = useState(null);

  // Minimum splash duration
  useEffect(() => { const t = setTimeout(() => setMinDelay(false), 2800); return () => clearTimeout(t); }, []);

  // Safety: กันหน้าโหลดค้าง (เช่นเน็ตมือถือแฮงค์) — ปิด splash ภายใน 10 วิเสมอ
  useEffect(() => { const t = setTimeout(() => setLoading(false), 10000); return () => clearTimeout(t); }, []);

  // รีเฟรช/เปิดลิงก์ตรง → เด้งกลับหน้าแรก (ยกเว้น /admin และตอนเปิดในแอป LINE/LIFF)
  useEffect(() => {
    const p = window.location.pathname;
    const inLine = /Line\//i.test(navigator.userAgent) || window.location.search.includes('liff');
    if (p !== '/' && !p.startsWith('/admin') && !inLine) routerNav('/', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load supplier tours — โหลดทีละเจ้า เจ้าไหนเสร็จโชว์ก่อน ────
  useEffect(() => {
    let cancelled = false;
    setSupplierTours([]);
    ENABLED_SUPPLIERS.forEach(sup => {
      fetch(`/api/suppliers?supplier=${sup.id}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
          if (!Array.isArray(data)) return [];
          if (sup.format === 'zego') return normalizeZegoTours(data, sup.id, sup.name);
          if (sup.format === 'ttn')  return normalizeTtnTours(data, sup.id, sup.name);
          return normalizePbTours(data, sup.id, sup.name);
        })
        .then(tours => {
          if (cancelled || !tours.length) return;
          // append เฉพาะเจ้านี้ (กันซ้ำถ้าเผลอ re-run)
          setSupplierTours(prev => [...prev.filter(t => t._source !== sup.id), ...tours]);
        })
        .catch(err => console.warn(`[${sup.name}] fetch failed:`, err));
    });
    return () => { cancelled = true; };
  }, []);

  const t = (obj) => (obj && (obj[lang] || obj['th'])) || '';

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setTours(TOURS_DATA);
      setArticles(ARTICLES_DATA);
      setPromotions(PROMOTIONS_DATA);
      setFaqs(FAQS_DATA);
      setReviews(REVIEWS_DATA);
      setBookings(BOOKINGS_DATA);
      setMessages(MESSAGES_DATA);
      setChatSessions(CHAT_SESSIONS_DEFAULT);
      setSettings(SITE_SETTINGS_DEFAULT);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [
          toursRes, articlesRes, promosRes, faqsRes,
          reviewsRes, bookingsRes, messagesRes, chatRes, settingsRes
        ] = await Promise.all([
          fetchTours(), fetchArticles(), fetchPromotions(), fetchFaqs(),
          fetchReviews(), fetchBookings(), fetchMessages(), fetchChatSessions(),
          fetchSettings()
        ]);

        const firstError = [toursRes, articlesRes, promosRes, faqsRes, reviewsRes].find(r => r.error);
        if (firstError?.error && firstError.error !== 'offline') {
          setDbError('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ' + JSON.stringify(firstError.error));
          setLoading(false);
          return;
        }

        setTours(toursRes.data       ?? TOURS_DATA);
        setArticles(articlesRes.data ?? ARTICLES_DATA);
        setPromotions(promosRes.data ?? PROMOTIONS_DATA);
        setFaqs(faqsRes.data         ?? FAQS_DATA);
        setReviews(reviewsRes.data   ?? REVIEWS_DATA);
        setBookings(bookingsRes.data ?? BOOKINGS_DATA);
        setMessages(messagesRes.data ?? MESSAGES_DATA);
        setChatSessions(chatRes.data ?? CHAT_SESSIONS_DEFAULT);

        if (settingsRes.data) {
          // Merge social: เอา platform จาก default เป็นฐาน แล้ว override ด้วยค่าจาก DB
          const dbSocial = settingsRes.data.social || [];
          const mergedSocial = SITE_SETTINGS_DEFAULT.social.map(def => {
            const saved = dbSocial.find(s => s.platform === def.platform);
            return saved ? { ...def, ...saved } : def;
          });
          setSettings(prev => ({
            ...prev,
            contact: settingsRes.data.contact || prev.contact,
            social:  mergedSocial,
            popup:   settingsRes.data.popup   || prev.popup,
            legal:   (() => {
              const saved = settingsRes.data.legal || {};
              // Deep-merge: ถ้า saved field เป็น empty string ให้ใช้ default
              const merged = {};
              ['privacy','terms','booking'].forEach(k => {
                merged[k] = {
                  th: saved[k]?.th || LEGAL_DEFAULTS[k].th,
                  en: saved[k]?.en || LEGAL_DEFAULTS[k].en,
                };
              });
              return merged;
            })(),
          }));
        } else {
          setSettings(SITE_SETTINGS_DEFAULT);
        }
      } catch (err) {
        setDbError('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ' + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── navigate helper — maps page names → real URLs ──────────
  const navigate = (page, id = null, filters = null) => {
    const map = {
      home:             '/',
      tours:            '/tours',
      'tour-detail':    `/tours/${id}`,
      gallery:          '/gallery',
      articles:         '/articles',
      'article-detail': `/articles/${id}`,
      promotions:       '/promotions',
      faq:              '/faq',
      contact:          '/contact',
      'group-quote':    '/group-quote',
      about:            '/about',
      visa:             '/visa',
      'ticket-booking': '/ticket-booking',
      'join-tour':      '/join-tour',
      'car-rental':     '/car-rental',
      cards:            '/cards',
      'legal-privacy':  '/privacy',
      'legal-terms':    '/terms',
      'legal-booking':  '/booking-terms',
    };
    let path = map[page] || '/';
    if (page === 'tours' && filters) {
      const p = new URLSearchParams();
      if (filters.tourType)          p.set('type',      filters.tourType);
      if (filters.continent)         p.set('continent', filters.continent);
      if (filters.country)           p.set('country',   filters.country);
      if (filters.search)            p.set('q',         filters.search);
      if (filters.countries?.length) p.set('countries', filters.countries.join(','));
      if (filters.continentLabel)    p.set('label',     filters.continentLabel);
      const qs = p.toString();
      if (qs) path += '?' + qs;
    }
    if (page === 'join-tour' && filters) {
      const p = new URLSearchParams();
      if (filters.code)       p.set('code',       filters.code);
      if (filters.name)       p.set('name',       filters.name);
      if (filters.date)       p.set('date',       filters.date);
      if (filters.returnDate) p.set('returnDate', filters.returnDate);
      if (filters.price)      p.set('price',      filters.price);
      const qs = p.toString();
      if (qs) path += '?' + qs;
    }
    routerNav(path);
    window.scrollTo(0, 0);
  };

  const toggleCompare = (tourId) => {
    setCompareList(prev =>
      prev.includes(tourId)
        ? prev.filter(id => id !== tourId)
        : prev.length < 3 ? [...prev, tourId] : prev
    );
  };

  // ── Loading screen ─────────────────────────────────────────
  if (loading || minDelay) {
    const stars = [
      { top:'8%',  left:'12%', s:3, o:0.7, d:0 },
      { top:'15%', left:'78%', s:2, o:0.5, d:0.4 },
      { top:'22%', left:'45%', s:4, o:0.6, d:0.8 },
      { top:'5%',  left:'60%', s:2, o:0.4, d:1.2 },
      { top:'35%', left:'88%', s:3, o:0.7, d:0.6 },
      { top:'55%', left:'5%',  s:2, o:0.5, d:1.0 },
      { top:'70%', left:'92%', s:4, o:0.6, d:0.2 },
      { top:'80%', left:'20%', s:2, o:0.4, d:1.5 },
      { top:'90%', left:'55%', s:3, o:0.6, d:0.9 },
      { top:'45%', left:'72%', s:2, o:0.5, d:0.3 },
      { top:'62%', left:'38%', s:3, o:0.7, d:1.1 },
      { top:'28%', left:'22%', s:2, o:0.4, d:0.7 },
    ];
    return (
      <>
        <style>{`
          @keyframes splashGrad {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes logoIn {
            0%   { opacity:0; transform: scale(0.5) translateY(30px); }
            65%  { transform: scale(1.1) translateY(-6px); }
            100% { opacity:1; transform: scale(1) translateY(0); }
          }
          @keyframes glow {
            0%,100% { box-shadow: 0 0 24px rgba(45,176,75,0.5), 0 0 60px rgba(45,176,75,0.2), 0 8px 32px rgba(0,0,0,0.4); }
            50%      { box-shadow: 0 0 48px rgba(45,176,75,0.9), 0 0 100px rgba(45,176,75,0.4), 0 8px 32px rgba(0,0,0,0.4); }
          }
          @keyframes ringPulse {
            0%   { transform:translate(-50%,-50%) scale(0.9); opacity:0.8; }
            100% { transform:translate(-50%,-50%) scale(1.9); opacity:0; }
          }
          @keyframes orbit {
            from { transform: rotate(0deg)   translateX(88px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(88px) rotate(-360deg); }
          }
          @keyframes textSlide {
            0%   { opacity:0; transform:translateY(28px); }
            100% { opacity:1; transform:translateY(0); }
          }
          @keyframes shimmer {
            0%   { background-position: -300% center; }
            100% { background-position:  300% center; }
          }
          @keyframes twinkle {
            0%,100% { opacity:0.2; transform:scale(1); }
            50%      { opacity:1;   transform:scale(1.4); }
          }
          @keyframes dot1 { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
          @keyframes floatY {
            0%,100% { transform:translateY(0); }
            50%      { transform:translateY(-10px); }
          }
          .splash-logo {
            animation: logoIn 0.9s cubic-bezier(.34,1.56,.64,1) forwards,
                       glow 2.8s ease-in-out 0.9s infinite,
                       floatY 3.5s ease-in-out 0.9s infinite;
          }
        `}</style>

        <div style={{
          minHeight:'100vh',
          background:'linear-gradient(135deg,#0d1b2a,#1b3a4b,#0f3460,#16213e)',
          backgroundSize:'400% 400%',
          animation:'splashGrad 7s ease infinite',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          position:'relative', overflow:'hidden',
        }}>

          {/* Stars */}
          {stars.map((st,i) => (
            <div key={i} style={{
              position:'absolute', top:st.top, left:st.left,
              width:st.s, height:st.s, borderRadius:'50%',
              background:'#fff', opacity:st.o,
              animation:`twinkle ${1.8+st.d}s ease-in-out ${st.d}s infinite`,
            }}/>
          ))}

          {/* Decorative blobs */}
          <div style={{
            position:'absolute', top:'-80px', right:'-80px',
            width:320, height:320, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(45,176,75,0.15),transparent 70%)',
            pointerEvents:'none',
          }}/>
          <div style={{
            position:'absolute', bottom:'-60px', left:'-60px',
            width:260, height:260, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(0,180,216,0.12),transparent 70%)',
            pointerEvents:'none',
          }}/>

          {/* Logo area */}
          <div style={{ position:'relative', width:140, height:140, marginBottom:36 }}>
            {/* Pulse rings */}
            {[0,1].map(i => (
              <div key={i} style={{
                position:'absolute', top:'50%', left:'50%',
                width:140, height:140, borderRadius:'50%',
                border:'2px solid rgba(45,176,75,0.5)',
                animation:`ringPulse 2.4s ease-out ${i*1.2}s infinite`,
              }}/>
            ))}

            {/* Logo circle */}
            <div className="splash-logo" style={{
              width:140, height:140, borderRadius:'50%',
              background:'rgba(255,255,255,0.97)',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative', zIndex:2,
            }}>
              <img src="/logo.png" alt="WeCraft Travel"
                style={{ width:108, height:108, objectFit:'contain' }}/>
            </div>

            {/* Orbiting plane */}
            <div style={{
              position:'absolute', top:'50%', left:'50%',
              width:0, height:0, zIndex:3,
              animation:'orbit 3.2s linear infinite',
            }}>
              <span style={{ fontSize:22, position:'absolute', transform:'translate(-11px,-11px)' }}>✈️</span>
            </div>
          </div>

          {/* Company name */}
          <div style={{ textAlign:'center', animation:'textSlide 0.7s ease 0.5s both' }}>
            <div style={{
              fontSize:30, fontWeight:900, letterSpacing:1,
              background:'linear-gradient(90deg,#fff 0%,#FFD700 40%,#2db04b 60%,#fff 100%)',
              backgroundSize:'300% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              animation:'shimmer 3s linear 1s infinite',
            }}>WeCraft Travel</div>
            <div style={{
              color:'rgba(255,255,255,0.55)', fontSize:11,
              letterSpacing:5, marginTop:6, fontWeight:600,
            }}>WE CRAFT ABROAD</div>
          </div>

          {/* Loading dots */}
          <div style={{ display:'flex', gap:10, marginTop:40 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width:9, height:9, borderRadius:'50%',
                background: i%2===0 ? '#2db04b' : '#FFD700',
                animation:`dot1 1.5s ease-in-out ${i*0.18}s infinite`,
              }}/>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── DB Error screen ────────────────────────────────────────
  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">เชื่อมต่อฐานข้อมูลไม่ได้</h2>
          <p className="text-sm text-slate-500 whitespace-pre-line mb-6">{dbError}</p>
          <button onClick={() => window.location.reload()}
            className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const pageProps = {
    lang, t, navigate, tours, supplierTours, articles, promotions, faqs,
    reviews, settings, compareList, toggleCompare,
    setBookings, setReviews, setMessages, setArticles,
  };

  const adminProps = {
    lang, t, setLang,
    tours,        setTours,
    supplierTours,
    articles,     setArticles,
    promotions,   setPromotions,
    faqs,         setFaqs,
    reviews,      setReviews,
    bookings,     setBookings,
    messages,     setMessages,
    chatSessions, setChatSessions,
    settings,     setSettings,
    onLogout: () => routerNav('/'),
  };

  // ── Admin panel (full-page, no navbar/footer) ──────────────
  if (location.pathname.startsWith('/admin')) {
    return <AdminPanel {...adminProps} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        lang={lang} setLang={setLang}
        page={getPageFromPath(location.pathname)}
        navigate={navigate} t={t}
        tours={tours} supplierTours={supplierTours}
      />
      <main>
        <Routes>
          <Route path="/"            element={<HomePage {...pageProps} />} />
          <Route path="/tours"       element={<ToursRoute {...pageProps} />} />
          <Route path="/tours/:id"   element={<TourDetailRoute {...pageProps} />} />
          <Route path="/gallery"     element={<GalleryPage {...pageProps} />} />
          <Route path="/articles"    element={<ArticlesPage {...pageProps} />} />
          <Route path="/articles/:id" element={<ArticleDetailRoute {...pageProps} />} />
          <Route path="/promotions"  element={<PromotionsPage {...pageProps} />} />
          <Route path="/faq"         element={<FAQPage {...pageProps} />} />
          <Route path="/contact"      element={<ContactPage {...pageProps} />} />
          <Route path="/group-quote" element={<GroupQuotePage lang={pageProps.lang} setMessages={pageProps.setMessages} />} />
          <Route path="/about"       element={<AboutPage lang={pageProps.lang} navigate={navigate} />} />
          <Route path="/visa"           element={<VisaPage lang={pageProps.lang} navigate={navigate} />} />
          <Route path="/ticket-booking" element={<TicketBookingPage {...pageProps} />} />
          <Route path="/join-tour"     element={<JoinTourPage lang={pageProps.lang} navigate={navigate} />} />
          <Route path="/car-rental"     element={<CarRentalPage {...pageProps} />} />
          <Route path="/cards"          element={<CardExplorePage {...pageProps} />} />
          <Route path="/privacy"        element={<LegalPage lang={lang} navigate={navigate} settings={settings} type="privacy" />} />
          <Route path="/terms"          element={<LegalPage lang={lang} navigate={navigate} settings={settings} type="terms" />} />
          <Route path="/booking-terms"  element={<LegalPage lang={lang} navigate={navigate} settings={settings} type="booking" />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer lang={lang} t={t} navigate={navigate} settings={settings} />
      <FloatingContact settings={settings} />

      {/* ── Sticky Group Quote Float Button — เฉพาะหน้าแรก ───── */}
      {location.pathname === '/' && (
        <GroupQuoteFloat navigate={navigate} lang={lang} />
      )}

      {/* ── Welcome Popup (first visit) ───────────────────────── */}
      <GroupQuotePopup navigate={navigate} lang={lang} />

      {compareList.length >= 2 && (
        <CompareBar compareList={compareList} setCompareList={setCompareList}
          tours={tours} t={t} navigate={navigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

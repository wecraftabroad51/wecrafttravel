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
import CarRentalPage from './components/pages/CarRentalPage.jsx';

const SETTINGS_DEFAULT = {
  contact: { address: { th: '', en: '' }, phone: '', email: '', line: '' },
  social: [],
  popup: { enabled: false },
};

// ── Route wrappers that inject URL params ─────────────────────
function ToursRoute(props) {
  const [searchParams] = useSearchParams();
  const initialFilters = {
    tourType:  searchParams.get('type')      || '',
    continent: searchParams.get('continent') || '',
    country:   searchParams.get('country')   || '',
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

  const [loading, setLoading] = useState(true);
  const [minDelay, setMinDelay] = useState(true);   // splash shows at least 2.8s
  const [dbError, setDbError] = useState(null);

  // Minimum splash duration
  useEffect(() => { const t = setTimeout(() => setMinDelay(false), 2800); return () => clearTimeout(t); }, []);

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
      'car-rental':     '/car-rental',
    };
    let path = map[page] || '/';
    if (page === 'tours' && filters) {
      const p = new URLSearchParams();
      if (filters.tourType)  p.set('type',      filters.tourType);
      if (filters.continent) p.set('continent', filters.continent);
      if (filters.country)   p.set('country',   filters.country);
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
    lang, t, navigate, tours, articles, promotions, faqs,
    reviews, settings, compareList, toggleCompare,
    setBookings, setReviews, setMessages,
  };

  const adminProps = {
    lang, t, setLang,
    tours,        setTours,
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
          <Route path="/about"       element={<AboutPage navigate={navigate} />} />
          <Route path="/visa"           element={<VisaPage lang={pageProps.lang} navigate={navigate} />} />
          <Route path="/ticket-booking" element={<TicketBookingPage {...pageProps} />} />
          <Route path="/car-rental"     element={<CarRentalPage {...pageProps} />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer lang={lang} t={t} navigate={navigate} settings={settings} />
      <FloatingContact settings={settings} />
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

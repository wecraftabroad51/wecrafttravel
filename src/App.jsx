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
import ChatWidget from './components/ChatWidget.jsx';
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
import AdminPanel from './components/admin/AdminPanel.jsx';

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
  return <ToursPage {...props} initialFilters={initialFilters} />;
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
  const [chatOpen,    setChatOpen]    = useState(false);

  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

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
          setSettings(prev => ({
            ...prev,
            contact: settingsRes.data.contact || prev.contact,
            social:  settingsRes.data.social  || prev.social,
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
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-2xl">✈</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">กำลังเชื่อมต่อฐานข้อมูล...</p>
        </div>
      </div>
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
        onAdminClick={() => routerNav('/admin')}
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
          <Route path="/contact"     element={<ContactPage {...pageProps} />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer lang={lang} t={t} navigate={navigate} settings={settings} />
      <ChatWidget lang={lang} open={chatOpen} setOpen={setChatOpen} />
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

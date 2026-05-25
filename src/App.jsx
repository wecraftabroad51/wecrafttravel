import { useState, useEffect } from 'react';
import {
  TOURS_DATA, ARTICLES_DATA, PROMOTIONS_DATA, FAQS_DATA,
  REVIEWS_DATA, SITE_SETTINGS_DEFAULT, BOOKINGS_DATA,
  MESSAGES_DATA, CHAT_SESSIONS_DEFAULT
} from './data.js';
import {
  fetchTours, fetchArticles, fetchPromotions, fetchFaqs,
  fetchReviews, fetchBookings, fetchMessages, fetchChatSessions,
  fetchSettings
} from './lib/db.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import SocialBar from './components/SocialBar.jsx';
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

// ── Detect /admin path → show admin panel directly ───────────
const IS_ADMIN_PATH = window.location.pathname.startsWith('/admin');

export default function App() {
  const [lang, setLang] = useState('th');
  const [page, setPage] = useState('home');
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(IS_ADMIN_PATH);
  const [loading, setLoading] = useState(true);

  const [tours, setTours] = useState(TOURS_DATA);
  const [articles, setArticles] = useState(ARTICLES_DATA);
  const [promotions, setPromotions] = useState(PROMOTIONS_DATA);
  const [faqs, setFaqs] = useState(FAQS_DATA);
  const [reviews, setReviews] = useState(REVIEWS_DATA);
  const [bookings, setBookings] = useState(BOOKINGS_DATA);
  const [messages, setMessages] = useState(MESSAGES_DATA);
  const [chatSessions, setChatSessions] = useState(CHAT_SESSIONS_DEFAULT);
  const [settings, setSettings] = useState(SITE_SETTINGS_DEFAULT);

  const [compareList, setCompareList] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  const t = (obj) => (obj && (obj[lang] || obj['th'])) || '';

  // ── Load data from Supabase (falls back to mock if offline) ──
  useEffect(() => {
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

        if (toursRes.data?.length)     setTours(toursRes.data);
        if (articlesRes.data?.length)  setArticles(articlesRes.data);
        if (promosRes.data?.length)    setPromotions(promosRes.data);
        if (faqsRes.data?.length)      setFaqs(faqsRes.data);
        if (reviewsRes.data?.length)   setReviews(reviewsRes.data);
        if (bookingsRes.data?.length)  setBookings(bookingsRes.data);
        if (messagesRes.data?.length)  setMessages(messagesRes.data);
        if (chatRes.data?.length)      setChatSessions(chatRes.data);
        if (settingsRes.data) {
          setSettings(prev => ({
            ...prev,
            contact: settingsRes.data.contact || prev.contact,
            social:  settingsRes.data.social  || prev.social,
            popup:   settingsRes.data.popup   || prev.popup,
          }));
        }
      } catch (err) {
        console.warn('Supabase load failed, using mock data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navigate = (p, id = null) => {
    setPage(p);
    if (p === 'tour-detail') setSelectedTourId(id);
    if (p === 'article-detail') setSelectedArticleId(id);
    window.scrollTo(0, 0);
  };

  const toggleCompare = (tourId) => {
    setCompareList(prev =>
      prev.includes(tourId)
        ? prev.filter(id => id !== tourId)
        : prev.length < 3 ? [...prev, tourId] : prev
    );
  };

  // ── Loading screen ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-2xl">✈</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminPanel
        lang={lang} t={t} setLang={setLang}
        tours={tours} setTours={setTours}
        articles={articles} setArticles={setArticles}
        promotions={promotions} setPromotions={setPromotions}
        faqs={faqs} setFaqs={setFaqs}
        reviews={reviews} setReviews={setReviews}
        bookings={bookings} setBookings={setBookings}
        messages={messages} setMessages={setMessages}
        chatSessions={chatSessions} setChatSessions={setChatSessions}
        settings={settings} setSettings={setSettings}
        onLogout={() => window.location.href = '/'}
      />
    );
  }

  const pageProps = {
    lang, t, navigate, tours, articles, promotions, faqs,
    reviews, settings, compareList, toggleCompare,
    setBookings, setReviews, setMessages
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar lang={lang} setLang={setLang} page={page} navigate={navigate} t={t} onAdminClick={() => window.location.href = '/admin'} />

      <main>
        {page === 'home'           && <HomePage {...pageProps} />}
        {page === 'tours'          && <ToursPage {...pageProps} />}
        {page === 'tour-detail'    && <TourDetailPage {...pageProps} tourId={selectedTourId} />}
        {page === 'gallery'        && <GalleryPage {...pageProps} />}
        {page === 'articles'       && <ArticlesPage {...pageProps} />}
        {page === 'article-detail' && <ArticleDetailPage {...pageProps} articleId={selectedArticleId} />}
        {page === 'promotions'     && <PromotionsPage {...pageProps} />}
        {page === 'faq'            && <FAQPage {...pageProps} />}
        {page === 'contact'        && <ContactPage {...pageProps} setMessages={setMessages} />}
      </main>

      <Footer lang={lang} t={t} navigate={navigate} settings={settings} />
      <SocialBar settings={settings} />
      <ChatWidget lang={lang} open={chatOpen} setOpen={setChatOpen} />
      {compareList.length >= 2 && (
        <CompareBar compareList={compareList} setCompareList={setCompareList} tours={tours} t={t} navigate={navigate} />
      )}
    </div>
  );
}

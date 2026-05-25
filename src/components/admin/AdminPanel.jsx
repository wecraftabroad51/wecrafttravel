import { useState, useEffect, useRef } from 'react';
import { LogOut, LayoutDashboard, Globe, Tag, Star, FileText, HelpCircle,
  MessageSquare, Mail, Settings, Plane, Check, X, Eye, Trash2, Plus, Edit2, Upload } from 'lucide-react';
import {
  upsertTour, deleteTour, toggleTourFeatured, toggleTourActive,
  upsertArticle, deleteArticle,
  upsertPromotion, deletePromotion, togglePromoActive,
  upsertFaq, deleteFaq,
  approveReview, deleteReview,
  updateBookingStatus,
  markMessageRead,
  updateSettings,
  upsertChatSession,
  fetchChatSessions,
  subscribeChatSessions,
} from '../../lib/db.js';
import {
  TOURS_DATA, ARTICLES_DATA, PROMOTIONS_DATA, FAQS_DATA, REVIEWS_DATA
} from '../../data.js';

const MENU = [
  { key: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { key: 'tours',       label: 'Tours',        icon: Globe },
  { key: 'promotions',  label: 'Promotions',   icon: Tag },
  { key: 'reviews',     label: 'Reviews',      icon: Star },
  { key: 'articles',    label: 'Articles',     icon: FileText },
  { key: 'faqs',        label: 'FAQs',         icon: HelpCircle },
  { key: 'bookings',    label: 'Bookings',     icon: Plane },
  { key: 'messages',    label: 'Messages',     icon: Mail },
  { key: 'chat',        label: 'Live Chat',    icon: MessageSquare },
  { key: 'settings',    label: 'Settings',     icon: Settings },
];

const CONTINENTS = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania', 'Middle East'];

// ── Reusable Modal Shell ──────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

// ── Admin Panel ───────────────────────────────────────────────
export default function AdminPanel(props) {
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loggedIn, setLoggedIn]   = useState(false);
  const [section, setSection]     = useState('dashboard');
  const [sideOpen, setSideOpen]   = useState(true);

  const { lang, t, setLang, tours, setTours, articles, setArticles,
    promotions, setPromotions, faqs, setFaqs, reviews, setReviews,
    bookings, setBookings, messages, setMessages,
    chatSessions, setChatSessions, settings, setSettings, onLogout } = props;

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Admin Login</h1>
          </div>
          <div className="space-y-3">
            <input className={inp} placeholder="Username" value={loginForm.user}
              onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))} />
            <input type="password" className={inp} placeholder="Password" value={loginForm.pass}
              onChange={e => setLoginForm(p => ({ ...p, pass: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && loginForm.user === 'admin' && loginForm.pass === 'admin123') setLoggedIn(true); }} />
            <button
              onClick={() => { if (loginForm.user === 'admin' && loginForm.pass === 'admin123') setLoggedIn(true); else alert('รหัสผ่านไม่ถูกต้อง'); }}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors">
              Login
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">admin / admin123</p>
          <button onClick={onLogout} className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm transition-colors">← Back to Website</button>
        </div>
      </div>
    );
  }

  const unreadMsg      = messages.filter(m => !m.read).length;
  const pendingReviews = reviews.filter(r => !r.approved).length;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className={`${sideOpen ? 'w-56' : 'w-16'} bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          {sideOpen && <span className="font-bold text-sm truncate">WeCraftTravel Admin</span>}
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {MENU.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                section === key ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {sideOpen && (
                <span className="truncate">{label}
                  {key === 'messages' && unreadMsg > 0      && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadMsg}</span>}
                  {key === 'reviews'  && pendingReviews > 0 && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingReviews}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sideOpen && <span>Exit Admin</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSideOpen(!sideOpen)} className="text-slate-400 hover:text-slate-700">
            {sideOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="text-xs border border-slate-200 px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-50">
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard'  && <DashboardSection tours={tours} articles={articles} bookings={bookings} messages={messages} reviews={reviews} chatSessions={chatSessions} setTours={setTours} setArticles={setArticles} setPromotions={setPromotions} setFaqs={setFaqs} setReviews={setReviews} />}
          {section === 'tours'      && <ToursSection tours={tours} setTours={setTours} t={t} />}
          {section === 'promotions' && <PromotionsSection promotions={promotions} setPromotions={setPromotions} t={t} />}
          {section === 'reviews'    && <ReviewsSection reviews={reviews} setReviews={setReviews} tours={tours} t={t} />}
          {section === 'articles'   && <ArticlesSection articles={articles} setArticles={setArticles} t={t} />}
          {section === 'faqs'       && <FaqsSection faqs={faqs} setFaqs={setFaqs} t={t} />}
          {section === 'bookings'   && <BookingsSection bookings={bookings} setBookings={setBookings} tours={tours} t={t} />}
          {section === 'messages'   && <MessagesSection messages={messages} setMessages={setMessages} />}
          {section === 'chat'       && <ChatSection />}
          {section === 'settings'   && <SettingsSection settings={settings} setSettings={setSettings} t={t} />}
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function DashboardSection({ tours, articles, bookings, messages, reviews, chatSessions, setTours, setArticles, setPromotions, setFaqs, setReviews }) {
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleSeed = async () => {
    if (!confirm('นำเข้าข้อมูลตัวอย่างทั้งหมด (ทัวร์, บทความ, FAQ) เข้า Supabase?\n\nข้อมูลเดิมที่มีอยู่จะไม่ถูกลบครับ')) return;
    setSeeding(true);
    try {
      // Seed tours
      const tourResults = await Promise.all(
        TOURS_DATA.map(tour => upsertTour({ ...tour, id: undefined }))
      );
      const tourErrors = tourResults.filter(r => r.error);
      const newTours = tourResults.map(r => r.data).filter(Boolean);
      if (newTours.length) setTours(prev => [...newTours, ...prev]);

      // Seed articles
      const articleResults = await Promise.all(
        ARTICLES_DATA.map(a => upsertArticle({ ...a, id: undefined }))
      );
      const articleErrors = articleResults.filter(r => r.error);
      const newArticles = articleResults.map(r => r.data).filter(Boolean);
      if (newArticles.length) setArticles(prev => [...newArticles, ...prev]);

      // Seed faqs
      const faqResults = await Promise.all(
        FAQS_DATA.map(f => upsertFaq({ ...f, id: undefined }))
      );
      const faqErrors = faqResults.filter(r => r.error);
      const newFaqs = faqResults.map(r => r.data).filter(Boolean);
      if (newFaqs.length) setFaqs(prev => [...prev, ...newFaqs]);

      const totalErrors = tourErrors.length + articleErrors.length + faqErrors.length;
      if (totalErrors > 0) {
        alert(`⚠️ นำเข้าบางส่วนสำเร็จ!\n- ทัวร์: ${newTours.length}/${TOURS_DATA.length}\n- บทความ: ${newArticles.length}/${ARTICLES_DATA.length}\n- FAQ: ${newFaqs.length}/${FAQS_DATA.length}\n\nมี ${totalErrors} รายการที่ล้มเหลว`);
      } else {
        setSeedDone(true);
        alert(`✅ นำเข้าสำเร็จ!\n- ทัวร์: ${newTours.length} รายการ\n- บทความ: ${newArticles.length} รายการ\n- FAQ: ${newFaqs.length} รายการ`);
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
    setSeeding(false);
  };

  const stats = [
    { label: 'ทัวร์ทั้งหมด',  value: tours.length,                                        color: 'bg-teal-500' },
    { label: 'การจอง',         value: bookings.length,                                     color: 'bg-blue-500' },
    { label: 'บทความ',         value: articles.length,                                     color: 'bg-purple-500' },
    { label: 'รีวิวรอ',        value: reviews.filter(r => !r.approved).length,             color: 'bg-amber-500' },
    { label: 'ข้อความใหม่',    value: messages.filter(m => !m.read).length,                color: 'bg-red-500' },
    { label: 'แชทแอคทีฟ',     value: chatSessions.filter(s => s.status === 'open').length, color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        {!seedDone && (
          <button onClick={handleSeed} disabled={seeding}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Upload className="w-4 h-4" />
            {seeding ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูลตัวอย่าง → Supabase'}
          </button>
        )}
      </div>

      {!seedDone && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          💡 กด <strong>"นำเข้าข้อมูลตัวอย่าง"</strong> เพื่อเพิ่มทัวร์ บทความ และ FAQ ตัวอย่างลง Supabase (ทำครั้งเดียวพอครับ)
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold text-white ${s.color} rounded-xl py-2 mb-2`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TOURS =====
const EMPTY_TOUR = {
  name: { th: '', en: '' }, destination: { th: '', en: '' }, description: { th: '', en: '' },
  image: '', continent: 'Asia', duration: 7, groupSize: 20, price: 0, featured: false, active: true,
  flight: { outbound: { airline: '', flightNo: '', departure: '', arrival: '' }, return: { airline: '', flightNo: '', departure: '', arrival: '' } },
  hotels: [], itinerary: [], includes: [], excludes: [], priceTiers: [], departures: [], gallery: [],
};

const TOUR_TABS = ['พื้นฐาน', 'ราคา', 'โปรแกรม', 'ที่พัก', 'รวม/ไม่รวม', 'ภาพ'];

function ToursSection({ tours, setTours, t }) {
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(EMPTY_TOUR);
  const [tourTab, setTourTab] = useState('พื้นฐาน');

  const openAdd  = () => { setForm(EMPTY_TOUR); setTourTab('พื้นฐาน'); setModal({ mode: 'add' }); };
  const openEdit = (tour) => { setForm(tour); setTourTab('พื้นฐาน'); setModal({ mode: 'edit', tour }); };
  const closeModal = () => setModal(null);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  // Array helpers for priceTiers, departures, itinerary, etc.
  const addToArr = (field, item) => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), item] }));
  const removeFromArr = (field, idx) => setForm(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));
  const updateArr = (field, idx, val) => setForm(prev => {
    const arr = [...(prev[field] || [])];
    arr[idx] = val;
    return { ...prev, [field]: arr };
  });

  const handleSave = async () => {
    if (!form.name.th) return alert('กรุณากรอกชื่อทัวร์ (ภาษาไทย)');
    setSaving(true);
    const { data, error } = await upsertTour(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setTours(prev => modal.mode === 'add'
      ? [data, ...prev]
      : prev.map(tr => tr.id === data.id ? data : tr)
    );
    closeModal();
  };

  const handleDelete = async (tour) => {
    if (!confirm(`ลบทัวร์ "${t(tour.name)}" ใช่ไหม?`)) return;
    const { error } = await deleteTour(tour.id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setTours(prev => prev.filter(tr => tr.id !== tour.id));
  };

  const handleToggleFeatured = async (tour) => {
    const next = !tour.featured;
    const { error } = await toggleTourFeatured(tour.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setTours(prev => prev.map(tr => tr.id === tour.id ? { ...tr, featured: next } : tr));
  };

  const handleToggleActive = async (tour) => {
    const next = !tour.active;
    const { error } = await toggleTourActive(tour.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setTours(prev => prev.map(tr => tr.id === tour.id ? { ...tr, active: next } : tr));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการทัวร์ ({tours.length})</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มทัวร์
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทัวร์</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทวีป</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ราคา</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">วัน</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Featured</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">สถานะ</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tours.map(tour => (
              <tr key={tour.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={tour.image} alt="" className="w-10 h-8 rounded object-cover bg-slate-100" />
                    <span className="font-medium text-slate-700">{t(tour.name)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{tour.continent}</td>
                <td className="px-4 py-3 font-semibold text-teal-700">฿{tour.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{tour.duration}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleFeatured(tour)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${tour.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {tour.featured ? '★ Featured' : 'ปกติ'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(tour)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${tour.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {tour.active !== false ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(tour)} className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(tour)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">ยังไม่มีทัวร์</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tour Modal — Tabbed */}
      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มทัวร์ใหม่' : 'แก้ไขทัวร์'} onClose={closeModal} wide>
          {/* Tab bar */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {TOUR_TABS.map(tab => (
              <button key={tab} onClick={() => setTourTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tourTab === tab ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab: พื้นฐาน ── */}
          {tourTab === 'พื้นฐาน' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อทัวร์ (ไทย) *">
                  <input className={inp} value={form.name.th} onChange={e => setF(['name','th'], e.target.value)} placeholder="ทัวร์ญี่ปุ่น..." />
                </Field>
                <Field label="ชื่อทัวร์ (English)">
                  <input className={inp} value={form.name.en} onChange={e => setF(['name','en'], e.target.value)} placeholder="Japan Tour..." />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ปลายทาง (ไทย)">
                  <input className={inp} value={form.destination.th} onChange={e => setF(['destination','th'], e.target.value)} placeholder="โตเกียว ญี่ปุ่น" />
                </Field>
                <Field label="ปลายทาง (English)">
                  <input className={inp} value={form.destination.en} onChange={e => setF(['destination','en'], e.target.value)} placeholder="Tokyo, Japan" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="คำอธิบาย (ไทย)">
                  <textarea className={inp} rows={2} value={form.description.th} onChange={e => setF(['description','th'], e.target.value)} />
                </Field>
                <Field label="คำอธิบาย (English)">
                  <textarea className={inp} rows={2} value={form.description.en} onChange={e => setF(['description','en'], e.target.value)} />
                </Field>
              </div>
              <Field label="URL รูปภาพหลัก">
                <input className={inp} value={form.image} onChange={e => setF(['image'], e.target.value)} placeholder="https://..." />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="ทวีป">
                  <select className={inp} value={form.continent} onChange={e => setF(['continent'], e.target.value)}>
                    {CONTINENTS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="ราคาเริ่มต้น (฿)">
                  <input className={inp} type="number" value={form.price} onChange={e => setF(['price'], Number(e.target.value))} />
                </Field>
                <Field label="ระยะเวลา (วัน)">
                  <input className={inp} type="number" value={form.duration} onChange={e => setF(['duration'], Number(e.target.value))} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="จำนวนคน (สูงสุด)">
                  <input className={inp} type="number" value={form.groupSize} onChange={e => setF(['groupSize'], Number(e.target.value))} />
                </Field>
                <Field label="สายการบิน">
                  <input className={inp} value={form.flight?.outbound?.airline || ''} onChange={e => setF(['flight','outbound','airline'], e.target.value)} placeholder="Thai Airways" />
                </Field>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setF(['featured'], e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-slate-700">Featured (แนะนำ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active !== false} onChange={e => setF(['active'], e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-slate-700">Active (แสดงในเว็บ)</span>
                </label>
              </div>
            </div>
          )}

          {/* ── Tab: ราคา ── */}
          {tourTab === 'ราคา' && (
            <div className="space-y-6">
              {/* Price Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 text-sm">ระดับราคา (Price Tiers)</h4>
                  <button onClick={() => addToArr('priceTiers', { name: '', description: '', price: 0 })}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3 h-3" /> เพิ่มระดับ
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.priceTiers || []).map((tier, i) => (
                    <div key={i} className="grid grid-cols-7 gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <input className={`${inp} col-span-2`} placeholder="ชื่อ (Standard)" value={tier.name}
                        onChange={e => updateArr('priceTiers', i, { ...tier, name: e.target.value })} />
                      <input className={`${inp} col-span-2`} placeholder="รายละเอียด (Water Villa)" value={tier.description}
                        onChange={e => updateArr('priceTiers', i, { ...tier, description: e.target.value })} />
                      <input className={`${inp} col-span-2`} type="number" placeholder="ราคา (฿)" value={tier.price}
                        onChange={e => updateArr('priceTiers', i, { ...tier, price: Number(e.target.value) })} />
                      <button onClick={() => removeFromArr('priceTiers', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {!(form.priceTiers || []).length && <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีระดับราคา</p>}
                </div>
              </div>

              {/* Departures */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 text-sm">วันเดินทาง (Departures)</h4>
                  <button onClick={() => addToArr('departures', { date: '', available: 10, priceAdjust: 0 })}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3 h-3" /> เพิ่มวัน
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.departures || []).map((dep, i) => (
                    <div key={i} className="grid grid-cols-7 gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <input className={`${inp} col-span-3`} type="date" value={dep.date}
                        onChange={e => updateArr('departures', i, { ...dep, date: e.target.value })} />
                      <input className={`${inp} col-span-1`} type="number" placeholder="ที่ว่าง" value={dep.available}
                        onChange={e => updateArr('departures', i, { ...dep, available: Number(e.target.value) })} />
                      <input className={`${inp} col-span-2`} type="number" placeholder="ปรับราคา ±฿" value={dep.priceAdjust}
                        onChange={e => updateArr('departures', i, { ...dep, priceAdjust: Number(e.target.value) })} />
                      <button onClick={() => removeFromArr('departures', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {!(form.departures || []).length && <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีวันเดินทาง</p>}
                </div>
                <p className="text-xs text-slate-400 mt-2">* ปรับราคา: ใส่บวก (+) หรือลบ (-) เพื่อปรับจากราคาเริ่มต้น เช่น +5000 หรือ -3000</p>
              </div>
            </div>
          )}

          {/* ── Tab: โปรแกรม ── */}
          {tourTab === 'โปรแกรม' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">โปรแกรมการเดินทาง</h4>
                <button onClick={() => addToArr('itinerary', { title: '', description: '', meals: [], hotel: '' })}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มวัน
                </button>
              </div>
              <div className="space-y-3">
                {(form.itinerary || []).map((day, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <button onClick={() => removeFromArr('itinerary', i)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input className={inp} placeholder="หัวข้อวัน (เช่น เดินทางถึงโตเกียว)" value={day.title}
                      onChange={e => updateArr('itinerary', i, { ...day, title: e.target.value })} />
                    <textarea className={inp} rows={2} placeholder="คำอธิบายกิจกรรม" value={day.description}
                      onChange={e => updateArr('itinerary', i, { ...day, description: e.target.value })} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs text-slate-500 shrink-0">มื้ออาหาร:</span>
                      {['เช้า', 'กลางวัน', 'เย็น'].map(meal => (
                        <label key={meal} className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox"
                            checked={(day.meals || []).includes(meal)}
                            onChange={e => updateArr('itinerary', i, {
                              ...day,
                              meals: e.target.checked
                                ? [...(day.meals || []), meal]
                                : (day.meals || []).filter(m => m !== meal)
                            })}
                            className="w-3.5 h-3.5 accent-teal-600" />
                          <span className="text-xs text-slate-600">{meal}</span>
                        </label>
                      ))}
                    </div>
                    <input className={inp} placeholder="ที่พัก (ชื่อโรงแรม)" value={day.hotel || ''}
                      onChange={e => updateArr('itinerary', i, { ...day, hotel: e.target.value })} />
                  </div>
                ))}
                {!(form.itinerary || []).length && (
                  <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีโปรแกรม — กด "เพิ่มวัน" เพื่อเริ่มต้น</p>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: ที่พัก ── */}
          {tourTab === 'ที่พัก' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">โรงแรม / ที่พัก</h4>
                <button onClick={() => addToArr('hotels', { name: '', stars: 4, description: '' })}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มที่พัก
                </button>
              </div>
              <div className="space-y-3">
                {(form.hotels || []).map((hotel, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input className={`${inp} flex-1`} placeholder="ชื่อโรงแรม" value={hotel.name}
                        onChange={e => updateArr('hotels', i, { ...hotel, name: e.target.value })} />
                      <select className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-24 shrink-0"
                        value={hotel.stars}
                        onChange={e => updateArr('hotels', i, { ...hotel, stars: Number(e.target.value) })}>
                        {[3, 4, 5].map(s => <option key={s} value={s}>{s} ดาว</option>)}
                      </select>
                      <button onClick={() => removeFromArr('hotels', i)}
                        className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea className={inp} rows={2} placeholder="คำอธิบายโรงแรม" value={hotel.description || ''}
                      onChange={e => updateArr('hotels', i, { ...hotel, description: e.target.value })} />
                  </div>
                ))}
                {!(form.hotels || []).length && <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีที่พัก</p>}
              </div>
            </div>
          )}

          {/* ── Tab: รวม/ไม่รวม ── */}
          {tourTab === 'รวม/ไม่รวม' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-700 text-sm">✅ รวมในแพ็กเกจ</h4>
                  <button onClick={() => addToArr('includes', '')}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">
                    + เพิ่ม
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.includes || []).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inp} flex-1`} value={item} placeholder="เช่น ตั๋วเครื่องบิน"
                        onChange={e => updateArr('includes', i, e.target.value)} />
                      <button onClick={() => removeFromArr('includes', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!(form.includes || []).length && <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีรายการ</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-600 text-sm">❌ ไม่รวมในแพ็กเกจ</h4>
                  <button onClick={() => addToArr('excludes', '')}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-semibold">
                    + เพิ่ม
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.excludes || []).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inp} flex-1`} value={item} placeholder="เช่น ค่าวีซ่า"
                        onChange={e => updateArr('excludes', i, e.target.value)} />
                      <button onClick={() => removeFromArr('excludes', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!(form.excludes || []).length && <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีรายการ</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: ภาพ ── */}
          {tourTab === 'ภาพ' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">แกลเลอรี่รูปภาพ</h4>
                <button onClick={() => addToArr('gallery', '')}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มรูป
                </button>
              </div>
              <div className="space-y-2">
                {(form.gallery || []).map((url, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className={`${inp} flex-1`} value={url} placeholder="https://..."
                      onChange={e => updateArr('gallery', i, e.target.value)} />
                    {url && <img src={url} alt="" className="w-12 h-9 rounded-lg object-cover bg-slate-100 shrink-0" />}
                    <button onClick={() => removeFromArr('gallery', i)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {!(form.gallery || []).length && <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีรูปภาพ</p>}
              </div>
            </div>
          )}

          {/* Save/Cancel always at bottom */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
              {saving ? 'กำลังบันทึก...' : (modal.mode === 'add' ? 'เพิ่มทัวร์' : 'บันทึก')}
            </button>
            <button onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              ยกเลิก
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== PROMOTIONS =====
const EMPTY_PROMO = { title: { th: '', en: '' }, description: { th: '', en: '' }, image: '', badge: '', discount: 10, code: '', active: true };

function PromotionsSection({ promotions, setPromotions, t }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_PROMO);
  const [saving, setSaving] = useState(false);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  const handleSave = async () => {
    if (!form.title.th) return alert('กรุณากรอกชื่อโปรโมชั่น');
    setSaving(true);
    const { data, error } = await upsertPromotion(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setPromotions(prev => modal.mode === 'add' ? [data, ...prev] : prev.map(p => p.id === data.id ? data : p));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบโปรโมชั่นนี้?')) return;
    const { error } = await deletePromotion(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const handleToggle = async (promo) => {
    const next = !promo.active;
    const { error } = await togglePromoActive(promo.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: next } : p));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการโปรโมชั่น</h2>
        <button onClick={() => { setForm(EMPTY_PROMO); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มโปรโมชั่น
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{t(promo.title)}</h3>
                <p className="text-xs text-slate-400">{promo.code && `Code: ${promo.code}`}</p>
              </div>
              <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">-{promo.discount}%</span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{t(promo.description)}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => handleToggle(promo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${promo.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {promo.active ? '✅ Active' : '❌ Inactive'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setForm(promo); setModal({ mode: 'edit' }); }}
                  className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(promo.id)}
                  className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มโปรโมชั่น' : 'แก้ไขโปรโมชั่น'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ชื่อ (ไทย) *"><input className={inp} value={form.title.th} onChange={e => setF(['title','th'], e.target.value)} /></Field>
              <Field label="ชื่อ (English)"><input className={inp} value={form.title.en} onChange={e => setF(['title','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำอธิบาย (ไทย)"><textarea className={inp} rows={2} value={form.description.th} onChange={e => setF(['description','th'], e.target.value)} /></Field>
              <Field label="คำอธิบาย (English)"><textarea className={inp} rows={2} value={form.description.en} onChange={e => setF(['description','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="ส่วนลด (%)"><input className={inp} type="number" value={form.discount} onChange={e => setF(['discount'], Number(e.target.value))} /></Field>
              <Field label="Promo Code"><input className={inp} value={form.code} onChange={e => setF(['code'], e.target.value)} placeholder="SAVE10" /></Field>
              <Field label="Badge"><input className={inp} value={form.badge} onChange={e => setF(['badge'], e.target.value)} placeholder="🔥 Hot Deal" /></Field>
            </div>
            <Field label="URL รูปภาพ"><input className={inp} value={form.image} onChange={e => setF(['image'], e.target.value)} placeholder="https://..." /></Field>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== REVIEWS =====
function ReviewsSection({ reviews, setReviews, tours, t }) {
  const handleApprove = async (id) => {
    const { error } = await approveReview(id, true);
    if (error) { alert('อนุมัติไม่สำเร็จ'); return; }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };
  const handleReject = async (id) => {
    if (!confirm('ลบรีวิวนี้?')) return;
    const { error } = await deleteReview(id);
    if (error) { alert('ลบไม่สำเร็จ'); return; }
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการรีวิว</h2>
      <div className="space-y-4">
        {reviews.map(review => {
          const tour = tours.find(tr => tr.id === review.tourId);
          return (
            <div key={review.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${review.approved ? 'border-green-400' : 'border-amber-400'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{review.name}</span>
                    <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${review.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {review.approved ? 'อนุมัติแล้ว' : 'รอการอนุมัติ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{tour ? t(tour.name) : ''}</p>
                  <p className="text-sm text-slate-600">{t(review.comment || review.text || {})}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!review.approved && (
                    <button onClick={() => handleApprove(review.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleReject(review.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {reviews.length === 0 && <p className="text-slate-400 text-sm">ยังไม่มีรีวิว</p>}
      </div>
    </div>
  );
}

// ===== ARTICLES =====
const EMPTY_ARTICLE = { title: { th: '', en: '' }, excerpt: { th: '', en: '' }, content: { th: '', en: '' }, image: '', category: { th: 'ท่องเที่ยว', en: 'Travel' }, author: 'Admin', readTime: 5, published: true };

function ArticlesSection({ articles, setArticles, t }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_ARTICLE);
  const [saving, setSaving] = useState(false);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  const handleSave = async () => {
    if (!form.title.th) return alert('กรุณากรอกชื่อบทความ');
    setSaving(true);
    const { data, error } = await upsertArticle(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setArticles(prev => modal.mode === 'add' ? [data, ...prev] : prev.map(a => a.id === data.id ? data : a));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบบทความนี้?')) return;
    const { error } = await deleteArticle(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการบทความ</h2>
        <button onClick={() => { setForm(EMPTY_ARTICLE); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มบทความ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <img src={article.image || article.coverImage} alt="" className="w-full h-32 object-cover bg-slate-100" />
            <div className="p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-1">{t(article.title)}</h3>
              <p className="text-xs text-slate-400 mb-3">{article.author} · {article.readTime || article.readingTime} นาที</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm(article); setModal({ mode: 'edit' }); }}
                  className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> แก้ไข
                </button>
                <button onClick={() => handleDelete(article.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มบทความ' : 'แก้ไขบทความ'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ชื่อบทความ (ไทย) *"><input className={inp} value={form.title.th} onChange={e => setF(['title','th'], e.target.value)} /></Field>
              <Field label="ชื่อบทความ (English)"><input className={inp} value={form.title.en} onChange={e => setF(['title','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำอธิบายย่อ (ไทย)"><textarea className={inp} rows={2} value={form.excerpt?.th || ''} onChange={e => setF(['excerpt','th'], e.target.value)} /></Field>
              <Field label="คำอธิบายย่อ (English)"><textarea className={inp} rows={2} value={form.excerpt?.en || ''} onChange={e => setF(['excerpt','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="เนื้อหา (ไทย)"><textarea className={inp} rows={4} value={form.content?.th || ''} onChange={e => setF(['content','th'], e.target.value)} /></Field>
              <Field label="เนื้อหา (English)"><textarea className={inp} rows={4} value={form.content?.en || ''} onChange={e => setF(['content','en'], e.target.value)} /></Field>
            </div>
            <Field label="URL รูปภาพ"><input className={inp} value={form.image || form.coverImage || ''} onChange={e => setF(['image'], e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ผู้เขียน"><input className={inp} value={form.author} onChange={e => setF(['author'], e.target.value)} /></Field>
              <Field label="เวลาอ่าน (นาที)"><input className={inp} type="number" value={form.readTime} onChange={e => setF(['readTime'], Number(e.target.value))} /></Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== FAQS =====
const EMPTY_FAQ = { question: { th: '', en: '' }, answer: { th: '', en: '' }, category: 'general', active: true, sortOrder: 0 };

function FaqsSection({ faqs, setFaqs, t }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_FAQ);
  const [saving, setSaving] = useState(false);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  const handleSave = async () => {
    if (!form.question.th) return alert('กรุณากรอกคำถาม');
    setSaving(true);
    const { data, error } = await upsertFaq(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setFaqs(prev => modal.mode === 'add' ? [...prev, data] : prev.map(f => f.id === data.id ? data : f));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบ FAQ นี้?')) return;
    const { error } = await deleteFaq(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleToggle = async (faq) => {
    const next = !faq.active;
    const { error } = await upsertFaq({ ...faq, active: next });
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, active: next } : f));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการ FAQ</h2>
        <button onClick={() => { setForm(EMPTY_FAQ); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่ม FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className="flex-1">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{faq.category}</span>
              <p className="text-sm font-semibold text-slate-700 mt-1">{t(faq.question)}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t(faq.answer)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleToggle(faq)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${faq.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {faq.active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => { setForm(faq); setModal({ mode: 'edit' }); }}
                className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(faq.id)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่ม FAQ' : 'แก้ไข FAQ'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำถาม (ไทย) *"><input className={inp} value={form.question.th} onChange={e => setF(['question','th'], e.target.value)} /></Field>
              <Field label="คำถาม (English)"><input className={inp} value={form.question.en} onChange={e => setF(['question','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำตอบ (ไทย)"><textarea className={inp} rows={3} value={form.answer.th} onChange={e => setF(['answer','th'], e.target.value)} /></Field>
              <Field label="คำตอบ (English)"><textarea className={inp} rows={3} value={form.answer.en} onChange={e => setF(['answer','en'], e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="หมวดหมู่">
                <select className={inp} value={form.category} onChange={e => setF(['category'], e.target.value)}>
                  {['general','booking','payment','visa','flight','hotel'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ลำดับ">
                <input className={inp} type="number" value={form.sortOrder} onChange={e => setF(['sortOrder'], Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== BOOKINGS =====
function BookingsSection({ bookings, setBookings, tours, t }) {
  const statusColor = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700' };

  const handleStatus = async (id, status) => {
    const { error } = await updateBookingStatus(id, status);
    if (error) { alert('อัปเดตสถานะไม่สำเร็จ'); return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">การจองทั้งหมด ({bookings.length})</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>{['ชื่อ','ทัวร์','จำนวน','ราคารวม','สถานะ','จัดการ'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map(b => {
              const tour = tours.find(tr => tr.id === b.tourId);
              const name = b.customer?.name || b.name || '-';
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{name}</td>
                  <td className="px-4 py-3 text-slate-500">{tour ? t(tour.name) : t(b.tourName) || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{b.travelers}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700">฿{(b.total || b.totalPrice || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[b.status] || 'bg-slate-100 text-slate-500'}`}>{b.status}</span></td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={e => handleStatus(b.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500">
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">ยังไม่มีการจอง</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== MESSAGES =====
function MessagesSection({ messages, setMessages }) {
  const handleRead = async (id) => {
    const { error } = await markMessageRead(id);
    if (error) { alert('อัปเดตไม่สำเร็จ'); return; }
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">ข้อความ ({messages.filter(m => !m.read).length} ใหม่)</h2>
      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${msg.read ? 'border-slate-200' : 'border-teal-500'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{msg.name}</span>
                  {!msg.read && <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">ใหม่</span>}
                </div>
                <p className="text-xs text-slate-400 mb-2">{msg.email} · {msg.phone}</p>
                <p className="text-sm text-slate-600">{msg.body || msg.message}</p>
              </div>
              {!msg.read && (
                <button onClick={() => handleRead(msg.id)}
                  className="ml-4 shrink-0 bg-teal-100 hover:bg-teal-200 text-teal-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5 inline mr-1" />อ่านแล้ว
                </button>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-slate-400 text-sm">ยังไม่มีข้อความ</p>}
      </div>
    </div>
  );
}

// ===== CHAT =====
function ChatSection() {
  const [sessions, setSessions]         = useState([]);
  const [activeId, setActiveId]         = useState(null);
  const [reply, setReply]               = useState('');
  const [newCount, setNewCount]         = useState({});
  const bottomRef                       = useRef(null);

  // Load sessions + subscribe Realtime
  useEffect(() => {
    fetchChatSessions().then(({ data }) => {
      if (data?.length) {
        setSessions(data);
        setActiveId(data[0]?.id || null);
      }
    });
    const unsubscribe = subscribeChatSessions((payload) => {
      const row = payload.new;
      if (!row) return;
      setSessions(prev => {
        const exists = prev.find(s => s.id === row.id);
        const updated = exists
          ? prev.map(s => s.id === row.id ? { ...s, ...row } : s)
          : [row, ...prev];
        return updated;
      });
      // Mark new message badge if not active
      setActiveId(curr => {
        if (curr !== row.id) {
          setNewCount(c => ({ ...c, [row.id]: (c[row.id] || 0) + 1 }));
        }
        return curr;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, sessions]);

  const session = sessions.find(s => s.id === activeId);

  const sendReply = async () => {
    if (!reply.trim() || !session) return;
    const msg = {
      id: Date.now(), sender: 'admin', text: reply,
      timestamp: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
    };
    const newMessages = [...(session.messages || []), msg];
    const prevMessages = session.messages || [];
    // Optimistic update
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, messages: newMessages } : s));
    setReply('');
    const { error } = await upsertChatSession({ id: session.id, visitor: session.visitor, messages: newMessages, status: session.status });
    if (error) {
      // Rollback on failure
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, messages: prevMessages } : s));
      setReply(msg.text);
      alert('ส่งข้อความไม่สำเร็จ');
    }
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setNewCount(c => ({ ...c, [id]: 0 }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Live Chat
        {Object.values(newCount).some(v => v > 0) && (
          <span className="ml-2 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">ใหม่!</span>
        )}
      </h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex" style={{ height: 520 }}>
        {/* Session list */}
        <div className="w-64 border-r border-slate-100 flex flex-col overflow-y-auto">
          {sessions.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              ยังไม่มีแชทเข้ามา
            </div>
          )}
          {sessions.map(s => (
            <button key={s.id} onClick={() => handleSelect(s.id)}
              className={`p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeId === s.id ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-slate-700 truncate">{s.visitor?.name}</div>
                {newCount[s.id] > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">{newCount[s.id]}</span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate">{s.visitor?.email}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'open' ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-xs text-slate-400">{s.status === 'open' ? 'กำลังคุย' : 'ปิดแล้ว'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {session ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-700">{session.visitor?.name}</div>
                  <div className="text-xs text-slate-400">{session.visitor?.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {session.status === 'open' ? '🟢 Online' : '⚫ Closed'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {(session.messages || []).map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-teal-700 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                      <div>{msg.text}</div>
                      <div className="text-xs mt-1 opacity-60">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t bg-white flex gap-2">
                <input className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ตอบกลับ..." value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button onClick={sendReply}
                  className="bg-teal-700 hover:bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
                  ส่ง
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
              <MessageSquare className="w-10 h-10 opacity-20" />
              <span>เลือก session เพื่อตอบกลับ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SETTINGS =====
function SettingsSection({ settings, setSettings, t }) {
  const [tab, setTab]       = useState('contact');
  const [saving, setSaving] = useState(false);

  const update = (path, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      path.reduce((obj, key, i) => { if (i === path.length - 1) obj[key] = value; return obj[key]; }, next);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateSettings({ contact: settings.contact, social: settings.social, popup: settings.popup });
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    alert('บันทึกเรียบร้อย ✅');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Site Settings</h2>
      <div className="flex gap-2 mb-6">
        {['contact','social'].map(tb => (
          <button key={tb} onClick={() => setTab(tb)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === tb ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {tb}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {tab === 'contact' && (
          <div className="space-y-4">
            {[
              { label: 'โทรศัพท์', key: 'phone' }, { label: 'Email', key: 'email' },
              { label: 'LINE ID', key: 'line' },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <input className={inp} value={settings.contact?.[f.key] || ''} onChange={e => update(['contact', f.key], e.target.value)} />
              </Field>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <Field label="ที่อยู่ (ไทย)">
                <input className={inp} value={settings.contact?.address?.th || ''} onChange={e => update(['contact','address','th'], e.target.value)} />
              </Field>
              <Field label="ที่อยู่ (English)">
                <input className={inp} value={settings.contact?.address?.en || ''} onChange={e => update(['contact','address','en'], e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-3">
            {(settings.social || []).map((s, i) => (
              <div key={s.platform} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: s.color }}>
                  {s.platform[0].toUpperCase()}
                </div>
                <span className="w-20 text-sm text-slate-600 capitalize shrink-0">{s.platform}</span>
                <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={`${s.platform} URL`} value={s.url}
                  onChange={e => { const next = [...settings.social]; next[i] = { ...next[i], url: e.target.value }; setSettings(p => ({ ...p, social: next })); }} />
                <button onClick={() => { const next = [...settings.social]; next[i] = { ...next[i], enabled: !next[i].enabled }; setSettings(p => ({ ...p, social: next })); }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.enabled ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="mt-6 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          {saving ? 'กำลังบันทึก...' : '💾 บันทึก Settings'}
        </button>
      </div>
    </div>
  );
}

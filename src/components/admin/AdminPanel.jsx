import { useState } from 'react';
import { LogOut, LayoutDashboard, Globe, Tag, Star, FileText, HelpCircle, MessageSquare, Mail, Settings, Plane, Check, X, Eye, Trash2 } from 'lucide-react';

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'tours', label: 'Tours', icon: Globe },
  { key: 'promotions', label: 'Promotions', icon: Tag },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'articles', label: 'Articles', icon: FileText },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'bookings', label: 'Bookings', icon: Plane },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'chat', label: 'Live Chat', icon: MessageSquare },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPanel(props) {
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [section, setSection] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(true);

  const { lang, t, setLang, tours, setTours, articles, setArticles, promotions, setPromotions,
    faqs, setFaqs, reviews, setReviews, bookings, messages, setMessages,
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
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Username" value={loginForm.user}
              onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))} />
            <input type="password" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Password" value={loginForm.pass}
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

  const unreadMsg = messages.filter(m => !m.read).length;
  const pendingReviews = reviews.filter(r => !r.approved).length;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className={`${sideOpen ? 'w-56' : 'w-16'} bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          {sideOpen && <span className="font-bold text-sm truncate">Wanderlust Admin</span>}
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
                  {key === 'messages' && unreadMsg > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadMsg}</span>}
                  {key === 'reviews' && pendingReviews > 0 && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingReviews}</span>}
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
        {/* Topbar */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard' && <DashboardSection tours={tours} articles={articles} bookings={bookings} messages={messages} reviews={reviews} chatSessions={chatSessions} />}
          {section === 'tours' && <ToursSection tours={tours} setTours={setTours} t={t} />}
          {section === 'promotions' && <PromotionsSection promotions={promotions} setPromotions={setPromotions} tours={tours} t={t} />}
          {section === 'reviews' && <ReviewsSection reviews={reviews} setReviews={setReviews} tours={tours} t={t} />}
          {section === 'articles' && <ArticlesSection articles={articles} setArticles={setArticles} t={t} />}
          {section === 'faqs' && <FaqsSection faqs={faqs} setFaqs={setFaqs} t={t} />}
          {section === 'bookings' && <BookingsSection bookings={bookings} tours={tours} t={t} />}
          {section === 'messages' && <MessagesSection messages={messages} setMessages={setMessages} />}
          {section === 'chat' && <ChatSection chatSessions={chatSessions} setChatSessions={setChatSessions} />}
          {section === 'settings' && <SettingsSection settings={settings} setSettings={setSettings} t={t} />}
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function DashboardSection({ tours, articles, bookings, messages, reviews, chatSessions }) {
  const stats = [
    { label: 'ทัวร์ทั้งหมด', value: tours.length, color: 'bg-teal-500' },
    { label: 'การจอง', value: bookings.length, color: 'bg-blue-500' },
    { label: 'บทความ', value: articles.length, color: 'bg-purple-500' },
    { label: 'รีวิวรอ', value: reviews.filter(r => !r.approved).length, color: 'bg-amber-500' },
    { label: 'ข้อความใหม่', value: messages.filter(m => !m.read).length, color: 'bg-red-500' },
    { label: 'แชทแอคทีฟ', value: chatSessions.filter(s => s.status === 'active').length, color: 'bg-green-500' },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold text-white ${s.color} rounded-xl py-2 mb-2`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4">การจองล่าสุด</h3>
        <p className="text-slate-400 text-sm">ดูรายการจองได้ที่เมนู Bookings</p>
      </div>
    </div>
  );
}

// ===== TOURS =====
function ToursSection({ tours, setTours, t }) {
  const [editing, setEditing] = useState(null);

  const toggleFeatured = (id) => {
    setTours(prev => prev.map(tr => tr.id === id ? { ...tr, featured: !tr.featured } : tr));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการทัวร์</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทัวร์</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทวีป</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ราคา</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ระยะเวลา</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Featured</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tours.map(tour => (
              <tr key={tour.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={tour.image} alt="" className="w-10 h-8 rounded object-cover" />
                    <span className="font-medium text-slate-700">{t(tour.name)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{tour.continent}</td>
                <td className="px-4 py-3 font-semibold text-teal-700">฿{tour.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{tour.duration} วัน</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(tour.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${tour.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {tour.featured ? '★ Featured' : 'ปกติ'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(tour.id)} className="text-teal-600 hover:text-teal-700 text-xs font-medium">แก้ไข</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== PROMOTIONS =====
function PromotionsSection({ promotions, setPromotions, tours, t }) {
  const toggleActive = (id) => setPromotions(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการโปรโมชั่น</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(promo => {
          const tour = tours.find(tr => tr.id === promo.tourId);
          return (
            <div key={promo.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{t(promo.title)}</h3>
                  <p className="text-xs text-slate-400">{tour ? t(tour.name) : ''}</p>
                </div>
                <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">-{promo.discount}%</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">{t(promo.description)}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">สิ้นสุด: {promo.endDate}</span>
                <button onClick={() => toggleActive(promo.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    promo.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-700'
                  }`}>
                  {promo.active ? '✅ Active' : '❌ Inactive'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== REVIEWS =====
function ReviewsSection({ reviews, setReviews, tours, t }) {
  const approve = (id) => setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  const reject = (id) => setReviews(prev => prev.filter(r => r.id !== id));

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
                  <p className="text-xs text-slate-400 mb-2">{tour ? t(tour.name) : ''} · {review.date}</p>
                  <p className="text-sm text-slate-600">{t(review.text)}</p>
                </div>
                {!review.approved && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => approve(review.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => reject(review.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== ARTICLES =====
function ArticlesSection({ articles, setArticles, t }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการบทความ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <img src={article.coverImage} alt="" className="w-full h-32 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-1">{t(article.title)}</h3>
              <p className="text-xs text-slate-400">{article.author} · {article.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== FAQS =====
function FaqsSection({ faqs, setFaqs, t }) {
  const toggleActive = (id) => setFaqs(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการ FAQ</h2>
      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{faq.category}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">{t(faq.question)}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t(faq.answer)}</p>
            </div>
            <button onClick={() => toggleActive(faq.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${faq.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {faq.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== BOOKINGS =====
function BookingsSection({ bookings, tours, t }) {
  const statusColor = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700' };
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">การจองทั้งหมด</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['ชื่อ','Email','ทัวร์','Tier','จำนวน','ราคารวม','สถานะ','วันที่'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map(b => {
              const tour = tours.find(tr => tr.id === b.tourId);
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{b.name}</td>
                  <td className="px-4 py-3 text-slate-500">{b.email}</td>
                  <td className="px-4 py-3 text-slate-500">{tour ? t(tour.name) : ''}</td>
                  <td className="px-4 py-3 text-slate-500">{b.tier}</td>
                  <td className="px-4 py-3 text-slate-500">{b.travelers}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700">฿{b.totalPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[b.status] || 'bg-slate-100 text-slate-500'}`}>{b.status}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{b.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== MESSAGES =====
function MessagesSection({ messages, setMessages }) {
  const markRead = (id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
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
                <p className="text-xs text-slate-400 mb-2">{msg.email} · {msg.phone} · {msg.date}</p>
                {msg.tourInterest && <p className="text-xs text-teal-600 mb-2">สนใจ: {msg.tourInterest}</p>}
                <p className="text-sm text-slate-600">{msg.message}</p>
              </div>
              {!msg.read && (
                <button onClick={() => markRead(msg.id)}
                  className="ml-4 shrink-0 bg-teal-100 hover:bg-teal-200 text-teal-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5 inline mr-1" />อ่านแล้ว
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CHAT =====
function ChatSection({ chatSessions, setChatSessions }) {
  const [activeSession, setActiveSession] = useState(chatSessions[0]?.id || null);
  const [reply, setReply] = useState('');

  const session = chatSessions.find(s => s.id === activeSession);

  const sendReply = () => {
    if (!reply.trim() || !activeSession) return;
    setChatSessions(prev => prev.map(s => s.id === activeSession ? {
      ...s,
      messages: [...s.messages, { id: Date.now(), sender: 'admin', text: reply, timestamp: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' }) }],
      unread: 0,
    } : s));
    setReply('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Live Chat</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex" style={{ height: 500 }}>
        {/* Session list */}
        <div className="w-64 border-r border-slate-100 flex flex-col">
          {chatSessions.map(s => (
            <button key={s.id} onClick={() => setActiveSession(s.id)}
              className={`p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeSession === s.id ? 'bg-teal-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-700">{s.visitorName}</span>
                {s.unread > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{s.unread}</span>}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{s.visitorEmail}</div>
              <span className={`text-xs ${s.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>● {s.status}</span>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {session ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="font-semibold text-slate-700">{session.visitorName}</div>
                <div className="text-xs text-slate-400">{session.visitorEmail}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {session.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${msg.sender === 'admin' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      {msg.text}
                      <div className="text-xs mt-1 opacity-60">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ตอบกลับ..." value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button onClick={sendReply} className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">ส่ง</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">เลือก session</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SETTINGS =====
function SettingsSection({ settings, setSettings, t }) {
  const [tab, setTab] = useState('contact');
  const update = (path, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      path.reduce((obj, key, i) => {
        if (i === path.length - 1) obj[key] = value;
        return obj[key];
      }, next);
      return next;
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Site Settings</h2>
      <div className="flex gap-2 mb-6">
        {['contact','social','popup'].map(tb => (
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
              { label: 'โทรศัพท์', key: 'phone' },
              { label: 'มือถือ', key: 'mobile' },
              { label: 'Email', key: 'email' },
              { label: 'LINE ID', key: 'line' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={settings.contact[f.key]}
                  onChange={e => update(['contact', f.key], e.target.value)} />
              </div>
            ))}
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-3">
            {settings.social.map((s, i) => (
              <div key={s.platform} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.color }}>
                  {s.platform[0].toUpperCase()}
                </div>
                <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={`${s.platform} URL`} value={s.url}
                  onChange={e => {
                    const next = [...settings.social];
                    next[i] = { ...next[i], url: e.target.value };
                    setSettings(p => ({ ...p, social: next }));
                  }} />
                <button onClick={() => {
                  const next = [...settings.social];
                  next[i] = { ...next[i], enabled: !next[i].enabled };
                  setSettings(p => ({ ...p, social: next }));
                }} className={`px-3 py-2 rounded-lg text-xs font-semibold ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.enabled ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'popup' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">แสดง Popup</label>
              <button onClick={() => update(['popup', 'enabled'], !settings.popup.enabled)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${settings.popup.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {settings.popup.enabled ? 'เปิด' : 'ปิด'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Announcement Bar</label>
              <button onClick={() => update(['popup', 'showAnnouncementBar'], !settings.popup.showAnnouncementBar)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${settings.popup.showAnnouncementBar ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {settings.popup.showAnnouncementBar ? 'เปิด' : 'ปิด'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ข้อความ Announcement (TH)</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={settings.popup.announcementText.th}
                onChange={e => update(['popup', 'announcementText', 'th'], e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

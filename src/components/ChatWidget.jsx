import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { upsertChatSession, subscribeChatSessions } from '../lib/db.js';

const QUICK_REPLIES = ['สนใจทัวร์ญี่ปุ่น', 'สนใจทัวร์ยุโรป', 'ต้องการใบเสนอราคา', 'ถามเรื่องวีซ่า'];

export default function ChatWidget({ lang, open, setOpen }) {
  const [visitor, setVisitor]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput]       = useState('');
  const [regForm, setRegForm]   = useState({ name: '', email: '' });
  const [unread, setUnread]     = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // ── Subscribe to admin replies via Supabase Realtime ──
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = subscribeChatSessions((payload) => {
      const row = payload.new;
      if (row?.id === sessionId) {
        setMessages(row.messages || []);
        if (!open) setUnread(prev => prev + 1);
      }
    });
    return unsubscribe;
  }, [sessionId, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // ── Start chat session ────────────────────────────────
  const startChat = async () => {
    if (!regForm.name.trim()) return;
    const welcomeMsg = {
      id: Date.now(), sender: 'admin',
      text: lang === 'th'
        ? `สวัสดีครับคุณ${regForm.name}! ยินดีต้อนรับสู่ WeCraftTravel ครับ มีอะไรให้ช่วยไหมครับ?`
        : `Hello ${regForm.name}! Welcome to WeCraftTravel. How can I help you?`,
      timestamp: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
    };
    const session = {
      visitor: { name: regForm.name, email: regForm.email },
      messages: [welcomeMsg],
      status: 'open',
    };
    const { data } = await upsertChatSession(session);
    const id = data?.id || String(Date.now());
    setSessionId(id);
    setVisitor(regForm);
    setMessages([welcomeMsg]);
  };

  // ── Send message ──────────────────────────────────────
  const sendMsg = async (text) => {
    if (!text.trim() || !sessionId) return;
    const msg = {
      id: Date.now(), sender: 'visitor', text,
      timestamp: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
    };
    const newMessages = [...messages, msg];
    setMessages(newMessages);
    setInput('');
    await upsertChatSession({ id: sessionId, visitor, messages: newMessages, status: 'open' });
  };

  const adminMsgCount = messages.filter(m => m.sender === 'admin' && m.id !== 1).length;

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-700 hover:bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all chat-bounce"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
          style={{ height: 460 }}>
          {/* Header */}
          <div className="bg-teal-700 text-white p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">WeCraftTravel</div>
              <div className="text-xs text-teal-200">🟢 Online</div>
            </div>
          </div>

          {!visitor ? (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <p className="text-sm text-slate-600 mb-4 text-center">
                {lang === 'th' ? 'กรุณาแนะนำตัวก่อนเริ่มสนทนาครับ' : 'Please introduce yourself before chatting.'}
              </p>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'th' ? 'ชื่อของคุณ *' : 'Your name *'}
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && startChat()}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'th' ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
              />
              <button
                onClick={startChat}
                className="bg-teal-700 hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {lang === 'th' ? 'เริ่มสนทนา' : 'Start Chat'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'visitor'
                        ? 'bg-teal-700 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      <div>{msg.text}</div>
                      <div className={`text-xs mt-0.5 ${msg.sender === 'visitor' ? 'text-teal-200' : 'text-slate-400'}`}>
                        {msg.timestamp || msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {messages.length <= 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1">
                  {QUICK_REPLIES.map(q => (
                    <button key={q} onClick={() => sendMsg(q)}
                      className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 px-2 py-1 rounded-full transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
                />
                <button onClick={() => sendMsg(input)}
                  className="w-9 h-9 bg-teal-700 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const QUICK_REPLIES = ['สนใจทัวร์ญี่ปุ่น', 'สนใจทัวร์ยุโรป', 'ต้องการใบเสนอราคา', 'ถามเรื่องวีซ่า'];

export default function ChatWidget({ lang, open, setOpen, visitor, setVisitor, messages, setMessages }) {
  const [input, setInput] = useState('');
  const [regForm, setRegForm] = useState({ name: '', email: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMsg = (text) => {
    if (!text.trim()) return;
    const msg = { id: Date.now(), sender: 'visitor', text, time: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(p => [...p, msg]);
    setInput('');
    // Auto-reply
    setTimeout(() => {
      setMessages(p => [...p, {
        id: Date.now() + 1,
        sender: 'admin',
        text: lang === 'th'
          ? 'ขอบคุณสำหรับข้อความครับ เจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้ครับ 😊'
          : 'Thank you for your message. Our staff will contact you shortly. 😊',
        time: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-700 hover:bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        style={{ animation: 'bounce 3s infinite' }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && messages.filter(m => m.sender === 'admin').length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {messages.filter(m => m.sender === 'admin').length}
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
              <div className="font-semibold text-sm">Wanderlust Tours</div>
              <div className="text-xs text-teal-200">🟢 Online</div>
            </div>
          </div>

          {!visitor ? (
            /* Registration form */
            <div className="flex-1 p-4 flex flex-col justify-center">
              <p className="text-sm text-slate-600 mb-4 text-center">
                {lang === 'th' ? 'กรุณาแนะนำตัวก่อนเริ่มสนทนาครับ' : 'Please introduce yourself before chatting.'}
              </p>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'th' ? 'ชื่อของคุณ' : 'Your name'}
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'th' ? 'อีเมลของคุณ' : 'Your email'}
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
              />
              <button
                onClick={() => {
                  if (!regForm.name) return;
                  setVisitor(regForm);
                  setMessages([{
                    id: 1, sender: 'admin',
                    text: lang === 'th'
                      ? `สวัสดีครับคุณ${regForm.name}! ยินดีต้อนรับสู่ Wanderlust Tours ครับ มีอะไรให้ช่วยเหลือไหมครับ?`
                      : `Hello ${regForm.name}! Welcome to Wanderlust Tours. How can I help you?`,
                    time: new Date().toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
                  }]);
                }}
                className="bg-teal-700 hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {lang === 'th' ? 'เริ่มสนทนา' : 'Start Chat'}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'visitor'
                        ? 'bg-teal-700 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      <div>{msg.text}</div>
                      <div className={`text-xs mt-0.5 ${msg.sender === 'visitor' ? 'text-teal-200' : 'text-slate-400'}`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
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

              {/* Input */}
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

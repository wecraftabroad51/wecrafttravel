import { useState, useRef, useEffect } from 'react';
import { upsertChatSession, subscribeChatSessions } from '../lib/db.js';

const QUICK_REPLIES = ['สนใจทัวร์ยุโรป', 'สนใจทัวร์ญี่ปุ่น', 'ต้องการใบเสนอราคา', 'ถามเรื่องวีซ่า'];

function Icon({ name, size = 18 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'chat':  return <svg {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>;
    case 'close': return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'send':  return <svg {...p}><path d="M3 11 21 4l-7 18-3-7-8-4z"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    default: return null;
  }
}

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

  // Subscribe to admin replies via Supabase Realtime
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

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', right: 24, bottom: 24, zIndex: 50,
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--canvas)',
          border: 'none', cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--accent)', border: '2px solid var(--canvas)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>{unread}</span>
        )}
        {!open && unread === 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent)', border: '2px solid var(--canvas)',
          }} />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', right: 24, bottom: 100, zIndex: 50,
          width: 340, height: 460, background: 'var(--card)',
          borderRadius: 'var(--r-lg)', border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--ink)', color: 'var(--canvas)', padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--primary)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14,
            }}>M</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {lang === 'th' ? 'ทีมงาน WeCraft' : 'Mod from WeCraft'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(244,239,230,.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#5fd97f', display: 'inline-block' }} />
                {lang === 'th' ? 'ตอบกลับใน ~10 นาที · 9:00–20:00 น.' : 'Replies in ~10 min · 9am–8pm Bangkok'}
              </div>
            </div>
          </div>

          {!visitor ? (
            <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--canvas)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}>
                {lang === 'th' ? 'กรุณาแนะนำตัวก่อนเริ่มสนทนาครับ' : 'Please introduce yourself before chatting.'}
              </p>
              <input
                placeholder={lang === 'th' ? 'ชื่อของคุณ *' : 'Your name *'}
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && startChat()}
                style={{ marginBottom: 8 }}
              />
              <input
                type="email"
                placeholder={lang === 'th' ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                style={{ marginBottom: 16 }}
              />
              <button
                onClick={startChat}
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                {lang === 'th' ? 'เริ่มสนทนา' : 'Start Chat'} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--canvas)' }}>
                {messages.map((msg, i) => (
                  <div key={msg.id || i} style={{
                    alignSelf: msg.sender === 'visitor' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: msg.sender === 'visitor' ? 'var(--ink)' : 'var(--card)',
                    color: msg.sender === 'visitor' ? 'var(--canvas)' : 'var(--ink)',
                    border: msg.sender === 'visitor' ? 'none' : '1px solid var(--line)',
                    fontSize: 13, lineHeight: 1.4,
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 10, opacity: .6, marginTop: 4 }}>{msg.timestamp || msg.time}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {messages.length <= 1 && (
                <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid var(--line)' }}>
                  {QUICK_REPLIES.map(q => (
                    <button key={q} onClick={() => sendMsg(q)}
                      style={{
                        fontSize: 11, padding: '5px 10px', borderRadius: 999,
                        background: 'var(--canvas-2)', border: '1px solid var(--line)',
                        color: 'var(--ink)', cursor: 'pointer',
                      }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ padding: 12, borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
                  placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message…'}
                  style={{ flex: 1, padding: '10px 12px' }}
                />
                <button
                  onClick={() => sendMsg(input)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0 14px' }}
                >
                  <Icon name="send" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

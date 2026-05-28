import { useState } from 'react';
import { insertMessage } from '../../lib/db.js';

function Icon({ name, size = 16, stroke = 1.6 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'plus':  return <svg {...p}><path d="M5 12h14M12 5v14"/></svg>;
    case 'phone': return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'line':  return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'mail':  return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
    default: return null;
  }
}

const CATEGORY_LABELS = {
  all:     { th: 'ทั้งหมด', en: 'All' },
  general: { th: 'ทั่วไป',  en: 'General' },
  booking: { th: 'การจอง', en: 'Booking' },
  flight:  { th: 'เที่ยวบิน', en: 'Flight' },
  hotel:   { th: 'ที่พัก',  en: 'Hotel' },
  payment: { th: 'การชำระ', en: 'Payment' },
  visa:    { th: 'วีซ่า',   en: 'Visa' },
};

export default function FAQPage({ lang, t, faqs, settings }) {
  const categories = ['all', ...['general','booking','payment','visa','flight','hotel'].filter(c =>
    faqs.some(f => f.active && f.category === c)
  )];
  const [cat, setCat] = useState('all');
  const [openIdx, setOpenIdx] = useState(0);
  const contact = settings?.contact || {};

  const filtered = faqs.filter(f =>
    f.active && (cat === 'all' || f.category === cat)
  );

  const catLabel = (c) => {
    const obj = CATEGORY_LABELS[c];
    return obj ? (lang === 'th' ? obj.th : obj.en) : c;
  };

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)' }}>
      {/* Hero */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="wrap-wide">
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 24 }}>
            <span>Home</span><span>/</span>
            <span style={{ color: 'var(--ink)' }}>FAQ</span>
          </nav>
          <div className="layout-hero" style={{ gap: 64, alignItems: 'end' }}>
            <h1 className="h-display">
              {lang === 'th' ? (
                <>คำตอบที่<br /><span className="serif-accent" style={{ color: 'var(--primary)' }}>ตรงไปตรงมา</span>.</>
              ) : (
                <>Honest<br /><span className="serif-accent" style={{ color: 'var(--primary)' }}>answers</span>.</>
              )}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 12, maxWidth: 360 }}>
              {lang === 'th'
                ? 'หาคำตอบไม่เจอ? ส่งข้อความหาเราผ่าน LINE หรืออีเมล — ตอบภายใน 1 ชั่วโมงในเวลาทำการ'
                : "Can't find what you're looking for? Message us on LINE or send a note — replies usually within an hour."}
            </p>
          </div>
        </div>
      </section>

      {/* 3-col layout */}
      <section style={{ padding: '32px 0 100px' }}>
        <div className="wrap-wide">
          <div className="layout-faq" style={{ gap: 48, alignItems: 'start' }}>

            {/* Left: category sidebar */}
            <aside className="sticky-aside">
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                {lang === 'th' ? 'หมวดหมู่' : 'Categories'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categories.map(c => {
                  const active = cat === c;
                  const count = c === 'all'
                    ? faqs.filter(f => f.active).length
                    : faqs.filter(f => f.active && f.category === c).length;
                  return (
                    <button key={c}
                      onClick={() => { setCat(c); setOpenIdx(0); }}
                      style={{
                        textAlign: 'left', padding: '10px 14px',
                        border: 'none',
                        background: active ? 'var(--ink)' : 'transparent',
                        color: active ? 'var(--canvas)' : 'var(--ink)',
                        borderRadius: 'var(--r-md)', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background .15s, color .15s',
                      }}>
                      <span>{catLabel(c)}</span>
                      <span style={{ fontSize: 11, opacity: .6 }} className="tabular">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Center: accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.length === 0 && (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)' }}>
                  {lang === 'th' ? 'ยังไม่มีคำถามในหมวดนี้' : 'No questions in this category yet.'}
                </div>
              )}
              {filtered.map((faq, i) => {
                const isOpen = openIdx === i;
                return (
                  <div key={faq.id} style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    background: isOpen ? 'var(--card-alt)' : 'var(--card)',
                    overflow: 'hidden',
                    transition: 'background .2s',
                  }}>
                    <button
                      onClick={() => setOpenIdx(isOpen ? -1 : i)}
                      style={{
                        display: 'flex', width: '100%',
                        justifyContent: 'space-between', alignItems: 'center',
                        padding: '22px 24px', background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 24,
                      }}>
                      <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.3 }}>
                        {t(faq.question)}
                      </span>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: '1px solid var(--line)', background: 'var(--card)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                        transition: 'transform .2s, background .2s',
                      }}>
                        <Icon name="plus" size={14} />
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 24px 24px', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 680 }}>
                        {t(faq.answer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: contact CTA */}
            <aside className="sticky-aside">
              <div style={{
                padding: 24, background: 'var(--ink)', color: 'var(--canvas)',
                borderRadius: 'var(--r-lg)',
              }}>
                <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>
                  {lang === 'th' ? 'ยังสงสัยอยู่?' : 'Still curious?'}
                </div>
                <h3 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {lang === 'th' ? 'ถามคนจริงๆ ได้เลย' : 'Ask a real human.'}
                </h3>
                <p style={{ fontSize: 13, opacity: .8, marginTop: 10, lineHeight: 1.5 }}>
                  {lang === 'th'
                    ? 'ทีมงานตอบกลับภายใน 1 ชั่วโมงในเวลาทำการ'
                    : 'Our specialists reply within an hour during business hours.'}
                </p>
                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href={`https://line.me/ti/p/~${contact.line || '@wecrafttravel'}`}
                    target="_blank" rel="noreferrer"
                    className="btn"
                    style={{ background: 'var(--accent)', color: '#fff', justifyContent: 'space-between', border: 'none' }}>
                    <span>LINE: {contact.line || '@wecrafttravel'}</span>
                    <Icon name="line" size={14} />
                  </a>
                  <a href={`tel:${contact.phone || ''}`}
                    className="btn"
                    style={{ background: 'transparent', color: 'var(--canvas)', borderColor: 'rgba(244,239,230,.3)', justifyContent: 'space-between' }}>
                    <span>{contact.phone || '+66 2 XXX XXXX'}</span>
                    <Icon name="phone" size={14} />
                  </a>
                  <a href={`mailto:${contact.email || ''}`}
                    className="btn"
                    style={{ background: 'transparent', color: 'var(--canvas)', borderColor: 'rgba(244,239,230,.3)', justifyContent: 'space-between' }}>
                    <span>{lang === 'th' ? 'ส่งอีเมล' : 'Send email'}</span>
                    <Icon name="mail" size={14} />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

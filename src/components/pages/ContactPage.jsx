import { useState } from 'react';
import { insertMessage } from '../../lib/db.js';

function Icon({ name, size = 16, stroke = 1.6 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right':  return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up-right': return <svg {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>;
    case 'check':        return <svg {...p}><path d="m5 13 4 4 10-10"/></svg>;
    case 'phone':        return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'mail':         return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
    case 'line':         return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'map-pin':      return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    default: return null;
  }
}

const TOPICS_EN = ['Tour inquiry', 'Custom itinerary', 'Group booking', 'Visa support', 'Press / partnership', 'Other'];
const TOPICS_TH = ['สอบถามทัวร์', 'ทัวร์แบบกำหนดเอง', 'จองกลุ่ม', 'ช่วยเรื่องวีซ่า', 'สื่อ / พาร์ทเนอร์', 'อื่นๆ'];

function ContactCard({ icon, label, value, sub, highlight }) {
  return (
    <div style={{
      padding: 22,
      background: highlight ? 'var(--ink)' : 'var(--card)',
      color: highlight ? 'var(--canvas)' : 'var(--ink)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      display: 'flex', gap: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: highlight ? 'var(--accent)' : 'var(--canvas-2)',
        color: highlight ? '#fff' : 'var(--ink)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
          opacity: highlight ? .6 : 1,
          color: highlight ? 'var(--canvas)' : 'var(--muted)',
        }}>
          {label}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, letterSpacing: '-0.005em' }}>{value}</div>
        <div style={{
          fontSize: 12, marginTop: 4,
          opacity: highlight ? .7 : 1,
          color: highlight ? 'var(--canvas)' : 'var(--muted)',
        }}>{sub}</div>
      </div>
    </div>
  );
}

export default function ContactPage({ lang, t, settings, setMessages }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', topic: '' });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const contact = settings?.contact || {};

  const topics = lang === 'th' ? TOPICS_TH : TOPICS_EN;
  const activeTopic = form.topic || topics[0];

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSaving(true);
    const msg = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      body: `[${activeTopic}] ${form.message}`,
      read: false,
      date: new Date().toISOString().split('T')[0],
    };
    const { error } = await insertMessage(msg);
    if (!error) {
      setMessages(prev => [{ id: Date.now(), ...msg }, ...prev]);
      setSent(true);
    } else {
      alert(lang === 'th' ? 'ส่งไม่สำเร็จ กรุณาลองใหม่' : 'Failed to send. Please try again.');
    }
    setSaving(false);
  };

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)' }}>
      {/* Hero */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="wrap-wide">
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 24 }}>
            <span>Home</span><span>/</span>
            <span style={{ color: 'var(--ink)' }}>{lang === 'th' ? 'ติดต่อเรา' : 'Contact'}</span>
          </nav>
          <div className="layout-hero" style={{ gap: 64, alignItems: 'end' }}>
            <h1 className="h-display">
              {lang === 'th' ? (
                <>มาวางแผน<br />การเดินทาง<br /><span className="serif-accent" style={{ color: 'var(--primary)' }}>ด้วยกัน</span>.</>
              ) : (
                <>Let's plan<br />something<br /><span className="serif-accent" style={{ color: 'var(--primary)' }}>together</span>.</>
              )}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 12, maxWidth: 360 }}>
              {lang === 'th'
                ? 'เปิดทำการทุกวัน 9.00–20.00 น. (ตามเวลากรุงเทพ) ตอบ LINE ภายใน 10 นาทีในเวลาทำการ'
                : 'Office hours 9am–8pm Bangkok, every day. We reply on LINE in under an hour during those hours.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '32px 0 80px' }}>
        <div className="wrap-wide">
          <div className="layout-feat" style={{ gap: 32, alignItems: 'start' }}>

            {/* Form */}
            <div style={{
              background: 'var(--card)', borderRadius: 'var(--r-xl)',
              border: '1px solid var(--line)', padding: 40,
            }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    <Icon name="check" size={28} />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 12 }}>
                    {lang === 'th' ? 'ส่งสำเร็จแล้ว!' : 'Message sent!'}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 28px' }}>
                    {lang === 'th'
                      ? 'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมงในวันทำการ'
                      : 'Our team will contact you within 24 hours on business days.'}
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '', topic: '' }); }}
                    className="btn btn-ghost">
                    {lang === 'th' ? 'ส่งข้อความอีกครั้ง' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="eyebrow">{lang === 'th' ? 'ส่งข้อความ' : 'Send us a note'}</div>
                  <h2 className="h-2" style={{ marginTop: 10, marginBottom: 24 }}>
                    {lang === 'th' ? 'เราช่วยอะไรได้บ้าง?' : 'What can we help with?'}
                  </h2>

                  {/* Topic chips */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
                    {topics.map(tp => (
                      <button key={tp}
                        onClick={() => setForm(p => ({ ...p, topic: tp }))}
                        style={{
                          padding: '8px 14px', borderRadius: 999,
                          border: `1px solid ${activeTopic === tp ? 'var(--ink)' : 'var(--line)'}`,
                          background: activeTopic === tp ? 'var(--ink)' : 'transparent',
                          color: activeTopic === tp ? 'var(--canvas)' : 'var(--ink)',
                          fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                          transition: 'all .15s',
                        }}>{tp}</button>
                    ))}
                  </div>

                  <div className="layout-half" style={{ gap: 12 }}>
                    <div>
                      <label>{lang === 'th' ? 'ชื่อ-นามสกุล *' : 'Full name *'}</label>
                      <input type="text"
                        placeholder={lang === 'th' ? 'ชื่อของคุณ' : 'Your full name'}
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        style={{ marginTop: 6 }} />
                    </div>
                    <div>
                      <label>Email *</label>
                      <input type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        style={{ marginTop: 6 }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label>{lang === 'th' ? 'เบอร์โทร (ไม่บังคับ)' : 'Phone (optional)'}</label>
                      <input type="tel"
                        placeholder="+66"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        style={{ marginTop: 6 }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label>{lang === 'th' ? 'รายละเอียด *' : 'Tell us a little *'}</label>
                      <textarea
                        placeholder={lang === 'th'
                          ? 'วันที่ต้องการเดินทาง จำนวนคน ปลายทางที่สนใจ...'
                          : 'Dates, destinations, group size, anything already booked…'}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        rows={6}
                        style={{ marginTop: 6, resize: 'vertical' }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 340, lineHeight: 1.5 }}>
                      {lang === 'th'
                        ? 'เราจะไม่เปิดเผยข้อมูลของคุณแก่บุคคลภายนอก'
                        : 'By sending, you agree to our privacy policy. We never share details with third parties.'}
                    </p>
                    <button
                      onClick={submit}
                      disabled={!form.name || !form.email || !form.message || saving}
                      className="btn btn-primary btn-lg"
                      style={{ opacity: (!form.name || !form.email || !form.message) ? .4 : 1 }}>
                      {saving
                        ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending…')
                        : (lang === 'th' ? 'ส่งข้อความ' : 'Send message')}
                      <Icon name="arrow-right" size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Contact cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ContactCard
                icon="line" label="LINE OA"
                value={contact.line || '@wecrafttravel'}
                sub={lang === 'th' ? 'ช่องทางเร็วที่สุด · ตอบใน ~10 นาที' : 'Fastest channel · ~10 min replies'}
                highlight />
              <ContactCard
                icon="phone"
                label={lang === 'th' ? 'โทรศัพท์' : 'Call us'}
                value={contact.phone || '+66 2 XXX XXXX'}
                sub={lang === 'th' ? 'ทุกวัน 9.00–20.00 น.' : '9am–8pm Bangkok, every day'} />
              <ContactCard
                icon="mail" label="Email"
                value={contact.email || 'hello@wecrafttravel.co'}
                sub={lang === 'th' ? 'ตอบกลับภายใน 1 วันทำการ' : 'Replies within 1 business day'} />
              <ContactCard
                icon="map-pin"
                label={lang === 'th' ? 'ที่ตั้ง' : 'Studio'}
                value={t(contact.address) || 'Bangkok, Thailand'}
                sub={lang === 'th' ? 'นัดหมายล่วงหน้าก่อนมา' : 'Visits by appointment only'} />
            </div>
          </div>

          {/* Stylised map */}
          <div style={{
            marginTop: 32, height: 320, borderRadius: 'var(--r-xl)',
            overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #c8d6cf, #e8e2d4)',
            border: '1px solid var(--line)',
          }}>
            <svg viewBox="0 0 1200 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <defs>
                <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(10,31,26,.06)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapgrid)" />
              <path d="M0 160 C300 100, 700 230, 1200 130" stroke="var(--canvas)" strokeWidth="32" fill="none"/>
              <path d="M0 160 C300 100, 700 230, 1200 130" stroke="rgba(10,31,26,.15)" strokeWidth="1" fill="none"/>
              <path d="M600 0 L600 320" stroke="var(--canvas)" strokeWidth="20"/>
              <path d="M600 0 L600 320" stroke="rgba(10,31,26,.15)" strokeWidth="1"/>
              <path d="M200 0 L200 320" stroke="var(--canvas)" strokeWidth="12" opacity=".8"/>
              <path d="M900 0 L900 320" stroke="var(--canvas)" strokeWidth="12" opacity=".8"/>
              <rect x="700" y="40" width="160" height="100" rx="10" fill="rgba(14,102,85,.2)"/>
              <rect x="250" y="190" width="200" height="100" rx="10" fill="rgba(14,102,85,.15)"/>
            </svg>

            {/* Pin */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)' }}>
              <div style={{
                background: 'var(--ink)', color: 'var(--canvas)',
                padding: '10px 14px', borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: 'var(--shadow-lg)', whiteSpace: 'nowrap',
              }}>
                <Icon name="map-pin" size={14} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>WeCraft Studio</div>
                  <div style={{ fontSize: 11, opacity: .7 }}>
                    {t(contact.address) || 'Bangkok, Thailand'}
                  </div>
                </div>
              </div>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--accent)', border: '3px solid var(--canvas)',
                margin: '8px auto 0', boxShadow: '0 4px 8px rgba(0,0,0,.2)',
              }} />
            </div>

            <button
              style={{
                position: 'absolute', right: 20, bottom: 20,
                padding: '10px 18px', borderRadius: 999,
                background: 'var(--ink)', color: 'var(--canvas)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
              onClick={() => window.open('https://maps.google.com', '_blank')}>
              {lang === 'th' ? 'เปิด Google Maps' : 'Open in Maps'}
              <Icon name="arrow-up-right" size={13} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

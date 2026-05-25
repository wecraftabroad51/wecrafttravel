import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function ContactPage({ lang, t, settings, setMessages }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', tourInterest: '', message: '' });
  const [sent, setSent] = useState(false);
  const { contact } = settings;

  const submit = () => {
    if (!form.name || !form.email || !form.message) return;
    setMessages(prev => [...prev, { id: Date.now(), ...form, read: false, date: new Date().toISOString().split('T')[0] }]);
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t({ th: 'ติดต่อเรา', en: 'Contact Us' })}</h1>
        <p className="text-slate-500">{t({ th: 'เราพร้อมให้คำปรึกษาและช่วยเหลือคุณทุกวัน', en: 'We are ready to advise and assist you every day' })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info */}
        <div className="space-y-6">
          {[
            { icon: Phone, label: t({ th: 'โทรศัพท์', en: 'Phone' }), value: `${contact.phone} / ${contact.mobile}` },
            { icon: Mail, label: 'Email', value: contact.email },
            { icon: MessageCircle, label: 'LINE', value: contact.line },
            { icon: MapPin, label: t({ th: 'ที่ตั้ง', en: 'Location' }), value: t(contact.address) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                <div className="text-sm text-slate-700 font-medium">{value}</div>
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden h-48 bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-teal-400" />
              <p>Google Maps</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {t({ th: 'ส่งข้อความสำเร็จ!', en: 'Message Sent!' })}
              </h3>
              <p className="text-slate-500 text-sm">
                {t({ th: 'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง', en: 'Our team will contact you within 24 hours.' })}
              </p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', tourInterest: '', message: '' }); }}
                className="mt-6 text-teal-700 hover:text-teal-600 font-medium transition-colors">
                {t({ th: 'ส่งข้อความอีก', en: 'Send another message' })}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg mb-4">{t({ th: 'ส่งข้อความถึงเรา', en: 'Send us a message' })}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t({ th: 'ชื่อ-นามสกุล *', en: 'Full Name *' })}</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t({ th: 'เบอร์โทร', en: 'Phone' })}</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t({ th: 'ทัวร์ที่สนใจ', en: 'Tour of interest' })}</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.tourInterest} onChange={e => setForm(p => ({ ...p, tourInterest: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t({ th: 'ข้อความ *', en: 'Message *' })}</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none"
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button onClick={submit} disabled={!form.name || !form.email || !form.message}
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
                <Send className="w-4 h-4" /> {t({ th: 'ส่งข้อความ', en: 'Send Message' })}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

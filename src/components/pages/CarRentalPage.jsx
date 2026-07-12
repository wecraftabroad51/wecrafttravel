import { useState, useEffect, useRef } from 'react';
import { insertMessage } from '../../lib/db.js';
import DateRangePicker from '../DateRangePicker.jsx';
import FileUploadRows from '../FileUploadRows.jsx';
import BookNext from '../BookNext.jsx';

const RENTAL_TYPES = [
  { value: 'domestic',  th: 'ในประเทศ',       en: 'Domestic' },
  { value: 'international', th: 'ต่างประเทศ', en: 'International' },
  { value: 'airport',   th: 'รับ-ส่งสนามบิน', en: 'Airport Transfer' },
];

const CAR_TYPES = [
  { value: 'sedan-s',  th: 'เก๋งขนาดเล็ก',    en: 'Small Sedan' },
  { value: 'sedan-l',  th: 'เก๋งขนาดใหญ่',    en: 'Large Sedan' },
  { value: 'suv',      th: 'SUV',              en: 'SUV' },
  { value: 'van',      th: 'Van/Minivan',      en: 'Van/Minivan' },
  { value: 'van12',    th: 'รถตู้ 12 ที่นั่ง', en: '12-Seat Van' },
];

function Label({ th, en, lang, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#444' }}>
      {lang === 'en' ? en : th}{required && <span style={{ color: '#e65c00', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        width: '100%', padding: '10px 12px', border: '1px solid #ddd',
        borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
        boxSizing: 'border-box', ...style,
      }}
      {...props}
    />
  );
}

function RadioGroup({ options, value, onChange, lang }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <label key={opt.value} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          cursor: 'pointer', fontSize: 13, padding: '7px 14px',
          border: `1px solid ${value === opt.value ? 'var(--primary, #e65c00)' : '#ddd'}`,
          borderRadius: 20,
          background: value === opt.value ? '#fff3e0' : '#fff',
          color: value === opt.value ? 'var(--primary, #e65c00)' : '#555',
          fontWeight: value === opt.value ? 700 : 400,
          transition: 'all .15s',
        }}>
          <input type="radio" value={opt.value} checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ accentColor: 'var(--primary, #e65c00)', margin: 0 }} />
          {lang === 'en' ? opt.en : opt.th}
        </label>
      ))}
    </div>
  );
}

const INIT_OTP = { sent: false, token: '', code: '', verified: false, loading: false, error: '', countdown: 0 };

function isValidPhone(ph) { return /^0[0-9]{9}$/.test(ph.replace(/[\s\-().]/g, '')); }
function isValidEmail(em) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em); }

function OtpBox({ label, otp, onRequest, onVerify, onCodeChange, onReset }) {
  return (
    <div style={{ marginTop: 8 }}>
      {!otp.verified ? (
        !otp.sent ? (
          <button type="button" onClick={onRequest} disabled={otp.loading}
            style={{ padding: '7px 16px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: otp.loading ? 'wait' : 'pointer', background: otp.loading ? '#ccc' : '#1a5276', color: '#fff', border: 'none', fontFamily: 'inherit' }}>
            {otp.loading ? '⏳ กำลังส่ง...' : `📲 ขอรหัส OTP ทาง${label}`}
          </button>
        ) : (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 700, marginBottom: 8 }}>📨 ส่งรหัส OTP ไปยัง{label}แล้ว (หมดอายุใน 5 นาที)</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" inputMode="numeric" maxLength={6} value={otp.code}
                onChange={e => onCodeChange(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="______" autoComplete="one-time-code"
                style={{ width: 130, padding: '8px 10px', border: '2px solid #38bdf8', borderRadius: 6, fontSize: 20, fontWeight: 800, letterSpacing: 8, fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box' }} />
              <button type="button" onClick={onVerify} disabled={otp.loading || otp.code.length < 6}
                style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: (otp.loading || otp.code.length < 6) ? 'not-allowed' : 'pointer', background: (otp.loading || otp.code.length < 6) ? '#ccc' : '#0d7c5f', color: '#fff', border: 'none', fontFamily: 'inherit' }}>
                {otp.loading ? '⏳' : 'ยืนยัน'}
              </button>
              {otp.countdown > 0
                ? <span style={{ fontSize: 11, color: '#888' }}>ขอใหม่ได้ใน {otp.countdown}s</span>
                : <button type="button" onClick={onRequest} disabled={otp.loading} style={{ fontSize: 11, color: '#1a5276', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>ขอรหัสใหม่</button>}
            </div>
            {otp.error && <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>⚠ {otp.error}</div>}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✅ ยืนยัน{label}สำเร็จแล้ว</span>
          <button type="button" onClick={onReset} style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>เปลี่ยน{label}</button>
        </div>
      )}
    </div>
  );
}

const sendNotifications = async (subject, html, formData, customerEmail) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html, formData, customerEmail }),
    });
    const data = await res.json();
    if (!res.ok) console.error('Notification error:', data.error);
    else console.log('Notifications:', data.results);
  } catch (err) {
    console.error('Notification fetch error:', err.message);
  }
};

export default function CarRentalPage({ lang, t, navigate, setBookings }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    rentalType: 'domestic',
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    carType: 'sedan-s',
    passengers: 1,
    note: '',
  });
  const [driveFiles, setDriveFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [phoneOtp, setPhoneOtp] = useState({ ...INIT_OTP });
  const [emailOtp, setEmailOtp] = useState({ ...INIT_OTP });
  const phoneTimerRef = useRef(null);
  const emailTimerRef = useRef(null);

  useEffect(() => () => {
    if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
    if (emailTimerRef.current) clearInterval(emailTimerRef.current);
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const isAirport = form.rentalType === 'airport';

  function startCountdown(setter, timerRef, seconds = 60) {
    if (timerRef.current) clearInterval(timerRef.current);
    setter(prev => ({ ...prev, countdown: seconds }));
    timerRef.current = setInterval(() => {
      setter(prev => {
        if (prev.countdown <= 1) { clearInterval(timerRef.current); return { ...prev, countdown: 0 }; }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  const requestOtp = async (type) => {
    const target = type === 'phone' ? form.phone.replace(/[\s\-().]/g,'') : form.email.trim();
    const setter = type === 'phone' ? setPhoneOtp : setEmailOtp;
    const timerRef = type === 'phone' ? phoneTimerRef : emailTimerRef;
    if (type === 'phone' && !isValidPhone(form.phone)) { setter(prev => ({ ...prev, error: 'เบอร์โทรไม่ถูกต้อง' })); return; }
    if (type === 'email' && !isValidEmail(form.email)) { setter(prev => ({ ...prev, error: 'รูปแบบอีเมลไม่ถูกต้อง' })); return; }
    setter(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', type, target }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ส่ง OTP ไม่สำเร็จ');
      setter(prev => ({ ...prev, loading: false, sent: true, token: data.token, code: '', error: '' }));
      startCountdown(setter, timerRef, 60);
    } catch (e) { setter(prev => ({ ...prev, loading: false, error: e.message })); }
  };

  const verifyOtp = async (type) => {
    const otp = type === 'phone' ? phoneOtp : emailOtp;
    const target = type === 'phone' ? form.phone.replace(/[\s\-().]/g,'') : form.email.trim();
    const setter = type === 'phone' ? setPhoneOtp : setEmailOtp;
    const timerRef = type === 'phone' ? phoneTimerRef : emailTimerRef;
    setter(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', type, target, otp: otp.code, token: otp.token }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'รหัส OTP ไม่ถูกต้อง');
      if (timerRef.current) clearInterval(timerRef.current);
      setter(prev => ({ ...prev, loading: false, verified: true, error: '' }));
    } catch (e) { setter(prev => ({ ...prev, loading: false, error: e.message })); }
  };

  const canSubmit = phoneOtp.verified && emailOtp.verified && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const th = lang !== 'en';
    if (!form.fullName || !form.phone || !form.pickupDate || !form.pickupLocation) {
      setError(th ? 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, เบอร์โทร, วันรับรถ, สถานที่รับรถ)' : 'Please fill in required fields.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError(th ? 'เบอร์โทรไม่ถูกต้อง (ต้อง 10 หลัก ขึ้นต้นด้วย 0 เช่น 081-234-5678)' : 'Invalid phone number (must be 10 digits starting with 0).');
      return;
    }
    if (!form.email || !isValidEmail(form.email)) {
      setError(th ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Please enter a valid email address.');
      return;
    }
    if (!phoneOtp.verified) { setError(th ? 'กรุณายืนยันเบอร์โทรด้วย OTP ก่อนส่งข้อมูล' : 'Please verify your phone number via OTP first.'); return; }
    if (!emailOtp.verified) { setError(th ? 'กรุณายืนยันอีเมลด้วย OTP ก่อนส่งข้อมูล' : 'Please verify your email via OTP first.'); return; }
    // Pickup date — must be today or future
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(form.pickupDate) < today) {
      setError(th ? 'วันรับรถต้องเป็นวันปัจจุบันหรืออนาคต' : 'Pickup date must be today or in the future.');
      return;
    }
    // Return date — must be after pickup date
    if (form.returnDate && form.returnDate <= form.pickupDate) {
      setError(th ? 'วันคืนรถต้องเป็นวันหลังจากวันรับรถ' : 'Return date must be after pickup date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // ── 1. Generate sequence number ─────────────────────────────
      let seqNo = '';
      try {
        const seqRes = await fetch('/api/gen-seqno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'car-rental' }),
        });
        const seqData = await seqRes.json();
        if (seqRes.ok && seqData.seqNo) seqNo = seqData.seqNo;
      } catch (e) {
        console.warn('gen-seqno failed:', e.message);
      }

      const rentalLabelMsg = RENTAL_TYPES.find(r => r.value === form.rentalType)?.th || form.rentalType;
      const carLabelMsg = CAR_TYPES.find(c => c.value === form.carType)?.th || form.carType;
      const messageBody = [
        seqNo ? `หมายเลขอ้างอิง: ${seqNo}` : null,
        `ประเภท: รถเช่า`,
        `เบอร์โทร: ${form.phone}`,
        `อีเมล: ${form.email || '-'}`,
        `ประเภทรถเช่า: ${rentalLabelMsg}`,
        `วันที่รับรถ: ${form.pickupDate}`,
        form.returnDate ? `วันที่คืนรถ: ${form.returnDate}` : null,
        `สถานที่รับรถ: ${form.pickupLocation}`,
        `ประเภทรถ: ${carLabelMsg}`,
        `จำนวนผู้โดยสาร: ${form.passengers} คน`,
        form.note ? `หมายเหตุ: ${form.note}` : null,
      ].filter(Boolean).join('\n');

      const res = await insertMessage({
        name:          form.fullName,
        email:         form.email || '',
        phone:         form.phone,
        tour_interest: `รถเช่า — ${rentalLabelMsg}`,
        message:       messageBody,
        date:          new Date().toISOString().split('T')[0],
      });
      if (res.error && res.error !== 'offline') throw new Error(JSON.stringify(res.error));

      const rentalLabel = RENTAL_TYPES.find(r => r.value === form.rentalType)?.th || form.rentalType;
      const carLabel = CAR_TYPES.find(c => c.value === form.carType)?.th || form.carType;
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#1a5276,#e65c00);color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center">
            <h2 style="margin:0;font-size:20px">🚗 คำขอเช่ารถ</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
            <tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">ข้อมูลผู้ติดต่อ</td></tr>
            <tr><td style="padding:8px 16px;color:#666;width:40%">ชื่อ-นามสกุล</td><td style="padding:8px 16px;font-weight:600">${form.fullName}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เบอร์โทร</td><td style="padding:8px 16px;font-weight:600">${form.phone}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">อีเมล</td><td style="padding:8px 16px">${form.email || '-'}</td></tr>
            <tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">รายละเอียดการเช่า</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ประเภทรถเช่า</td><td style="padding:8px 16px;font-weight:600">${rentalLabel}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">วันที่รับรถ</td><td style="padding:8px 16px;font-weight:600">${form.pickupDate}</td></tr>
            ${form.returnDate ? `<tr><td style="padding:8px 16px;color:#666">วันที่คืนรถ</td><td style="padding:8px 16px">${form.returnDate}</td></tr>` : ''}
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">สถานที่รับรถ</td><td style="padding:8px 16px">${form.pickupLocation}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ประเภทรถ</td><td style="padding:8px 16px">${carLabel}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">จำนวนผู้โดยสาร</td><td style="padding:8px 16px;font-weight:700;color:#e65c00">${form.passengers} คน</td></tr>
            ${form.note ? `<tr><td style="padding:8px 16px;color:#666">ข้อมูลเพิ่มเติม</td><td style="padding:8px 16px">${form.note}</td></tr>` : ''}
          </table>
          <p style="font-size:12px;color:#aaa;text-align:center;margin-top:12px">We Craft Travel · We Craft Happiness</p>
        </div>`;
      await sendNotifications(
        `[รถเช่า] ${form.fullName} — ${rentalLabel} ${form.pickupDate}`,
        emailHtml,
        { ...form, _type: 'car-rental', rentalLabel, carLabel, driveFiles, _seqNo: seqNo || undefined },
        form.email || undefined
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccess(true);
    } catch (err) {
      setError(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #eee' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚗</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: '#333' }}>
            {lang === 'th' ? 'ส่งคำขอสำเร็จ!' : 'Request Submitted!'}
          </h2>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
            {lang === 'th'
              ? 'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง เพื่อยืนยันรายละเอียดการเช่ารถ'
              : 'Our team will contact you within 24 hours to confirm your car rental details.'}
          </p>
          <button onClick={() => navigate('home')}
            style={{ marginTop: 24, background: 'var(--primary, #e65c00)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </button>
          <BookNext current="car-rental" navigate={navigate} lang={lang} />
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276, var(--primary, #e65c00))', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🚗</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          {lang === 'th' ? 'บริการรถเช่า' : 'Car Rental Service'}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 15 }}>
          {lang === 'th' ? 'เช่ารถในประเทศ ต่างประเทศ และรับ-ส่งสนามบิน' : 'Domestic, international rental & airport transfers'}
        </p>
      </div>

      {/* Form */}
      <div className="wrap" style={{ maxWidth: 720, padding: '40px 20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Contact Info */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'ข้อมูลผู้ติดต่อ' : 'Contact Information'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="ชื่อ-นามสกุล" en="Full Name" lang={lang} required />
                <Input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder={lang === 'th' ? 'ชื่อ นามสกุล' : 'Full name'} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="เบอร์โทรศัพท์" en="Phone Number" lang={lang} required />
                <Input type="tel" value={form.phone}
                  onChange={e => { set('phone', e.target.value); setPhoneOtp({ ...INIT_OTP }); if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); }}
                  placeholder="08X-XXX-XXXX" style={{ borderColor: phoneOtp.verified ? '#16a34a' : '#ddd' }} />
                <OtpBox label="SMS" otp={phoneOtp}
                  onRequest={() => requestOtp('phone')} onVerify={() => verifyOtp('phone')}
                  onCodeChange={v => setPhoneOtp(p => ({ ...p, code: v }))}
                  onReset={() => { setPhoneOtp({ ...INIT_OTP }); if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="อีเมล" en="Email" lang={lang} required />
                <Input type="email" value={form.email}
                  onChange={e => { set('email', e.target.value); setEmailOtp({ ...INIT_OTP }); if (emailTimerRef.current) clearInterval(emailTimerRef.current); }}
                  placeholder="email@example.com" style={{ borderColor: emailOtp.verified ? '#16a34a' : '#ddd' }} />
                <OtpBox label="อีเมล" otp={emailOtp}
                  onRequest={() => requestOtp('email')} onVerify={() => verifyOtp('email')}
                  onCodeChange={v => setEmailOtp(p => ({ ...p, code: v }))}
                  onReset={() => { setEmailOtp({ ...INIT_OTP }); if (emailTimerRef.current) clearInterval(emailTimerRef.current); }} />
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'รายละเอียดการเช่า' : 'Rental Details'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <Label th="ประเภทรถเช่า" en="Car Rental Type" lang={lang} required />
              <RadioGroup options={RENTAL_TYPES} value={form.rentalType} onChange={v => set('rentalType', v)} lang={lang} />
            </div>
            <div style={{ marginBottom: 16 }}>
              {isAirport ? (
                <div>
                  <Label th="วันที่รับรถ" en="Pickup Date" lang={lang} required />
                  <DateRangePicker
                    startDate={form.pickupDate} endDate=""
                    onStartChange={v => set('pickupDate', v)} onEndChange={() => {}}
                    startLabel={lang === 'th' ? 'วันที่รับรถ' : 'Pickup Date'}
                    endLabel="" minDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
              ) : (
                <DateRangePicker
                  startDate={form.pickupDate} endDate={form.returnDate}
                  onStartChange={v => set('pickupDate', v)} onEndChange={v => set('returnDate', v)}
                  startLabel={lang === 'th' ? 'วันที่รับรถ' : 'Pickup Date'}
                  endLabel={lang === 'th' ? 'วันที่คืนรถ' : 'Return Date'}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label th={isAirport ? 'จุดรับ / สนามบิน' : 'สถานที่รับรถ'} en={isAirport ? 'Pickup Point / Airport' : 'Pickup Location'} lang={lang} required />
              <Input value={form.pickupLocation} onChange={e => set('pickupLocation', e.target.value)}
                placeholder={lang === 'th'
                  ? (isAirport ? 'เช่น สนามบินสุวรรณภูมิ ผู้โดยสารขาออก' : 'เช่น โรงแรม XYZ กรุงเทพฯ')
                  : (isAirport ? 'e.g. Suvarnabhumi Airport, Departures' : 'e.g. Hotel XYZ, Bangkok')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label th="ประเภทรถ" en="Car Type" lang={lang} />
                <select value={form.carType} onChange={e => set('carType', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  {CAR_TYPES.map(c => (
                    <option key={c.value} value={c.value}>{lang === 'en' ? c.en : c.th}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label th="จำนวนผู้โดยสาร" en="Number of Passengers" lang={lang} />
                <Input type="number" min={1} max={50} value={form.passengers}
                  onChange={e => set('passengers', parseInt(e.target.value) || 1)} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'แนบเอกสาร' : 'Upload Documents'}
            </h3>
            <Label th="ใบขับขี่ / ใบขับขี่สากล / พาสปอร์ต (ถ้ามี)" en="Driver's license / International license / Passport (optional)" lang={lang} />
            <FileUploadRows onChange={setDriveFiles} lang={lang} prefix={form.fullName || 'car'} accent="#e65c00" />
          </div>

          {/* Notes */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <Label th="ข้อมูลเพิ่มเติม" en="Additional Information" lang={lang} />
            <textarea value={form.note} onChange={e => set('note', e.target.value)}
              placeholder={lang === 'th' ? 'ระบุความต้องการพิเศษ เช่น คาร์ซีท ฯลฯ...' : 'Special requests, e.g. car seat, etc...'}
              rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {error && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#856404' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', marginBottom: 16, border: '1px solid #eee' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 8 }}>สถานะการยืนยัน</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 12, color: phoneOtp.verified ? '#16a34a' : '#dc2626' }}>{phoneOtp.verified ? '✅' : '⏳'} ยืนยันเบอร์โทรทาง SMS</div>
              <div style={{ fontSize: 12, color: emailOtp.verified ? '#16a34a' : '#dc2626' }}>{emailOtp.verified ? '✅' : '⏳'} ยืนยันอีเมล</div>
            </div>
          </div>

          <button type="submit" disabled={!canSubmit}
            style={{
              width: '100%', background: !canSubmit ? '#ccc' : 'var(--primary, #e65c00)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 800,
              cursor: !canSubmit ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: !canSubmit ? 'none' : '0 4px 16px rgba(230,92,0,.3)',
            }}>
            {submitting
              ? (lang === 'th' ? 'กำลังส่ง...' : 'Submitting...')
              : (lang === 'th' ? '🚗 ส่งคำขอเช่ารถ' : '🚗 Submit Rental Request')}
          </button>
          {!canSubmit && !submitting && (
            <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', marginTop: 8 }}>กรุณายืนยัน OTP เบอร์โทรและอีเมลให้ครบก่อนส่งข้อมูล</p>
          )}
        </form>
      </div>
    </main>
  );
}

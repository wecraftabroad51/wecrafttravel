import { useState, useEffect, useRef } from 'react';
import { insertMessage } from '../../lib/db.js';
import DateRangePicker from '../DateRangePicker.jsx';
import FileUploadRows from '../FileUploadRows.jsx';
import BookNext from '../BookNext.jsx';

const TIME_SLOTS = ['00.01-06.00', '06.01-12.00', '12.01-18.00', '18.00-00.00'];
const AIRLINE_TYPES = [
  { value: 'full',    th: 'Full Service',  en: 'Full Service' },
  { value: 'low',     th: 'Low Cost',      en: 'Low Cost' },
  { value: 'other',   th: 'อื่นๆ',          en: 'Other' },
];
const SEAT_CLASSES = [
  { value: 'economy',  th: 'Economy',     en: 'Economy' },
  { value: 'business', th: 'Business',    en: 'Business' },
  { value: 'first',    th: 'First Class', en: 'First Class' },
  { value: 'flatbed',  th: 'Flatbed',     en: 'Flatbed' },
];

function Label({ th, en, lang, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 6, fontSize: 14.5, fontWeight: 700, color: '#3a4653' }}>
      {lang === 'en' ? en : th}{required && <span style={{ color: '#e65c00', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        width: '100%', padding: '13px 14px', border: '1.5px solid #dde2e8',
        borderRadius: 9, fontSize: 15.5, fontFamily: 'inherit',
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
          cursor: 'pointer', fontSize: 13, padding: '7px 12px',
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

function PassengerCounter({ label, value, onChange, min = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: '#444' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#f5f5f5', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          −
        </button>
        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#f5f5f5', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          +
        </button>
      </div>
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

export default function TicketBookingPage({ lang, t, navigate, setBookings }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    passportNo: '',
    passportExpiry: '',
    outboundDate: '',
    outboundTime: '',
    returnDate: '',
    returnTime: '',
    airlineType: 'full',
    airlineOther: '',
    adults: 1,
    children: 0,
    infants: 0,
    seatClass: 'economy',
    note: '',
  });
  const [driveFiles, setDriveFiles] = useState([]); // ไฟล์ที่อัปโหลดแล้ว [{name,url}]
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
  const totalPax = form.adults + form.children + form.infants;

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
    if (!form.fullName || !form.passportNo || !form.outboundDate) {
      setError(th ? 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, เลขพาสปอร์ต, วันเดินทาง)' : 'Please fill in required fields (name, passport, outbound date).');
      return;
    }
    if (!form.phone || !isValidPhone(form.phone)) {
      setError(th ? 'เบอร์โทรไม่ถูกต้อง (ต้อง 10 หลัก ขึ้นต้นด้วย 0 เช่น 081-234-5678)' : 'Invalid phone number (must be 10 digits starting with 0).');
      return;
    }
    if (!form.email || !isValidEmail(form.email)) {
      setError(th ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Please enter a valid email address.');
      return;
    }
    if (!phoneOtp.verified) { setError(th ? 'กรุณายืนยันเบอร์โทรด้วย OTP ก่อนส่งข้อมูล' : 'Please verify your phone number via OTP first.'); return; }
    if (!emailOtp.verified) { setError(th ? 'กรุณายืนยันอีเมลด้วย OTP ก่อนส่งข้อมูล' : 'Please verify your email via OTP first.'); return; }
    // วันขาไปต้องเป็นอนาคต
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(form.outboundDate) < today) {
      setError(th ? 'วันเดินทางขาไปต้องเป็นวันปัจจุบันหรืออนาคต' : 'Outbound date must be today or in the future.');
      return;
    }
    // วันขาไปต้องมาก่อนวันขากลับ
    if (form.returnDate && form.outboundDate >= form.returnDate) {
      setError(th ? 'วันขาไปต้องมาก่อนวันขากลับ' : 'Outbound date must be before return date.');
      return;
    }
    // พาสปอร์ตต้องเหลืออย่างน้อย 6 เดือนหลังวันขากลับ (หรือขาไปถ้าไม่มีขากลับ)
    if (form.passportExpiry) {
      const refDate = form.returnDate || form.outboundDate;
      if (refDate) {
        const expiry = new Date(form.passportExpiry);
        const minExpiry = new Date(refDate);
        minExpiry.setMonth(minExpiry.getMonth() + 6);
        if (expiry < minExpiry) {
          const d = minExpiry.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
          setError(th
            ? `พาสปอร์ตต้องมีอายุเหลืออย่างน้อย 6 เดือนหลังวันเดินทาง (หมดอายุหลัง ${d})`
            : `Passport must be valid for at least 6 months after travel date (expires after ${d})`);
          return;
        }
      }
    }
    setSubmitting(true);
    setError('');
    try {
      // ── 1. Generate ลำดับที่ก่อน ────────────────────────────────
      let seqNo = '';
      try {
        const seqRes = await fetch('/api/gen-seqno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'ticket' }),
        });
        const seqData = await seqRes.json();
        if (seqRes.ok && seqData.seqNo) seqNo = seqData.seqNo;
      } catch (e) {
        console.warn('gen-seqno failed:', e.message);
      }

      // ── ไฟล์ถูกอัปโหลดไว้แล้วตอนเลือก (FileUploadRows) ──────────

      // ── 2. บันทึกลง Supabase ────────────────────────────────────
      const airlineLabelMsg = AIRLINE_TYPES.find(a => a.value === form.airlineType)?.th || form.airlineType;
      const seatLabelMsg = SEAT_CLASSES.find(s => s.value === form.seatClass)?.th || form.seatClass;
      const driveLinks = driveFiles.map(f => f.url).join(', ');
      const messageBody = [
        seqNo ? `หมายเลขอ้างอิง: ${seqNo}` : null,
        `ประเภท: จองตั๋วเครื่องบิน`,
        `เบอร์โทร: ${form.phone || '-'}`,
        `อีเมล: ${form.email || '-'}`,
        `เลขพาสปอร์ต: ${form.passportNo || '-'}`,
        `วันหมดอายุพาสปอร์ต: ${form.passportExpiry || '-'}`,
        `ขาไป: ${form.outboundDate} ช่วงเวลา ${form.outboundTime || '-'}`,
        `ขากลับ: ${form.returnDate || '-'} ช่วงเวลา ${form.returnTime || '-'}`,
        `สายการบิน: ${airlineLabelMsg}${form.airlineOther ? ` — ${form.airlineOther}` : ''}`,
        `ประเภทที่นั่ง: ${seatLabelMsg}`,
        `ผู้ใหญ่: ${form.adults} / เด็ก: ${form.children} / ทารก: ${form.infants} (รวม ${totalPax} คน)`,
        form.note ? `หมายเหตุ: ${form.note}` : null,
        driveLinks ? `ไฟล์พาสปอร์ต: ${driveLinks}` : null,
      ].filter(Boolean).join('\n');

      const res = await insertMessage({
        name:          form.fullName,
        email:         form.email || '',
        phone:         form.phone || '',
        tour_interest: 'จองตั๋วเครื่องบิน',
        message:       messageBody,
        date:          new Date().toISOString().split('T')[0],
      });
      if (res.error && res.error !== 'offline') throw new Error(JSON.stringify(res.error));

      // ── 3. ส่ง Email + LINE ──────────────────────────────────────
      const airlineLabel = AIRLINE_TYPES.find(a => a.value === form.airlineType)?.th || form.airlineType;
      const seatLabel = SEAT_CLASSES.find(s => s.value === form.seatClass)?.th || form.seatClass;
      const driveSection = driveFiles.length > 0
        ? `<tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">📎 ไฟล์พาสปอร์ต</td></tr>
           ${driveFiles.map((f, i) => `<tr${i%2===1?' style="background:#fafafa"':''}><td style="padding:8px 16px;color:#666">${f.name}</td><td style="padding:8px 16px"><a href="${f.url}" target="_blank" style="color:#1a73e8;text-decoration:none;font-weight:600">🔗 เปิดไฟล์</a></td></tr>`).join('')}`
        : '';
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#1a5276,#e65c00);color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center">
            <h2 style="margin:0;font-size:20px">✈️ คำขอจองตั๋วเครื่องบิน</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
            <tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">ข้อมูลผู้เดินทาง</td></tr>
            <tr><td style="padding:8px 16px;color:#666;width:40%">ชื่อ-นามสกุล</td><td style="padding:8px 16px;font-weight:600">${form.fullName}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เบอร์โทรติดต่อ</td><td style="padding:8px 16px;font-weight:600">${form.phone || '-'}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">อีเมล</td><td style="padding:8px 16px">${form.email || '-'}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เลขพาสปอร์ต</td><td style="padding:8px 16px;font-weight:600">${form.passportNo || '-'}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">วันหมดอายุพาสปอร์ต</td><td style="padding:8px 16px">${form.passportExpiry || '-'}</td></tr>
            <tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">ช่วงเวลาเดินทาง</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ขาไป — วันที่</td><td style="padding:8px 16px;font-weight:600">${form.outboundDate}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">ขาไป — ช่วงเวลา</td><td style="padding:8px 16px">${form.outboundTime || '-'}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ขากลับ — วันที่</td><td style="padding:8px 16px">${form.returnDate || '-'}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">ขากลับ — ช่วงเวลา</td><td style="padding:8px 16px">${form.returnTime || '-'}</td></tr>
            <tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">รายละเอียดการเดินทาง</td></tr>
            <tr><td style="padding:8px 16px;color:#666">สายการบิน</td><td style="padding:8px 16px">${airlineLabel}${form.airlineOther ? ` — ${form.airlineOther}` : ''}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">ประเภทที่นั่ง</td><td style="padding:8px 16px">${seatLabel}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ผู้ใหญ่</td><td style="padding:8px 16px">${form.adults} คน</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เด็ก</td><td style="padding:8px 16px">${form.children} คน</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ทารก</td><td style="padding:8px 16px">${form.infants} คน</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">รวมผู้โดยสาร</td><td style="padding:8px 16px;font-weight:700;color:#e65c00">${totalPax} คน</td></tr>
            ${form.note ? `<tr><td style="padding:8px 16px;color:#666">ข้อมูลเพิ่มเติม</td><td style="padding:8px 16px">${form.note}</td></tr>` : ''}
            ${driveSection}
          </table>
          <p style="font-size:12px;color:#aaa;text-align:center;margin-top:12px">We Craft Travel · We Craft Happiness</p>
        </div>`;
      await sendNotifications(
        `[จองตั๋ว] ${form.fullName} — ${form.outboundDate}`,
        emailHtml,
        { ...form, _type: 'ticket', totalPax, driveFiles, _seqNo: seqNo || undefined },
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
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: '#333' }}>
            {lang === 'th' ? 'ส่งคำขอสำเร็จ!' : 'Request Submitted!'}
          </h2>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
            {lang === 'th'
              ? 'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง เพื่อยืนยันรายละเอียดการจองตั๋ว'
              : 'Our team will contact you within 24 hours to confirm your ticket booking details.'}
          </p>
          <button onClick={() => navigate('home')}
            style={{ marginTop: 24, background: 'var(--primary, #e65c00)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </button>
          <BookNext current="ticket-booking" navigate={navigate} lang={lang} />
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276, var(--primary, #e65c00))', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <div className="bk-hero-icon" style={{ fontSize: 56, marginBottom: 10 }}>✈️</div>
        <h1 className="bk-hero-title" style={{ margin: '0 0 8px', fontSize: 'clamp(28px,4.5vw,38px)', fontWeight: 900 }}>
          {lang === 'th' ? 'จองตั๋วเครื่องบิน' : 'Flight Ticket Booking'}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 15 }}>
          {lang === 'th' ? 'กรอกข้อมูลผู้เดินทางเพื่อให้ทีมงานดำเนินการจองตั๋ว' : 'Fill in traveller details and our team will process your booking'}
        </p>
      </div>

      {/* Form */}
      <div className="wrap" style={{ maxWidth: 720, padding: '40px 20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'ข้อมูลผู้เดินทาง' : 'Traveller Information'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="ชื่อ-นามสกุล ภาษาอังกฤษ" en="Full Name (English)" lang={lang} required />
                <Input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น JOHN DOE' : 'e.g. JOHN DOE'} required />
              </div>
              <div>
                <Label th="เลขพาสปอร์ต" en="Passport Number" lang={lang} required />
                <Input value={form.passportNo} onChange={e => set('passportNo', e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น AA1234567' : 'e.g. AA1234567'} />
              </div>
              <div>
                <Label th="วันหมดอายุพาสปอร์ต" en="Passport Expiry" lang={lang} />
                <Input type="date" value={form.passportExpiry} onChange={e => set('passportExpiry', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="เบอร์โทรติดต่อ" en="Phone Number" lang={lang} required />
                <Input type="tel" value={form.phone}
                  onChange={e => { set('phone', e.target.value); setPhoneOtp({ ...INIT_OTP }); if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); }}
                  placeholder="08X-XXX-XXXX" required style={{ borderColor: phoneOtp.verified ? '#16a34a' : '#ddd' }} />
                <OtpBox label="SMS" otp={phoneOtp}
                  onRequest={() => requestOtp('phone')} onVerify={() => verifyOtp('phone')}
                  onCodeChange={v => setPhoneOtp(p => ({ ...p, code: v }))}
                  onReset={() => { setPhoneOtp({ ...INIT_OTP }); if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label th="อีเมล (สำหรับรับการยืนยัน)" en="Email (for confirmation)" lang={lang} required />
                <Input type="email" value={form.email}
                  onChange={e => { set('email', e.target.value); setEmailOtp({ ...INIT_OTP }); if (emailTimerRef.current) clearInterval(emailTimerRef.current); }}
                  placeholder="email@example.com" required style={{ borderColor: emailOtp.verified ? '#16a34a' : '#ddd' }} />
                <OtpBox label="อีเมล" otp={emailOtp}
                  onRequest={() => requestOtp('email')} onVerify={() => verifyOtp('email')}
                  onCodeChange={v => setEmailOtp(p => ({ ...p, code: v }))}
                  onReset={() => { setEmailOtp({ ...INIT_OTP }); if (emailTimerRef.current) clearInterval(emailTimerRef.current); }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'ช่วงเวลาเดินทาง' : 'Travel Times'}
            </h3>
            {/* Date Range Picker */}
            <div style={{ marginBottom: 18 }}>
              <DateRangePicker
                startDate={form.outboundDate} endDate={form.returnDate}
                onStartChange={v => set('outboundDate', v)} onEndChange={v => set('returnDate', v)}
                startLabel={lang === 'th' ? 'ขาไป — วันที่' : 'Outbound — Date'}
                endLabel={lang === 'th' ? 'ขากลับ — วันที่' : 'Return — Date'}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Outbound time */}
            <div style={{ marginBottom: 18 }}>
              <Label th="ขาไป — ช่วงเวลาที่ต้องการ" en="Outbound — Preferred Time" lang={lang} />
              <RadioGroup options={TIME_SLOTS.map(s => ({ value: s, th: s, en: s }))}
                value={form.outboundTime} onChange={v => set('outboundTime', v)} lang={lang} />
            </div>
            {/* Return time */}
            <div>
              <Label th="ขากลับ — ช่วงเวลาที่ต้องการ" en="Return — Preferred Time" lang={lang} />
              <RadioGroup options={TIME_SLOTS.map(s => ({ value: s, th: s, en: s }))}
                value={form.returnTime} onChange={v => set('returnTime', v)} lang={lang} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'รายละเอียดการเดินทาง' : 'Flight Details'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <Label th="สายการบิน" en="Airline Type" lang={lang} />
              <RadioGroup options={AIRLINE_TYPES} value={form.airlineType} onChange={v => set('airlineType', v)} lang={lang} />
              {form.airlineType === 'other' && (
                <Input value={form.airlineOther} onChange={e => set('airlineOther', e.target.value)}
                  placeholder={lang === 'th' ? 'ระบุสายการบิน...' : 'Specify airline...'} style={{ marginTop: 10 }} />
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label th="ประเภทที่นั่ง" en="Seat Class" lang={lang} />
              <RadioGroup options={SEAT_CLASSES} value={form.seatClass} onChange={v => set('seatClass', v)} lang={lang} />
            </div>
            <div>
              <Label th="จำนวนผู้เดินทาง" en="Number of Passengers" lang={lang} />
              <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '4px 14px' }}>
                <PassengerCounter
                  label={lang === 'th' ? 'ผู้ใหญ่ (อายุ 12 ปีขึ้นไป)' : 'Adults (12+)'}
                  value={form.adults} onChange={v => set('adults', v)} min={1} />
                <div style={{ borderTop: '1px solid #f0f0f0' }} />
                <PassengerCounter
                  label={lang === 'th' ? 'เด็ก (อายุ 2-11 ปี)' : 'Children (2-11)'}
                  value={form.children} onChange={v => set('children', v)} />
                <div style={{ borderTop: '1px solid #f0f0f0' }} />
                <PassengerCounter
                  label={lang === 'th' ? 'ทารก (ต่ำกว่า 2 ปี)' : 'Infants (under 2)'}
                  value={form.infants} onChange={v => set('infants', v)} />
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                {lang === 'th' ? `รวม ${totalPax} คน` : `Total: ${totalPax} passenger${totalPax !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'อัพโหลดเอกสาร' : 'Upload Documents'}
            </h3>
            <Label th={`สำเนาพาสปอร์ต (${totalPax} คน)`} en={`Passport Copies (${totalPax} passenger${totalPax !== 1 ? 's' : ''})`} lang={lang} />
            <FileUploadRows onChange={setDriveFiles} lang={lang} prefix={form.fullName} accent="#e65c00" />
            <div style={{ marginTop: 16 }}>
              <Label th="ข้อมูลเพิ่มเติม" en="Additional Notes" lang={lang} />
              <textarea value={form.note} onChange={e => set('note', e.target.value)}
                placeholder={lang === 'th' ? 'ระบุความต้องการพิเศษ...' : 'Special requests...'}
                rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
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
              : (lang === 'th' ? '✈️ ส่งคำขอจองตั๋ว' : '✈️ Submit Booking Request')}
          </button>
          {!canSubmit && !submitting && (
            <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', marginTop: 8 }}>กรุณายืนยัน OTP เบอร์โทรและอีเมลให้ครบก่อนส่งข้อมูล</p>
          )}
        </form>
      </div>
    </main>
  );
}

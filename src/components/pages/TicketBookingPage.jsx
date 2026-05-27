import { useState } from 'react';
import { insertMessage } from '../../lib/db.js';

// ── Compress image before upload (max 800px, quality 0.6) ─────
function compressImage(file, maxPx = 800, quality = 0.6) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file); // PDF → ไม่ compress
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else                 { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })), 'image/jpeg', quality);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

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
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'ok' | 'warn'
  const [uploadMsg, setUploadMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const totalPax = form.adults + form.children + form.infants;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.passportNo || !form.outboundDate) {
      setError(lang === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill in required fields.');
      return;
    }
    // วันขาไปต้องมาก่อนวันขากลับ
    if (form.returnDate && form.outboundDate >= form.returnDate) {
      setError(lang === 'th' ? 'วันขาไปต้องมาก่อนวันขากลับ' : 'Outbound date must be before return date.');
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
          setError(lang === 'th'
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

      // ── 2. อัพโหลดไฟล์พาสปอร์ตไปยัง Google Drive ──────────────
      let driveFiles = [];
      if (files.length > 0) {
        setUploadStatus('uploading');
        setUploadMsg('');
        try {
          // compress รูปก่อน → ลดขนาดให้อยู่ใน limit ของ Vercel
          const compressed = await Promise.all(files.map(f => compressImage(f)));
          const base64Files = await Promise.all(compressed.map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              name: file.name,
              mimeType: file.type || 'application/octet-stream',
              data: reader.result.split(',')[1],
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })));

          const uploadRes = await fetch('/api/upload-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              files: base64Files,
              folderName: seqNo || `${form.fullName}_${form.outboundDate}`,
            }),
          });
          const text = await uploadRes.text();
          try {
            const uploadData = JSON.parse(text);
            if (uploadRes.ok && uploadData.files) {
              driveFiles = uploadData.files;
              setUploadStatus('ok');
              setUploadMsg(`อัพโหลดสำเร็จ ${driveFiles.length} ไฟล์`);
            } else {
              const errMsg = uploadData.error || `HTTP ${uploadRes.status}`;
              console.warn('Drive upload failed:', errMsg);
              setUploadStatus('warn');
              setUploadMsg(`อัพโหลดไม่สำเร็จ: ${errMsg}`);
            }
          } catch {
            console.warn('Drive upload response not JSON:', text.slice(0, 200));
            setUploadStatus('warn');
            setUploadMsg(`อัพโหลดไม่สำเร็จ: ${text.slice(0, 120)}`);
          }
        } catch (uploadErr) {
          console.warn('Drive upload error (continuing):', uploadErr.message);
          setUploadStatus('warn');
          setUploadMsg(`อัพโหลดไม่สำเร็จ: ${uploadErr.message}`);
        }
      }

      // ── 2. บันทึกลง Supabase ────────────────────────────────────
      const airlineLabelMsg = AIRLINE_TYPES.find(a => a.value === form.airlineType)?.th || form.airlineType;
      const seatLabelMsg = SEAT_CLASSES.find(s => s.value === form.seatClass)?.th || form.seatClass;
      const driveLinks = driveFiles.map(f => f.url).join(', ');
      const messageBody = [
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
      });
      if (res.error && res.error !== 'offline') throw new Error(JSON.stringify(res.error));

      // ── 3. ส่ง Email + LINE ──────────────────────────────────────
      const airlineLabel = AIRLINE_TYPES.find(a => a.value === form.airlineType)?.th || form.airlineType;
      const seatLabel = SEAT_CLASSES.find(s => s.value === form.seatClass)?.th || form.seatClass;
      const driveSection = driveFiles.length > 0
        ? `<tr style="background:#fff3e0"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#e65c00">📎 ไฟล์พาสปอร์ต (Google Drive)</td></tr>
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
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276, var(--primary, #e65c00))', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>✈️</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
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
              <div>
                <Label th="เบอร์โทรติดต่อ" en="Phone Number" lang={lang} required />
                <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="08X-XXX-XXXX" required />
              </div>
              <div>
                <Label th="อีเมล (สำหรับรับการยืนยัน)" en="Email (for confirmation)" lang={lang} />
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="email@example.com" />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: 'var(--primary, #e65c00)', borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
              {lang === 'th' ? 'ช่วงเวลาเดินทาง' : 'Travel Times'}
            </h3>
            {/* Outbound */}
            <div style={{ marginBottom: 18 }}>
              <Label th="ขาไป — วันที่" en="Outbound — Date" lang={lang} required />
              <Input type="date" value={form.outboundDate} onChange={e => set('outboundDate', e.target.value)} style={{ marginBottom: 10 }} />
              <Label th="ขาไป — ช่วงเวลาที่ต้องการ" en="Outbound — Preferred Time" lang={lang} />
              <RadioGroup options={TIME_SLOTS.map(s => ({ value: s, th: s, en: s }))}
                value={form.outboundTime} onChange={v => set('outboundTime', v)} lang={lang} />
            </div>
            {/* Return */}
            <div>
              <Label th="ขากลับ — วันที่" en="Return — Date" lang={lang} />
              <Input type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} style={{ marginBottom: 10 }} />
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
            <div style={{ border: '2px dashed #ddd', borderRadius: 8, padding: '20px', textAlign: 'center', background: '#fafafa' }}>
              <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf"
                onChange={e => {
                  const selected = Array.from(e.target.files);
                  setFiles(selected);
                  setUploadStatus(null);
                  setUploadMsg('');
                  // Reset previews เสมอก่อน แล้วค่อย fill ใหม่
                  const initPreviews = selected.map(f => ({ name: f.name, type: f.type, url: null }));
                  setFilePreviews(initPreviews);
                  selected.forEach((f, i) => {
                    if (f.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setFilePreviews(prev => {
                          const next = [...prev];
                          next[i] = { name: f.name, type: f.type, url: ev.target.result };
                          return next;
                        });
                      };
                      reader.readAsDataURL(f);
                    }
                  });
                }}
                style={{ display: 'block', margin: '0 auto', fontSize: 13 }} />
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                {lang === 'th' ? 'รองรับ .PNG .JPG .PDF' : 'Accepts .PNG .JPG .PDF'}
              </div>
            </div>
            {uploadStatus === 'uploading' && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#1a73e8' }}>
                ⏳ กำลังอัพโหลดไปยัง Google Drive...
              </div>
            )}
            {uploadStatus === 'ok' && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
                ✅ {uploadMsg}
              </div>
            )}
            {uploadStatus === 'warn' && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#c62828', background: '#ffebee', borderRadius: 6, padding: '8px 12px', wordBreak: 'break-all' }}>
                ⚠️ {uploadMsg}<br/>
                <span style={{ color: '#888', fontWeight: 400 }}>(ยังสามารถส่งฟอร์มได้ — เจ้าหน้าที่จะติดต่อขอเอกสารภายหลัง)</span>
              </div>
            )}
            {filePreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                {filePreviews.map((f, i) => (
                  <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd', background: '#f5f5f5', flexShrink: 0 }}>
                    {f.url
                      ? <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span style={{ fontSize: 28 }}>📄</span>
                          <span style={{ fontSize: 10, color: '#888', textAlign: 'center', padding: '0 6px', wordBreak: 'break-all', lineHeight: 1.3 }}>{f.name}</span>
                        </div>
                    }
                    <button type="button"
                      onClick={() => {
                        const newFiles = files.filter((_, idx) => idx !== i);
                        const newPrev = filePreviews.filter((_, idx) => idx !== i);
                        setFiles(newFiles);
                        setFilePreviews(newPrev);
                      }}
                      style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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

          <button type="submit" disabled={submitting}
            style={{
              width: '100%', background: submitting ? '#ccc' : 'var(--primary, #e65c00)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(230,92,0,.3)',
            }}>
            {submitting
              ? (lang === 'th' ? 'กำลังส่ง...' : 'Submitting...')
              : (lang === 'th' ? '✈️ ส่งคำขอจองตั๋ว' : '✈️ Submit Booking Request')}
          </button>
        </form>
      </div>
    </main>
  );
}

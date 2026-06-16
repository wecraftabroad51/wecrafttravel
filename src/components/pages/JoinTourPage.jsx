import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { insertMessage, uploadPassport } from '../../lib/db.js';

// ── Compress image before upload ───────────────────────────────────
function compressImage(file, maxPx = 800, quality = 0.6) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else                 { width  = Math.round(width  * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg', quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

const MONTHS_TH_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function fmtDate(s) {
  if (!s) return '-';
  const parts = String(s).split(/[-/]/);
  if (parts.length < 3) return s;
  const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return s;
  return `${d} ${MONTHS_TH_FULL[m]} ${y < 2400 ? y + 543 : y}`;
}

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#444' }}>
      {children}{required && <span style={{ color: '#e65c00', marginLeft: 3 }}>*</span>}
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

function Counter({ label, sub, value, onChange, min = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #ddd', background: '#f5f5f5', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
          −
        </button>
        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #ddd', background: '#f5f5f5', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
          +
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', marginBottom: 16, border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#1a5276', borderBottom: '2px solid #e8f4fd', paddingBottom: 10 }}>{title}</h3>
      {children}
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
  } catch (err) {
    console.error('Notification fetch error:', err.message);
  }
};

export default function JoinTourPage({ lang, navigate }) {
  const [searchParams] = useSearchParams();
  const tourCode    = searchParams.get('code')       || '';
  const tourName    = searchParams.get('name')       || '';
  const depDate     = searchParams.get('date')       || '';
  const retDate     = searchParams.get('returnDate') || '';
  const priceParam  = searchParams.get('price')      || '';

  const th = lang !== 'en';

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    passportNo: '', passportExpiry: '',
    adults: 1, children: 0, infants: 0,
    note: '',
  });
  const [files, setFiles]           = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMsg, setUploadMsg]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const totalPax = form.adults + form.children + form.infants;

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(f =>
      f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...valid].slice(0, 5));
    valid.forEach(f => {
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => setFilePreviews(prev => [...prev, e.target.result].slice(0, 5));
        reader.readAsDataURL(f);
      } else {
        setFilePreviews(prev => [...prev, null].slice(0, 5));
      }
    });
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      setError(th ? 'กรุณากรอกชื่อ-นามสกุล และเบอร์โทร' : 'Please fill in name and phone number.');
      return;
    }
    if (form.phone) {
      const ph = form.phone.replace(/[\s\-().]/g, '');
      if (!/^0[0-9]{9}$/.test(ph)) {
        setError(th ? 'เบอร์โทรไม่ถูกต้อง (ต้องเป็น 10 หลัก ขึ้นต้นด้วย 0 เช่น 081-234-5678)' : 'Invalid phone (10 digits starting with 0).');
        return;
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(th ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format.');
      return;
    }
    if (totalPax < 1) {
      setError(th ? 'กรุณาระบุจำนวนผู้เดินทางอย่างน้อย 1 คน' : 'Please add at least 1 traveler.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // 1. gen seqno
      let seqNo = '';
      try {
        const seqRes = await fetch('/api/gen-seqno', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'join' }),
        });
        const seqData = await seqRes.json();
        if (seqRes.ok && seqData.seqNo) seqNo = seqData.seqNo;
      } catch (e) { console.warn('gen-seqno failed:', e.message); }

      // 2. upload passport
      let driveFiles = [];
      if (files.length > 0) {
        setUploadStatus('uploading');
        try {
          const compressed = await Promise.all(files.map(f => compressImage(f)));
          const results = await Promise.all(compressed.map(f => uploadPassport(f, seqNo || form.fullName)));
          const failed = results.filter(r => r.error);
          const succeeded = results.filter(r => !r.error);
          driveFiles = succeeded.map(r => ({ name: r.name, url: r.url }));
          setUploadStatus(failed.length > 0 ? 'warn' : 'ok');
          setUploadMsg(failed.length > 0
            ? `อัปโหลดสำเร็จ ${succeeded.length}/${results.length} ไฟล์`
            : `อัปโหลดสำเร็จ ${driveFiles.length} ไฟล์`);
        } catch (upErr) {
          setUploadStatus('warn');
          setUploadMsg(`อัปโหลดไม่สำเร็จ: ${upErr.message}`);
        }
      }

      // 3. insert message
      const driveLinks = driveFiles.map(f => f.url).join(', ');
      const messageBody = [
        seqNo ? `หมายเลขอ้างอิง: ${seqNo}` : null,
        `ประเภท: จองจอยทัวร์`,
        tourCode ? `รหัสทัวร์: ${tourCode}` : null,
        tourName ? `โปรแกรมทัวร์: ${tourName}` : null,
        depDate  ? `วันเดินทางไป: ${depDate}` : null,
        retDate  ? `วันเดินทางกลับ: ${retDate}` : null,
        `---`,
        `เบอร์โทร: ${form.phone}`,
        `อีเมล: ${form.email || '-'}`,
        `เลขพาสปอร์ต: ${form.passportNo || '-'}`,
        `วันหมดอายุพาสปอร์ต: ${form.passportExpiry || '-'}`,
        `ผู้ใหญ่: ${form.adults} / เด็ก: ${form.children} / ทารก: ${form.infants} (รวม ${totalPax} คน)`,
        form.note ? `หมายเหตุ: ${form.note}` : null,
        driveLinks ? `ไฟล์: ${driveLinks}` : null,
      ].filter(Boolean).join('\n');

      const res = await insertMessage({
        name:          form.fullName,
        email:         form.email || '',
        phone:         form.phone || '',
        tour_interest: `จองจอยทัวร์${tourCode ? `: ${tourCode}` : ''}`,
        message:       messageBody,
        date:          new Date().toISOString().split('T')[0],
      });
      if (res.error && res.error !== 'offline') throw new Error(JSON.stringify(res.error));

      // 4. email
      const driveSection = driveFiles.length > 0
        ? `<tr style="background:#e8f4fd"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#1a5276">📎 ไฟล์แนบ</td></tr>
           ${driveFiles.map((f, i) => `<tr${i%2===1?' style="background:#fafafa"':''}><td style="padding:8px 16px;color:#666">${f.name}</td><td style="padding:8px 16px"><a href="${f.url}" target="_blank" style="color:#1a73e8;text-decoration:none;font-weight:600">🔗 เปิดไฟล์</a></td></tr>`).join('')}`
        : '';

      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#1a5276,#0d7c5f);color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center">
            <div style="font-size:36px;margin-bottom:8px">🌏</div>
            <h2 style="margin:0;font-size:20px">คำขอจองจอยทัวร์</h2>
            ${seqNo ? `<div style="margin-top:6px;font-size:13px;opacity:.85">อ้างอิง: ${seqNo}</div>` : ''}
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
            <tr style="background:#e8f4fd"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#1a5276">📋 ข้อมูลโปรแกรมทัวร์</td></tr>
            ${tourCode ? `<tr><td style="padding:8px 16px;color:#666;width:40%">รหัสทัวร์</td><td style="padding:8px 16px;font-weight:700;color:#e65c00">${tourCode}</td></tr>` : ''}
            ${tourName ? `<tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">โปรแกรมทัวร์</td><td style="padding:8px 16px;font-weight:600">${tourName}</td></tr>` : ''}
            ${depDate  ? `<tr><td style="padding:8px 16px;color:#666">วันเดินทางไป</td><td style="padding:8px 16px;font-weight:600">${fmtDate(depDate)}</td></tr>` : ''}
            ${retDate  ? `<tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">วันเดินทางกลับ</td><td style="padding:8px 16px;font-weight:600">${fmtDate(retDate)}</td></tr>` : ''}
            <tr style="background:#e8f4fd"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#1a5276">👤 ข้อมูลผู้ติดต่อ</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ชื่อ-นามสกุล</td><td style="padding:8px 16px;font-weight:700">${form.fullName}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เบอร์โทร</td><td style="padding:8px 16px;font-weight:600">${form.phone}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">อีเมล</td><td style="padding:8px 16px">${form.email || '-'}</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เลขพาสปอร์ต</td><td style="padding:8px 16px;font-weight:600">${form.passportNo || '-'}</td></tr>
            <tr><td style="padding:8px 16px;color:#666">วันหมดอายุพาสปอร์ต</td><td style="padding:8px 16px">${form.passportExpiry || '-'}</td></tr>
            <tr style="background:#e8f4fd"><td colspan="2" style="padding:10px 16px;font-weight:700;color:#1a5276">👥 จำนวนผู้เดินทาง</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ผู้ใหญ่</td><td style="padding:8px 16px">${form.adults} คน</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">เด็ก</td><td style="padding:8px 16px">${form.children} คน</td></tr>
            <tr><td style="padding:8px 16px;color:#666">ทารก</td><td style="padding:8px 16px">${form.infants} คน</td></tr>
            <tr style="background:#fafafa"><td style="padding:8px 16px;color:#666">รวม</td><td style="padding:8px 16px;font-weight:800;color:#0d7c5f;font-size:15px">${totalPax} คน</td></tr>
            ${form.note ? `<tr><td style="padding:8px 16px;color:#666">หมายเหตุ</td><td style="padding:8px 16px">${form.note}</td></tr>` : ''}
            ${driveSection}
          </table>
          <p style="font-size:12px;color:#aaa;text-align:center;margin-top:12px">WeCraft Travel · We Craft Happiness</p>
        </div>`;

      await sendNotifications(
        `[จองจอยทัวร์]${tourCode ? ` ${tourCode}` : ''} ${form.fullName} — ${depDate || '-'}`,
        emailHtml,
        { ...form, _type: 'join-tour', tourCode, tourName, depDate, retDate, totalPax, driveFiles, _seqNo: seqNo || undefined },
        form.email || undefined
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccess(true);
    } catch (err) {
      setError(th ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #eee' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#333' }}>ส่งคำขอสำเร็จ!</h2>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>
            ทีมงานจะติดต่อกลับภายใน <strong>24 ชั่วโมง</strong> เพื่อยืนยันการจองและแจ้งรายละเอียดการชำระเงิน
          </p>
          {tourName && <p style={{ color: '#0d7c5f', fontSize: 13, fontWeight: 600 }}>โปรแกรม: {tourName}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            <button onClick={() => navigate('home')}
              style={{ background: 'var(--primary,#e65c00)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              กลับหน้าหลัก
            </button>
            <button onClick={() => navigate('tours')}
              style={{ background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ดูทัวร์อื่น
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0d7c5f,#1a5276)', color: '#fff', padding: '36px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌏</div>
        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, letterSpacing: '.01em' }}>จองจอยทัวร์</h1>
        <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>กรอกข้อมูลเพื่อจองที่นั่ง ทีมงานจะติดต่อยืนยันภายใน 24 ชั่วโมง</p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* ── ข้อมูลโปรแกรมทัวร์ (read-only) */}
        {(tourCode || tourName || depDate) && (
          <div style={{ background: 'linear-gradient(135deg,#e8f8f3,#e8f4fd)', border: '1.5px solid #b2dfdb', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0d7c5f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              📋 โปรแกรมที่คุณเลือก
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '8px 24px' }}>
              {tourCode && (
                <div>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>รหัสทัวร์</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e65c00', marginTop: 2 }}>{tourCode}</div>
                </div>
              )}
              {tourName && (
                <div style={{ gridColumn: tourCode ? 'span 2' : '1' }}>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>โปรแกรมทัวร์</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a5276', marginTop: 2 }}>{tourName}</div>
                </div>
              )}
              {depDate && (
                <div>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>วันเดินทางไป</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginTop: 2 }}>{fmtDate(depDate)}</div>
                </div>
              )}
              {retDate && (
                <div>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>วันเดินทางกลับ</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginTop: 2 }}>{fmtDate(retDate)}</div>
                </div>
              )}
              {priceParam && (
                <div>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>ราคาต่อท่าน</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>฿{parseInt(priceParam,10).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── จำนวนผู้เดินทาง */}
          <Section title="👥 จำนวนผู้เดินทาง">
            <Counter label="ผู้ใหญ่" sub="อายุ 12 ปีขึ้นไป" value={form.adults}   onChange={v => set('adults',   v)} min={1} />
            <Counter label="เด็ก"    sub="อายุ 2-11 ปี"    value={form.children} onChange={v => set('children', v)} />
            <Counter label="ทารก"    sub="อายุต่ำกว่า 2 ปี" value={form.infants}  onChange={v => set('infants',  v)} />
            <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>รวมผู้เดินทางทั้งหมด</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0d7c5f' }}>{totalPax} คน</span>
            </div>
          </Section>

          {/* ── ข้อมูลผู้ติดต่อ */}
          <Section title="👤 ข้อมูลผู้ติดต่อหลัก">
            <div style={{ marginBottom: 14 }}>
              <Label required>ชื่อ-นามสกุล (ผู้ติดต่อหลัก)</Label>
              <Input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder="เช่น สมชาย ใจดี" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <Label required>เบอร์โทรติดต่อ</Label>
                <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="081-234-5678" required />
              </div>
              <div>
                <Label>อีเมล</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="example@mail.com" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>เลขพาสปอร์ต</Label>
                <Input value={form.passportNo} onChange={e => set('passportNo', e.target.value)}
                  placeholder="AA1234567" style={{ textTransform: 'uppercase' }} />
              </div>
              <div>
                <Label>วันหมดอายุพาสปอร์ต</Label>
                <Input type="date" value={form.passportExpiry} onChange={e => set('passportExpiry', e.target.value)} />
              </div>
            </div>
          </Section>

          {/* ── อัปโหลดพาสปอร์ต */}
          <Section title="📎 แนบสำเนาพาสปอร์ต (ไม่บังคับ)">
            <p style={{ fontSize: 12, color: '#888', marginTop: 0 }}>สามารถแนบได้ภายหลัง — ทีมงานจะแจ้งรายละเอียดอีกครั้ง</p>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed #cce', borderRadius: 8, padding: '20px', cursor: 'pointer',
              background: '#fafafe', gap: 6, color: '#666', fontSize: 13,
            }}>
              <span style={{ fontSize: 28 }}>📁</span>
              <span>คลิกเพื่อเลือกไฟล์รูปภาพหรือ PDF (สูงสุด 5 ไฟล์)</span>
              <input type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)} />
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden', width: 72, height: 72, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {filePreviews[i]
                      ? <img src={filePreviews[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <span style={{ fontSize: 24 }}>📄</span>}
                    <button type="button" onClick={() => removeFile(i)}
                      style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploadStatus && (
              <div style={{ marginTop: 8, fontSize: 12, color: uploadStatus === 'ok' ? '#16a34a' : uploadStatus === 'warn' ? '#ca8a04' : '#555' }}>
                {uploadStatus === 'uploading' ? '⏳ กำลังอัปโหลด...' : uploadStatus === 'ok' ? `✅ ${uploadMsg}` : `⚠ ${uploadMsg}`}
              </div>
            )}
          </Section>

          {/* ── หมายเหตุ */}
          <Section title="📝 ข้อมูลเพิ่มเติม / หมายเหตุ">
            <textarea
              value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="เช่น ต้องการห้องพักเดี่ยว, ต้องการอาหารมังสวิรัติ, มีปัญหาสุขภาพที่ต้องแจ้ง ฯลฯ"
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6,
                fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </Section>

          {/* Error */}
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting}
            style={{
              width: '100%', padding: '16px', fontSize: 16, fontWeight: 800,
              background: submitting ? '#ccc' : 'linear-gradient(135deg,#0d7c5f,#1a5276)',
              color: '#fff', border: 'none', borderRadius: 10, cursor: submitting ? 'wait' : 'pointer',
              fontFamily: 'inherit', boxShadow: submitting ? 'none' : '0 4px 16px rgba(13,124,95,.3)',
              transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {submitting ? '⏳ กำลังส่งข้อมูล...' : '✅ ยืนยันการจองจอยทัวร์'}
          </button>
          <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 }}>
            ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง เพื่อยืนยันที่นั่งและแจ้งรายละเอียดการชำระเงิน
          </p>
        </form>
      </div>
    </main>
  );
}

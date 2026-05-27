import { useState } from 'react';
import { insertMessage } from '../../lib/db.js';

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

const sendNotifications = async (subject, html, formData) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html, formData }),
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
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const isAirport = form.rentalType === 'airport';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.pickupDate || !form.pickupLocation) {
      setError(lang === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill in required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const rentalLabelMsg = RENTAL_TYPES.find(r => r.value === form.rentalType)?.th || form.rentalType;
      const carLabelMsg = CAR_TYPES.find(c => c.value === form.carType)?.th || form.carType;
      const messageBody = [
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
      await sendNotifications(`[รถเช่า] ${form.fullName} — ${rentalLabel} ${form.pickupDate}`, emailHtml, form);
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
              <div>
                <Label th="เบอร์โทรศัพท์" en="Phone Number" lang={lang} required />
                <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="08X-XXX-XXXX" />
              </div>
              <div>
                <Label th="อีเมล" en="Email" lang={lang} />
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="email@example.com" />
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <Label th="วันที่รับรถ" en="Pickup Date" lang={lang} required />
                <Input type="date" value={form.pickupDate} onChange={e => set('pickupDate', e.target.value)} />
              </div>
              {!isAirport && (
                <div>
                  <Label th="วันที่คืนรถ" en="Return Date" lang={lang} />
                  <Input type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} />
                </div>
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

          <button type="submit" disabled={submitting}
            style={{
              width: '100%', background: submitting ? '#ccc' : 'var(--primary, #e65c00)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(230,92,0,.3)',
            }}>
            {submitting
              ? (lang === 'th' ? 'กำลังส่ง...' : 'Submitting...')
              : (lang === 'th' ? '🚗 ส่งคำขอเช่ารถ' : '🚗 Submit Rental Request')}
          </button>
        </form>
      </div>
    </main>
  );
}

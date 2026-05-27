import { useState } from 'react';
import { insertBooking } from '../../lib/db.js';

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

export default function TicketBookingPage({ lang, t, navigate, setBookings }) {
  const [form, setForm] = useState({
    fullName: '',
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
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        type: 'ticket-booking',
        name: form.fullName,
        data: JSON.stringify({
          ...form,
          totalPax,
          requestType: 'ticket-booking',
        }),
        status: 'pending',
      };
      const res = await insertBooking(payload);
      if (res.error && res.error !== 'offline') throw new Error(JSON.stringify(res.error));
      if (setBookings && res.data) setBookings(prev => [res.data, ...prev]);
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
                onChange={e => setFiles(Array.from(e.target.files))}
                style={{ display: 'block', margin: '0 auto', fontSize: 13 }} />
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                {lang === 'th' ? 'รองรับ .PNG .JPG .PDF' : 'Accepts .PNG .JPG .PDF'}
              </div>
              {files.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {files.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
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

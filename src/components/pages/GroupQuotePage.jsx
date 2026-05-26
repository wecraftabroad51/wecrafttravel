import { useState, useRef } from 'react';
import { insertMessage } from '../../lib/db.js';

// ─── Email sending via Vercel API route (/api/send-email) ────────
// Setup: เพิ่ม 2 ตัวแปรใน Vercel → Environment Variables:
//   GMAIL_USER     = wecraftabroad51@gmail.com
//   GMAIL_APP_PASS = (App Password 16 ตัว จาก Google Account → Security → App passwords)
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

const TOUR_TYPES = [
  'ท่องเที่ยว',
  'ดูงาน และท่องเที่ยว',
  'ประชุม สัมนา และท่องเที่ยว',
  'ดูคอนเสิร์ต ชมการแสดง การแข่งขัน',
  'อื่นๆ',
];
const HOTEL_STARS = ['3 ดาว', '4 ดาว', '5 ดาว'];

const AIRLINES = [
  '-- ไม่ระบุ / ยืดหยุ่นได้ --',

  // ─── สายการบินไทย ───────────────────────────────────────
  '✈ สายการบินไทย',
  'Thai Airways - การบินไทย (TG)',
  'Bangkok Airways (PG)',
  'Thai AirAsia (FD)',
  'Thai AirAsia X (XJ)',
  'Thai Lion Air (SL)',
  'Thai Smile (WE)',
  'Thai VietJet (VZ)',
  'Nok Air (DD)',
  'NokScoot (XW)',
  'PC Air',
  'Kan Air (KR)',

  // ─── เอเชียตะวันออกเฉียงใต้ ──────────────────────────────
  '✈ เอเชียตะวันออกเฉียงใต้',
  'Singapore Airlines (SQ)',
  'Scoot (TR)',
  'Jetstar Asia (3K)',
  'Batik Air Malaysia (OD)',
  'Malaysia Airlines (MH)',
  'AirAsia (AK)',
  'AirAsia X (D7)',
  'Malindo Air (OD)',
  'Garuda Indonesia (GA)',
  'Lion Air (JT)',
  'Batik Air (ID)',
  'Citilink (QG)',
  'Wings Air (IW)',
  'Vietnam Airlines (VN)',
  'VietJet Air (VJ)',
  'Bamboo Airways (QH)',
  'Pacific Airlines (BL)',
  'Philippine Airlines (PR)',
  'Cebu Pacific (5J)',
  'AirAsia Philippines (Z2)',
  'Myanmar Airways International (8M)',
  'Air KBZ (K7)',
  'Lao Airlines (QV)',
  'Cambodia Angkor Air (K6)',
  'Silk Air (MI)',
  'Firefly (FY)',

  // ─── เอเชียตะวันออก ───────────────────────────────────────
  '✈ เอเชียตะวันออก',
  'Cathay Pacific (CX)',
  'HK Express (UO)',
  'Greater Bay Airlines (HB)',
  'EVA Air (BR)',
  'China Airlines (CI)',
  'Starlux Airlines (JX)',
  'Tigerair Taiwan (IT)',
  'Japan Airlines (JL)',
  'ANA - All Nippon Airways (NH)',
  'Peach Aviation (MM)',
  'Jetstar Japan (GK)',
  'Zipair (ZG)',
  'Vanilla Air (JW)',
  'Korean Air (KE)',
  'Asiana Airlines (OZ)',
  'Jeju Air (7C)',
  'Jin Air (LJ)',
  "T'way Air (TW)",
  'Air Busan (BX)',
  'Air Seoul (RS)',
  'Air China (CA)',
  'China Eastern (MU)',
  'China Southern (CZ)',
  'Xiamen Airlines (MF)',
  'Shenzhen Airlines (ZH)',
  'Hainan Airlines (HU)',
  'Sichuan Airlines (3U)',
  'Juneyao Airlines (HO)',
  'Shanghai Airlines (FM)',
  'Lucky Air (8L)',
  'Ruili Airlines (DR)',
  'Spring Airlines (9C)',
  'Air Macau (NX)',
  'Mongolian Airlines (OM)',

  // ─── เอเชียใต้ ────────────────────────────────────────────
  '✈ เอเชียใต้',
  'Air India (AI)',
  'IndiGo (6E)',
  'SpiceJet (SG)',
  'Vistara (UK)',
  'GoFirst (G8)',
  'SriLankan Airlines (UL)',
  'FitsAir (8D)',
  'Maldivian (Q2)',
  'Biman Bangladesh (BG)',
  'Regent Airways (RX)',
  'Himalaya Airlines (H9)',
  'Buddha Air (U4)',
  'Yeti Airlines (YT)',

  // ─── ตะวันออกกลาง ────────────────────────────────────────
  '✈ ตะวันออกกลาง',
  'Emirates (EK)',
  'Qatar Airways (QR)',
  'Etihad Airways (EY)',
  'flydubai (FZ)',
  'flynas (XY)',
  'flyadeal (F3)',
  'Saudia (SV)',
  'Air Arabia (G9)',
  'Air Arabia Abu Dhabi (3L)',
  'Oman Air (WY)',
  'SalamAir (OV)',
  'Gulf Air (GF)',
  'Kuwait Airways (KU)',
  'Jazeera Airways (J9)',
  'Wataniya Airways (WAY)',
  'Iraqi Airways (IA)',
  'Middle East Airlines (ME)',
  'Royal Jordanian (RJ)',
  'Air Astana (KC)',
  'FlyArystan (KC)',

  // ─── เอเชียกลาง / รัสเซีย ────────────────────────────────
  '✈ เอเชียกลาง / รัสเซีย',
  'Aeroflot (SU)',
  'S7 Airlines (S7)',
  'Ural Airlines (U6)',
  'Pobeda (DP)',
  'Uzbekistan Airways (HY)',
  'Air Manas (ZM)',
  'SCAT Airlines (DV)',

  // ─── ยุโรป ────────────────────────────────────────────────
  '✈ ยุโรป',
  'Lufthansa (LH)',
  'Air France (AF)',
  'British Airways (BA)',
  'KLM Royal Dutch (KL)',
  'Swiss International (LX)',
  'Austrian Airlines (OS)',
  'Turkish Airlines (TK)',
  'Finnair (AY)',
  'SAS Scandinavian (SK)',
  'Norwegian Air (DY)',
  'Iberia (IB)',
  'Vueling (VY)',
  'Transavia (HV)',
  'TAP Air Portugal (TP)',
  'Alitalia / ITA Airways (AZ)',
  'LOT Polish Airlines (LO)',
  'Czech Airlines (OK)',
  'Brussels Airlines (SN)',
  'Eurowings (EW)',
  'Condor (DE)',
  'TUI Airways (BY)',
  'Jet2 (LS)',
  'easyJet (U2)',
  'Ryanair (FR)',
  'Wizz Air (W6)',
  'Aegean Airlines (A3)',
  'Olympic Air (OA)',
  'Croatia Airlines (OU)',
  'Adria Airways',
  'Air Serbia (JU)',
  'Air Malta (KM)',
  'Air Baltic (BT)',
  'Estonian Air (OV)',
  'airBaltic (BT)',
  'Icelandair (FI)',
  'PLAY Airlines (OG)',
  'Luxair (LG)',
  'Aer Lingus (EI)',

  // ─── แอฟริกา ──────────────────────────────────────────────
  '✈ แอฟริกา',
  'Ethiopian Airlines (ET)',
  'Kenya Airways (KQ)',
  'Egypt Air (MS)',
  'Royal Air Maroc (AT)',
  'Air Mauritius (MK)',
  'South African Airways (SA)',
  'Mango Airlines (JE)',
  'Air Tanzania (TC)',
  'RwandAir (WB)',
  'ASKY Airlines (KP)',
  'Tunisair (TU)',
  'Air Algérie (AH)',
  'Nile Air (NP)',

  // ─── อเมริกาเหนือ ─────────────────────────────────────────
  '✈ อเมริกาเหนือ',
  'United Airlines (UA)',
  'American Airlines (AA)',
  'Delta Air Lines (DL)',
  'Southwest Airlines (WN)',
  'Alaska Airlines (AS)',
  'JetBlue Airways (B6)',
  'Spirit Airlines (NK)',
  'Frontier Airlines (F9)',
  'Air Canada (AC)',
  'WestJet (WS)',
  'Air Transat (TS)',
  'Aeromexico (AM)',
  'Volaris (Y4)',
  'VivaAerobus (VB)',

  // ─── อเมริกาใต้ ───────────────────────────────────────────
  '✈ อเมริกาใต้',
  'LATAM Airlines (LA)',
  'Avianca (AV)',
  'Copa Airlines (CM)',
  'Gol Airlines (G3)',
  'Azul Airlines (AD)',
  'Aerolineas Argentinas (AR)',
  'Sky Airline (H2)',

  // ─── โอเชียเนีย ───────────────────────────────────────────
  '✈ โอเชียเนีย',
  'Qantas (QF)',
  'Jetstar Airways (JQ)',
  'Virgin Australia (VA)',
  'Bonza (AB)',
  'Air New Zealand (NZ)',
  'Fiji Airways (FJ)',
  'Air Vanuatu (NF)',
  'Solomon Airlines (IE)',
  'Air Niugini (PX)',
];

// จำนวนวัน-คืน options
const DURATION_OPTIONS = [
  '-- เลือกระยะเวลา --',
  '2 วัน 1 คืน', '3 วัน 2 คืน', '4 วัน 3 คืน', '5 วัน 4 คืน',
  '6 วัน 5 คืน', '7 วัน 6 คืน', '8 วัน 7 คืน', '9 วัน 8 คืน',
  '10 วัน 9 คืน', '11 วัน 10 คืน', '12 วัน 11 คืน', '13 วัน 12 คืน',
  '14 วัน 13 คืน', '15 วัน 14 คืน', '16 วัน 15 คืน',
  '18 วัน 17 คืน', '20 วัน 19 คืน', '21 วัน 20 คืน',
  'มากกว่า 21 วัน (ระบุในหมายเหตุ)',
];

const EMPTY = {
  firstName: '', lastName: '', company: '', pax: '',
  phone: '', lineId: '', email: '', emailAlt: '',
  destination: '', budget: '',
  tourType: 'ท่องเที่ยว', tourTypeOther: '',
  hotel: '3 ดาว',
  travelDate: '', duration: '',
  airline: '', extraInfo: '',
};

function Radio({ name, value, checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 8 }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
        style={{ accentColor: 'var(--primary)', width: 16, height: 16, cursor: 'pointer' }} />
      {label}
    </label>
  );
}

function Field({ label, required, optional, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>
        {label}
        {required && <span style={{ color: '#e53e3e', marginLeft: 4 }}>*</span>}
        {optional && <span style={{ color: '#e53e3e', fontWeight: 400, marginLeft: 4 }}>({optional})</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s',
};

export default function GroupQuotePage({ lang, setMessages }) {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false); // prevent double submit

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName)   e.firstName   = true;
    if (!form.lastName)    e.lastName    = true;
    if (!form.phone)       e.phone       = true;
    if (!form.email)       e.email       = true;
    if (!form.destination) e.destination = true;
    if (!form.travelDate)  e.travelDate  = true;
    if (!form.duration || form.duration.startsWith('--')) e.duration = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    if (submittingRef.current) return; // block double submit
    submittingRef.current = true;
    setSaving(true);

    const tourTypeLabel = form.tourType === 'อื่นๆ' && form.tourTypeOther
      ? `อื่นๆ: ${form.tourTypeOther}`
      : form.tourType;

    // Format message for Supabase
    const messageBody = [
      `=== ขอราคากรุ๊ปเหมา ===`,
      `ชื่อ-นามสกุล: ${form.firstName} ${form.lastName}`,
      form.company    ? `บริษัท/หน่วยงาน: ${form.company}` : null,
      form.pax        ? `จำนวนผู้เดินทาง: ${form.pax} คน` : null,
      `โทร: ${form.phone}`,
      form.lineId     ? `LINE ID: ${form.lineId}` : null,
      form.emailAlt   ? `อีเมลสำรอง: ${form.emailAlt}` : null,
      `ปลายทาง: ${form.destination}`,
      form.budget     ? `งบประมาณ/ท่าน: ${form.budget}` : null,
      `รูปแบบทัวร์: ${tourTypeLabel}`,
      `โรงแรม: ${form.hotel}`,
      `วันเดินทาง: ${form.travelDate}`,
      `ระยะเวลา: ${form.duration} วัน`,
      form.airline    ? `สายการบิน: ${form.airline}` : null,
      form.extraInfo  ? `ข้อมูลเพิ่มเติม: ${form.extraInfo}` : null,
    ].filter(Boolean).join('\n');

    // 1. Save to Supabase
    const { error } = await insertMessage({
      name:         `${form.firstName} ${form.lastName}`,
      email:        form.email,
      phone:        form.phone,
      tour_interest: form.destination,
      message:      messageBody,
      read:         false,
      date:         new Date().toISOString().split('T')[0],
    });

    if (error && error !== 'offline') {
      alert('ส่งไม่สำเร็จ กรุณาลองใหม่');
      setSaving(false);
      return;
    }

    // Update local state
    setMessages?.(prev => [{
      id: Date.now(),
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      message: messageBody,
      read: false,
      date: new Date().toISOString().split('T')[0],
    }, ...prev]);

    // 2. Send email via /api/send-email (Vercel serverless)
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#e65c00;color:#fff;padding:20px 24px">
          <h2 style="margin:0;font-size:20px">📋 ขอราคากรุ๊ปเหมา — WeCraft Travel</h2>
        </div>
        <div style="padding:24px;background:#fff">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${[
              ['ชื่อ-นามสกุล', `${form.firstName} ${form.lastName}`],
              ['บริษัท/หน่วยงาน', form.company || '-'],
              ['จำนวนผู้เดินทาง', form.pax ? `${form.pax} คน` : '-'],
              ['โทรศัพท์', form.phone],
              ['LINE ID', form.lineId || '-'],
              ['อีเมล', form.email],
              ['อีเมลสำรอง', form.emailAlt || '-'],
              ['ปลายทาง', form.destination],
              ['งบประมาณ/ท่าน', form.budget || '-'],
              ['รูปแบบทัวร์', tourTypeLabel],
              ['โรงแรม', form.hotel],
              ['วันเดินทาง', form.travelDate],
              ['ระยะเวลา', form.duration],
              ['สายการบิน', form.airline || '-'],
              ['ข้อมูลเพิ่มเติม', form.extraInfo || '-'],
            ].map(([k, v]) => `
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:8px 12px;color:#888;width:160px;vertical-align:top">${k}</td>
                <td style="padding:8px 12px;color:#333;font-weight:600">${v}</td>
              </tr>`).join('')}
          </table>
        </div>
        <div style="background:#f9f9f9;padding:14px 24px;font-size:12px;color:#aaa;text-align:center">
          ส่งจากเว็บไซต์ wecraft-travel.com · ${new Date().toLocaleString('th-TH')}
        </div>
      </div>`;

    await sendNotifications(
      `[กรุ๊ปเหมา] ${form.firstName} ${form.lastName} — ${form.destination}`,
      emailHtml,
      { ...form, tourTypeLabel: tourTypeLabel }
    );

    setSaving(false);
    submittingRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSent(true);
  };

  const inpStyle = (k) => ({
    ...inputStyle,
    borderColor: errors[k] ? '#e53e3e' : '#ddd',
  });

  if (sent) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="32" height="32">
              <path d="m5 13 4 4 10-10"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>ส่งข้อมูลสำเร็จแล้ว!</h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 8 }}>
            ขอบคุณที่สนใจบริการจัดกรุ๊ปทัวร์เหมาของเรา<br />
            ทีมงานจะติดต่อกลับภายใน <strong>24 ชั่วโมง</strong> ในวันทำการ
          </p>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 28 }}>
            หากต้องการติดต่อด่วน LINE: <strong>@wecrafttravel</strong> หรือโทร <strong>061-868-6889</strong>
          </p>
          <button
            onClick={() => { setSent(false); setForm(EMPTY); setErrors({}); }}
            style={{
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '12px 28px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            ส่งข้อมูลอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* ── Info Section ─────────────────────────────────── */}
      <section style={{ padding: '40px 20px 32px', borderBottom: '1px solid #eee' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: '#999', marginBottom: 20, display: 'flex', gap: 6 }}>
            <span>หน้าแรก</span><span>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>ขอราคากรุ๊ปเหมา</span>
          </nav>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', textAlign: 'center', marginBottom: 6 }}>
            ขอราคากรุ๊ปเหมา
          </h1>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
            ขอราคากรุ๊ปเหมา จัดกรุ๊ปทัวร์ส่วนตัว ทั่วโลก ในราคาพิเศษ
          </h2>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
            ออกแบบความสุขในแบบของคุณ... จะกี่คนเราก็พร้อมดูแล
          </p>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, marginBottom: 20 }}>
            คุณกำลังมองหาบริการ <strong>จัดกรุ๊ปทัวร์ส่วนตัว (Private Group)</strong> สำหรับครอบครัว กลุ่มเพื่อน
            หรือ <strong>จัดสัมมนาดูงาน (Incentive Group)</strong> สำหรับองค์กรอยู่ใช่ไหม?
            ที่นี่เรามีทีมงานมืออาชีพที่พร้อมออกแบบเส้นทางท่องเที่ยวทั่วโลก
            ให้ตอบโจทย์ความต้องการและงบประมาณของคุณมากที่สุด
          </p>

          <div className="gq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* ทำไมต้องเลือกเรา */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
                ทำไมต้องเลือกจัดกรุ๊ปเหมากับเรา?
              </h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['ออกแบบเส้นทางตามใจ (Tailor-made)', 'อยากไปที่ไหน พักโรงแรมระดับกี่ดาว หรือเน้นรับประทานอาหารเมนูพิเศษ เราจัดให้ได้หมด'],
                  ['คุมงบประมาณได้ (Budget Control)', 'ไม่ว่าจะงบจำกัดหรือต้องการความหรูหราแบบ VVIP เราบริหารจัดการให้คุ้มค่าที่สุด'],
                  ['ประสบการณ์มืออาชีพ', 'ทีมงานเชี่ยวชาญเส้นทางทั้งในและต่างประเทศ พร้อมไกด์และหัวหน้าทัวร์ที่ดูแลอย่างใกล้ชิด'],
                  ['บริการครบวงจร', 'จองตั๋วเครื่องบิน กรุ๊ปเหมา ยื่นวีซ่า ประกันอุบัติเหตุ และรถเช่าปรับอากาศ VIP'],
                ].map(([title, desc], i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0 }}>•</span>
                    <span><strong>{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ขั้นตอน */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
                ขั้นตอนการขอราคากรุ๊ปเหมา
              </h3>
              <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['กรอกข้อมูล', 'แจ้งรายละเอียดเบื้องต้นผ่านฟอร์มด้านล่าง'],
                  ['รับการติดต่อกลับ', 'เจ้าหน้าที่ฝ่ายขายกรุ๊ปเหมาจะติดต่อกลับภายใน 24 ชั่วโมง'],
                  ['รับข้อเสนอ', 'เราจะส่งแผนการเดินทาง (Itinerary) และใบเสนอราคาเบื้องต้นให้พิจารณา'],
                  ['ปรับแก้จนพอใจ', 'สามารถปรับเปลี่ยนโปรแกรมจนกว่าจะตรงใจคุณ'],
                ].map(([title, desc], i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</span>
                    <span><strong>{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form Section ─────────────────────────────────── */}
      <section style={{ padding: '40px 20px 80px' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', textAlign: 'center', marginBottom: 6 }}>
            กรอกข้อมูลเพื่อขอราคากรุ๊ปเหมา
          </h2>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#e53e3e', marginBottom: 28 }}>
            * กรุณากรอกข้อมูลที่จำเป็นให้ครบ
          </p>

          <div className="gq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>

            {/* ชื่อ-นามสกุล */}
            <Field label="ชื่อผู้ติดต่อ" required>
              <input style={inpStyle('firstName')} placeholder="ชื่อผู้ติดต่อ"
                value={form.firstName} onChange={set('firstName')} />
            </Field>
            <Field label="นามสกุลผู้ติดต่อ" required>
              <input style={inpStyle('lastName')} placeholder="นามสกุลผู้ติดต่อ"
                value={form.lastName} onChange={set('lastName')} />
            </Field>

            {/* บริษัท-จำนวนคน */}
            <Field label="บริษัทฯ-หน่วยงาน">
              <input style={inpStyle()} placeholder="บริษัทฯ-หน่วยงาน"
                value={form.company} onChange={set('company')} />
            </Field>
            <Field label="จำนวนผู้เดินทาง">
              <input style={inpStyle()} placeholder="จำนวนผู้เดินทาง" type="number" min="1"
                value={form.pax} onChange={set('pax')} />
            </Field>

            {/* โทร-LINE */}
            <Field label="หมายเลขโทรศัพท์" required>
              <input style={inpStyle('phone')} placeholder="หมายเลขโทรศัพท์" type="tel"
                value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Line ID" optional="ถ้ามี">
              <input style={inpStyle()} placeholder="Line ID"
                value={form.lineId} onChange={set('lineId')} />
            </Field>

            {/* Email */}
            <Field label="อีเมล" required>
              <input style={inpStyle('email')} placeholder="อีเมล" type="email"
                value={form.email} onChange={set('email')} />
            </Field>
            <Field label="อีเมลสำรอง" optional="ถ้ามี">
              <input style={inpStyle()} placeholder="อีเมลสำรอง" type="email"
                value={form.emailAlt} onChange={set('emailAlt')} />
            </Field>

            {/* ปลายทาง-งบ */}
            <Field label="ประเทศ-เมือง-สถานที่ ที่ต้องการไป" required>
              <input style={inpStyle('destination')} placeholder="ประเทศ-เมือง-สถานที่ ที่ต้องการไป"
                value={form.destination} onChange={set('destination')} />
            </Field>
            <Field label="งบประมาณ/ท่าน" optional="ถ้ามี">
              <input
                style={inpStyle()}
                placeholder="เช่น 50,000"
                inputMode="numeric"
                value={form.budget}
                onChange={e => {
                  // strip non-digits, then format with commas
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  const formatted = raw ? Number(raw).toLocaleString('th-TH') : '';
                  setForm(p => ({ ...p, budget: formatted }));
                }}
              />
            </Field>

            {/* รูปแบบทัวร์ */}
            <div style={{ gridColumn: '1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>
                รูปแบบทัวร์ <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              {TOUR_TYPES.map(v => (
                <Radio key={v} name="tourType" value={v} label={v}
                  checked={form.tourType === v}
                  onChange={e => setForm(p => ({ ...p, tourType: e.target.value }))} />
              ))}
              {form.tourType === 'อื่นๆ' && (
                <input style={{ ...inputStyle, marginTop: 6 }} placeholder="อื่นๆ"
                  value={form.tourTypeOther} onChange={set('tourTypeOther')} />
              )}
            </div>

            {/* โรงแรม */}
            <div style={{ gridColumn: '2' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>
                ต้องการพักโรงแรม <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              {HOTEL_STARS.map(v => (
                <Radio key={v} name="hotel" value={v} label={v}
                  checked={form.hotel === v}
                  onChange={e => setForm(p => ({ ...p, hotel: e.target.value }))} />
              ))}
            </div>

            {/* วันเดินทาง-ระยะเวลา */}
            <Field label="วันที่ต้องการเดินทางไป" required>
              <input style={inpStyle('travelDate')} placeholder="วันที่ต้องการเดินทางไป" type="date"
                value={form.travelDate} onChange={set('travelDate')} />
            </Field>
            <Field label="ต้องการทัวร์กี่วัน" required>
              <select style={{ ...inpStyle('duration'), background: '#fff', cursor: 'pointer' }}
                value={form.duration} onChange={set('duration')}>
                {DURATION_OPTIONS.map(d => (
                  <option key={d} value={d.startsWith('--') ? '' : d}>{d}</option>
                ))}
              </select>
            </Field>

            {/* สายการบิน-ข้อมูลเพิ่มเติม */}
            <Field label="ต้องการบินสายการบิน">
              <select style={{ ...inpStyle(), background: '#fff', cursor: 'pointer' }}
                value={form.airline} onChange={set('airline')}>
                {AIRLINES.map(a => {
                  const isHeader = a.startsWith('✈ ');
                  const isPlaceholder = a.startsWith('--');
                  return (
                    <option key={a} value={isHeader || isPlaceholder ? '' : a}
                      disabled={isHeader} style={isHeader ? { fontWeight: 'bold', color: '#888', background: '#f5f5f5' } : {}}>
                      {a}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field label="ข้อมูลที่ต้องการแจ้งเราเพิ่มเติม">
              <input style={inpStyle()} placeholder="ข้อมูลที่ต้องการแจ้งเราเพิ่มเติม"
                value={form.extraInfo} onChange={set('extraInfo')} />
            </Field>

          </div>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div style={{
              marginTop: 20, padding: '12px 16px',
              background: '#fff5f5', border: '1px solid #feb2b2',
              borderRadius: 8, fontSize: 13, color: '#c53030',
            }}>
              กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบก่อนส่งข้อมูล
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              onClick={submit}
              disabled={saving}
              style={{
                background: saving ? '#ccc' : 'var(--primary)',
                color: '#fff', border: 'none',
                borderRadius: 8, padding: '14px 48px',
                fontSize: 16, fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background .2s',
              }}
            >
              {saving ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลขอราคากรุ๊ปเหมา'}
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
              เมื่อส่งแล้ว ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมงในวันทำการ
            </p>
          </div>

        </div>
      </section>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 640px) {
          .gq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// code = ISO 3166-1 alpha-2 (lowercase) — used with flagcdn.com
const VISA_LIST = [
  { code: 'jp', th: 'ญี่ปุ่น',               en: 'Japan',                noteTh: 'ยื่นล่วงหน้า 2–4 สัปดาห์',        noteEn: 'Apply 2–4 weeks in advance' },
  { code: 'cn', th: 'จีน',                   en: 'China',                noteTh: 'ยื่นล่วงหน้า 2–3 สัปดาห์',        noteEn: 'Apply 2–3 weeks in advance' },
  { code: 'gb', th: 'อังกฤษ',                en: 'United Kingdom',       noteTh: 'ยื่นล่วงหน้า 4–6 สัปดาห์',        noteEn: 'Apply 4–6 weeks in advance' },
  { code: 'eu', th: 'กลุ่มเชงเก้น (ยุโรป)', en: 'Schengen (Europe)',    noteTh: 'ฝรั่งเศส, เยอรมัน, อิตาลี ฯลฯ',  noteEn: 'France, Germany, Italy, etc.' },
  { code: 'us', th: 'สหรัฐอเมริกา',          en: 'United States',        noteTh: 'ยื่นล่วงหน้า 2–3 เดือน',          noteEn: 'Apply 2–3 months in advance' },
  { code: 'ca', th: 'แคนาดา',               en: 'Canada',               noteTh: 'ยื่นล่วงหน้า 4–8 สัปดาห์',        noteEn: 'Apply 4–8 weeks in advance' },
  { code: 'au', th: 'ออสเตรเลีย',            en: 'Australia',            noteTh: 'ยื่นออนไลน์ 1–4 สัปดาห์',         noteEn: 'Online application 1–4 weeks' },
  { code: 'nz', th: 'นิวซีแลนด์',            en: 'New Zealand',          noteTh: 'ยื่นออนไลน์ 1–3 สัปดาห์',         noteEn: 'Online application 1–3 weeks' },
  { code: 'in', th: 'อินเดีย',               en: 'India',                noteTh: 'e-Visa 3–5 วันทำการ',             noteEn: 'e-Visa 3–5 business days' },
  { code: 'ae', th: 'สหรัฐอาหรับเอมิเรตส์', en: 'UAE',                  noteTh: 'e-Visa 3–5 วันทำการ',             noteEn: 'e-Visa 3–5 business days' },
  { code: 'sa', th: 'ซาอุดีอาระเบีย',        en: 'Saudi Arabia',         noteTh: 'ยื่นล่วงหน้า 2–4 สัปดาห์',        noteEn: 'Apply 2–4 weeks in advance' },
  { code: 'ru', th: 'รัสเซีย',               en: 'Russia',               noteTh: 'ยื่นล่วงหน้า 2–4 สัปดาห์',        noteEn: 'Apply 2–4 weeks in advance' },
  { code: 'za', th: 'แอฟริกาใต้',            en: 'South Africa',         noteTh: 'ยื่นล่วงหน้า 4–6 สัปดาห์',        noteEn: 'Apply 4–6 weeks in advance' },
  { code: 'eg', th: 'อียิปต์',               en: 'Egypt',                noteTh: 'e-Visa หรือยื่นที่ด่าน',           noteEn: 'e-Visa or visa on arrival' },
  { code: 'ma', th: 'โมร็อกโก',              en: 'Morocco',              noteTh: 'ยื่นล่วงหน้า 2–3 สัปดาห์',        noteEn: 'Apply 2–3 weeks in advance' },
];

const DOCS_TH = [
  'หนังสือเดินทาง (Passport) อายุเหลืออย่างน้อย 6 เดือน',
  'รูปถ่ายสีพื้นหลังขาว ขนาด 2×2 นิ้ว (ตามข้อกำหนดแต่ละประเทศ)',
  'สำเนาทะเบียนบ้าน / สำเนาบัตรประชาชน',
  'Bank Statement ย้อนหลัง 3–6 เดือน',
  'หลักฐานการจอง: ตั๋วเครื่องบิน / โรงแรม',
  'จดหมายรับรองการทำงาน / ใบจดทะเบียนธุรกิจ',
  'ประกันการเดินทาง (บางประเทศบังคับ)',
];

const DOCS_EN = [
  'Passport valid for at least 6 months',
  'White-background photo, 2×2 inches (per country requirements)',
  'Copy of house registration / national ID card',
  'Bank statement for the past 3–6 months',
  'Booking confirmation: flight ticket / hotel',
  'Employment letter / business registration certificate',
  'Travel insurance (mandatory for some countries)',
];

const WHY_US_TH = [
  { icon: '🎯', title: 'ประสบการณ์สูง',   desc: 'ทีมงานเชี่ยวชาญด้านเอกสารวีซ่าทุกประเทศ' },
  { icon: '⚡', title: 'รวดเร็ว',          desc: 'ดำเนินการเร็ว แจ้งผลทันที' },
  { icon: '📋', title: 'เอกสารครบ',        desc: 'แนะนำเอกสารครบถ้วนลดโอกาสถูกปฏิเสธ' },
  { icon: '🛡️', title: 'น่าเชื่อถือ',      desc: 'มีใบอนุญาต ททท. เลขที่ 11/11550' },
];

const WHY_US_EN = [
  { icon: '🎯', title: 'Highly Experienced', desc: 'Expert team specialising in visa documentation for every country' },
  { icon: '⚡', title: 'Fast Processing',    desc: 'Quick turnaround with immediate status updates' },
  { icon: '📋', title: 'Complete Documents', desc: 'Full document guidance to minimise rejection risk' },
  { icon: '🛡️', title: 'Trustworthy',        desc: 'TAT-licensed agency, licence no. 11/11550' },
];

const STEPS_TH = [
  { title: 'ติดต่อเจ้าหน้าที่',      desc: 'แจ้งประเทศปลายทาง วันเดินทาง และจำนวนผู้เดินทาง ผ่าน LINE หรือโทรศัพท์' },
  { title: 'รับเช็กลิสต์เอกสาร',    desc: 'เจ้าหน้าที่จะส่งรายการเอกสารที่จำเป็นสำหรับประเทศนั้นๆ โดยเฉพาะ' },
  { title: 'จัดส่งเอกสาร',          desc: 'นำเอกสารมาส่งได้ที่สำนักงาน หรือส่งทางไปรษณีย์' },
  { title: 'รับวีซ่า',              desc: 'เมื่อสถานทูตอนุมัติ เจ้าหน้าที่จะแจ้งให้ทราบทันทีและนัดรับเอกสารคืน' },
];

const STEPS_EN = [
  { title: 'Contact Our Team',       desc: 'Let us know your destination, travel dates, and number of travellers via LINE or phone' },
  { title: 'Receive Document Checklist', desc: 'Our staff will send you a tailored document checklist specific to that country' },
  { title: 'Submit Documents',       desc: 'Drop off documents at our office or send them by post' },
  { title: 'Collect Your Visa',      desc: 'Once the embassy approves, we will notify you immediately and arrange document collection' },
];

// Flag image from flagcdn.com — renders on all browsers/OS
function FlagImg({ code }) {
  return (
    <img
      src={`https://flagcdn.com/48x36/${code}.png`}
      srcSet={`https://flagcdn.com/96x72/${code}.png 2x`}
      alt={code.toUpperCase()}
      width={48}
      height={36}
      style={{
        borderRadius: 5,
        objectFit: 'cover',
        boxShadow: '0 1px 5px rgba(0,0,0,.18)',
        display: 'block',
        flexShrink: 0,
      }}
      onError={e => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex');
      }}
    />
  );
}

export default function VisaPage({ lang = 'th', navigate }) {
  const th = lang === 'th';

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        .visa-wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; }
        .visa-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.07); padding: 32px 36px; margin-bottom: 24px; }
        .visa-section-title { font-size: 20px; font-weight: 800; color: #222; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; margin-bottom: 20px; }
        .visa-country-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
        .visa-country-item {
          border: 1px solid #e8e8e8; border-radius: 10px;
          padding: 14px 16px; display: flex; align-items: center; gap: 14px;
          transition: border-color .2s, box-shadow .2s, transform .15s;
          cursor: default;
        }
        .visa-country-item:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 14px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .visa-step { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
        .visa-step-no {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 16px; flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .visa-card { padding: 20px 16px; }
          .visa-country-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276, #2e86c1)', padding: '40px 20px', marginBottom: 32 }}>
        <div className="visa-wrap" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', letterSpacing: 3, marginBottom: 8 }}>VISA SERVICE</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0 }}>
            {th ? 'บริการยื่นวีซ่า' : 'Visa Application Service'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.8)', marginTop: 8, fontSize: 15 }}>
            {th
              ? 'ครบทุกประเทศ — ทีมงานมืออาชีพช่วยดูแลทุกขั้นตอน'
              : 'All countries covered — our professional team handles every step for you'}
          </p>
        </div>
      </div>

      <div className="visa-wrap">

        {/* Why us */}
        <div className="visa-card">
          <div className="visa-section-title">
            {th ? '✅ ทำไมต้องใช้บริการยื่นวีซ่ากับเรา' : '✅ Why Choose Our Visa Service'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {(th ? WHY_US_TH : WHY_US_EN).map((item, i) => (
              <div key={i} style={{ background: '#f0f8ff', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#222', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Country list */}
        <div className="visa-card">
          <div className="visa-section-title">
            {th ? '🌍 ประเทศที่ให้บริการยื่นวีซ่า' : '🌍 Countries We Cover'}
          </div>
          <div className="visa-country-grid">
            {VISA_LIST.map((v, i) => (
              <div key={i} className="visa-country-item">
                <FlagImg code={v.code} />
                <div style={{
                  display: 'none', width: 48, height: 36,
                  background: '#e8eaf0', borderRadius: 5,
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#555',
                  flexShrink: 0,
                }}>
                  {v.code.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#222', lineHeight: 1.3 }}>
                    {th ? v.th : v.en}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
                    {th ? v.noteTh : v.noteEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#888', fontStyle: 'italic' }}>
            {th
              ? '* สามารถยื่นวีซ่าได้ทุกประเทศ — ติดต่อสอบถามเพิ่มเติมได้เลยครับ'
              : '* We can assist with visa applications for all countries — feel free to enquire.'}
          </p>
        </div>

        {/* Steps */}
        <div className="visa-card">
          <div className="visa-section-title">
            {th ? '📌 ขั้นตอนการใช้บริการ' : '📌 How It Works'}
          </div>
          {(th ? STEPS_TH : STEPS_EN).map((step, i) => (
            <div key={i} className="visa-step">
              <div className="visa-step-no">{i + 1}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#222', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Required docs */}
        <div className="visa-card">
          <div className="visa-section-title">
            {th ? '📄 เอกสารทั่วไปที่ต้องใช้' : '📄 General Documents Required'}
          </div>
          <div style={{ columns: 2, columnGap: 24 }}>
            {(th ? DOCS_TH : DOCS_EN).map((doc, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, breakInside: 'avoid' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 900, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{doc}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
            {th
              ? '* เอกสารอาจแตกต่างกันตามแต่ละประเทศและสถานทูต ทีมงานจะแจ้งรายละเอียดเฉพาะให้ทราบ'
              : '* Required documents vary by country and embassy. Our team will provide a specific checklist for your destination.'}
          </p>
        </div>

        {/* CTA */}
        <div className="visa-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eaf3fb, #fff)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#222', marginBottom: 8 }}>
            {th ? 'สอบถามบริการวีซ่า' : 'Enquire About Visa Service'}
          </div>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            {th ? 'ติดต่อเราได้เลย ทีมงานพร้อมให้คำแนะนำ' : 'Contact us anytime — our team is ready to help'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:0618686889" style={{
              background: '#1a5276', color: '#fff',
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>📞 061-868-6889</a>
            <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer" style={{
              background: '#06c755', color: '#fff',
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>💚 LINE: @wecrafttravel</a>
          </div>
        </div>

      </div>
    </div>
  );
}

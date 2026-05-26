const VISA_LIST = [
  { flag: '🇯🇵', country: 'ญี่ปุ่น',         note: 'ยื่นล่วงหน้า 2–4 สัปดาห์' },
  { flag: '🇨🇳', country: 'จีน',              note: 'ยื่นล่วงหน้า 2–3 สัปดาห์' },
  { flag: '🇬🇧', country: 'อังกฤษ',           note: 'ยื่นล่วงหน้า 4–6 สัปดาห์' },
  { flag: '🇪🇺', country: 'กลุ่มเชงเก้น (ยุโรป)', note: 'ฝรั่งเศส, เยอรมัน, อิตาลี ฯลฯ' },
  { flag: '🇺🇸', country: 'สหรัฐอเมริกา',     note: 'ยื่นล่วงหน้า 2–3 เดือน' },
  { flag: '🇨🇦', country: 'แคนาดา',           note: 'ยื่นล่วงหน้า 4–8 สัปดาห์' },
  { flag: '🇦🇺', country: 'ออสเตรเลีย',       note: 'ยื่นออนไลน์ 1–4 สัปดาห์' },
  { flag: '🇳🇿', country: 'นิวซีแลนด์',       note: 'ยื่นออนไลน์ 1–3 สัปดาห์' },
  { flag: '🇮🇳', country: 'อินเดีย',           note: 'e-Visa 3–5 วันทำการ' },
  { flag: '🇦🇪', country: 'สหรัฐอาหรับเอมิเรตส์', note: 'e-Visa 3–5 วันทำการ' },
  { flag: '🇸🇦', country: 'ซาอุดีอาระเบีย',   note: 'ยื่นล่วงหน้า 2–4 สัปดาห์' },
  { flag: '🇷🇺', country: 'รัสเซีย',           note: 'ยื่นล่วงหน้า 2–4 สัปดาห์' },
  { flag: '🇿🇦', country: 'แอฟริกาใต้',        note: 'ยื่นล่วงหน้า 4–6 สัปดาห์' },
  { flag: '🇪🇬', country: 'อียิปต์',           note: 'e-Visa หรือยื่นที่ด่าน' },
  { flag: '🇲🇦', country: 'โมร็อกโก',          note: 'ยื่นล่วงหน้า 2–3 สัปดาห์' },
];

const DOCS = [
  'หนังสือเดินทาง (Passport) อายุเหลืออย่างน้อย 6 เดือน',
  'รูปถ่ายสีพื้นหลังขาว ขนาด 2×2 นิ้ว (ตามข้อกำหนดแต่ละประเทศ)',
  'สำเนาทะเบียนบ้าน / สำเนาบัตรประชาชน',
  'Bank Statement ย้อนหลัง 3–6 เดือน',
  'หลักฐานการจอง: ตั๋วเครื่องบิน / โรงแรม',
  'จดหมายรับรองการทำงาน / ใบจดทะเบียนธุรกิจ',
  'ประกันการเดินทาง (บางประเทศบังคับ)',
];

export default function VisaPage({ navigate }) {
  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        .visa-wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; }
        .visa-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.07); padding: 32px 36px; margin-bottom: 24px; }
        .visa-section-title { font-size: 20px; font-weight: 800; color: #222; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; margin-bottom: 20px; }
        .visa-country-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .visa-country-item {
          border: 1px solid #e8e8e8; border-radius: 10px;
          padding: 12px 14px; display: flex; align-items: center; gap: 10px;
          transition: border-color .2s, box-shadow .2s;
        }
        .visa-country-item:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
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
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0 }}>บริการยื่นวีซ่า</h1>
          <p style={{ color: 'rgba(255,255,255,.8)', marginTop: 8, fontSize: 15 }}>
            ครบทุกประเทศ — ทีมงานมืออาชีพช่วยดูแลทุกขั้นตอน
          </p>
        </div>
      </div>

      <div className="visa-wrap">

        {/* Why us */}
        <div className="visa-card">
          <div className="visa-section-title">✅ ทำไมต้องใช้บริการยื่นวีซ่ากับเรา</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '🎯', title: 'ประสบการณ์สูง', desc: 'ทีมงานเชี่ยวชาญด้านเอกสารวีซ่าทุกประเทศ' },
              { icon: '⚡', title: 'รวดเร็ว', desc: 'ดำเนินการเร็ว แจ้งผลทันที' },
              { icon: '📋', title: 'เอกสารครบ', desc: 'แนะนำเอกสารครบถ้วนลดโอกาสถูกปฏิเสธ' },
              { icon: '🛡️', title: 'น่าเชื่อถือ', desc: 'มีใบอนุญาต ททท. เลขที่ 11/11550' },
            ].map((item, i) => (
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
          <div className="visa-section-title">🌍 ประเทศที่ให้บริการยื่นวีซ่า</div>
          <div className="visa-country-grid">
            {VISA_LIST.map((v, i) => (
              <div key={i} className="visa-country-item">
                <span style={{ fontSize: 24 }}>{v.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>{v.country}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{v.note}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#888', fontStyle: 'italic' }}>
            * สามารถยื่นวีซ่าได้ทุกประเทศ — ติดต่อสอบถามเพิ่มเติมได้เลยครับ
          </p>
        </div>

        {/* Steps */}
        <div className="visa-card">
          <div className="visa-section-title">📌 ขั้นตอนการใช้บริการ</div>
          {[
            { title: 'ติดต่อเจ้าหน้าที่', desc: 'แจ้งประเทศปลายทาง วันเดินทาง และจำนวนผู้เดินทาง ผ่าน LINE หรือโทรศัพท์' },
            { title: 'รับเช็กลิสต์เอกสาร', desc: 'เจ้าหน้าที่จะส่งรายการเอกสารที่จำเป็นสำหรับประเทศนั้นๆ โดยเฉพาะ' },
            { title: 'จัดส่งเอกสาร', desc: 'นำเอกสารมาส่งได้ที่สำนักงาน หรือส่งทางไปรษณีย์' },
            { title: 'รับวีซ่า', desc: 'เมื่อสถานทูตอนุมัติ เจ้าหน้าที่จะแจ้งให้ทราบทันทีและนัดรับเอกสารคืน' },
          ].map((step, i) => (
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
          <div className="visa-section-title">📄 เอกสารทั่วไปที่ต้องใช้</div>
          <div style={{ columns: 2, columnGap: 24 }}>
            {DOCS.map((doc, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, breakInside: 'avoid' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 900, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{doc}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
            * เอกสารอาจแตกต่างกันตามแต่ละประเทศและสถานทูต ทีมงานจะแจ้งรายละเอียดเฉพาะให้ทราบ
          </p>
        </div>

        {/* CTA */}
        <div className="visa-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eaf3fb, #fff)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#222', marginBottom: 8 }}>สอบถามบริการวีซ่า</div>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>ติดต่อเราได้เลย ทีมงานพร้อมให้คำแนะนำ</p>
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

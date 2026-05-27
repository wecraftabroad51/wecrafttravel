export default function AboutPage({ lang = 'th', navigate }) {
  const th = lang === 'th';

  const companyBullets = th ? [
    'ทุนจดทะเบียน 2,000,000 บาท ชำระเต็มมูลค่า',
    'ใบอนุญาตประกอบกิจการท่องเที่ยว เลขที่ 11/11550 จากสำนักทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์',
    'สมาชิกสมาคมธุรกิจท่องเที่ยวภายในประเทศ (สทน.)',
    'ธุรกิจนำเที่ยวประเภทเที่ยวทั่วไป',
  ] : [
    'Registered capital 2,000,000 THB, fully paid-up',
    'Tourism Business Licence No. 11/11550 issued by the Tourism Business and Guide Registration Office',
    'Member of the Domestic Tourism Business Association (DTBA)',
    'General tourism business operator',
  ];

  const services = th ? [
    'จัดกรุ๊ปทัวร์ท่องเที่ยว สัมมนา ศึกษาดูงาน ทั้งในประเทศ และต่างประเทศ',
    'จองแพ็คเกจทัวร์',
    'รับจองห้องพัก ทุกประเภท ทั้งในและต่างประเทศ',
    'จองแพ็คเกจและจัดกรุ๊ปเรือสำราญ',
    'จองตั๋วเครื่องบินทั้งในประเทศ และต่างประเทศ',
    'บริการยื่นวีซ่าทุกประเทศ',
    'ประกันการเดินทางต่างประเทศ',
    'บริการรถรับ-ส่งสนามบิน',
  ] : [
    'Group tours — leisure, seminars, study trips, domestic & international',
    'Tour package reservations',
    'Hotel bookings of all types, domestic & international',
    'Cruise packages and group cruise bookings',
    'Domestic and international flight ticket reservations',
    'Visa application services for all countries',
    'International travel insurance',
    'Airport transfer services',
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        .about-wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; }
        .about-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.07); padding: 36px 40px; margin-bottom: 24px; }
        .about-section-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 22px; font-weight: 800; color: #222;
          border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; margin-bottom: 20px;
        }
        .about-bullet { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #444; }
        .about-bullet::before { content: "•"; color: var(--primary); font-weight: 900; margin-top: 1px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .about-card { padding: 24px 18px; }
          .about-top-grid { flex-direction: column !important; }
          .about-services-grid { flex-direction: column !important; }
        }
      `}</style>

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0d7a55 100%)', padding: '40px 20px', marginBottom: 32 }}>
        <div className="about-wrap" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', letterSpacing: 3, marginBottom: 8 }}>ABOUT US</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0 }}>
            {th ? 'เกี่ยวกับเรา' : 'About Us'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.8)', marginTop: 8, fontSize: 15 }}>WeCraft Travel — WE CRAFT ABROAD</p>
        </div>
      </div>

      <div className="about-wrap">

        {/* Top: logo + company info */}
        <div className="about-card">
          <div className="about-top-grid" style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>

            {/* Logo */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%',
                border: '4px solid var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,.1)',
              }}>
                <img src="/logo.png" alt="WeCraft Travel"
                  style={{ width: 130, height: 130, objectFit: 'contain' }} />
              </div>
              <div style={{ marginTop: 12, fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>WeCraft Travel</div>
              <div style={{ fontSize: 11, color: '#888', letterSpacing: 2 }}>WE CRAFT ABROAD</div>
            </div>

            {/* Company details */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#222', margin: '0 0 6px' }}>
                {th ? '🏛️ บริษัท วีคราฟท์ อะบรอด จำกัด' : '🏛️ WeCraft Abroad Co., Ltd.'}
              </h2>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: '#444', margin: '0 0 6px' }}>
                  {th
                    ? <><strong>ชื่อ WeCraft Travel :</strong> ดีไซน์ความสุข ให้สนุกทุกโลเคชั่น</>
                    : <><strong>WeCraft Travel :</strong> Designing happiness — fun at every location</>}
                </p>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7 }}>
                  {th
                    ? <><strong>WeCraft Travel :</strong> ก่อตั้งขึ้นเพื่อให้บริการด้านการท่องเที่ยวอย่างครบวงจร
                        ถูกต้องตามกฎหมายประกอบธุรกิจท่องเที่ยวตามมาตรา 15 แห่งพระราชบัญญัติธุรกิจนำเที่ยวและมัคคุเทศก์ พ.ศ. 2551</>
                    : <><strong>WeCraft Travel</strong> was established to provide comprehensive travel services,
                        fully compliant with Section 15 of the Tourism Business and Tourist Guide Act B.E. 2551.</>}
                </p>
              </div>

              <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#333', marginBottom: 12 }}>
                  {th ? 'ข้อมูลบริษัท' : 'Company Information'}
                </div>
                {companyBullets.map((item, i) => (
                  <div key={i} className="about-bullet">{item}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 28, borderTop: '1px solid #eee', paddingTop: 24 }}>
            {th ? (
              <>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.9, marginBottom: 14 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;<strong>บริษัท วีคราฟท์ อะบรอด จำกัด</strong> คือ Travel Agency
                  ประกอบธุรกิจให้บริการนำเที่ยว ทั้งภายในประเทศ และต่างประเทศในภูมิภาคต่างๆ ทั่วโลก
                  รับจัดกรุ๊ปทัวร์ เพื่อการท่องเที่ยวพักผ่อน การประชุม สัมมนา ศึกษาดูงาน ท่องเที่ยวประจำปีของบริษัท
                  การศึกษาด้านแหล่งท่องเที่ยวชุมชน โครงการพระราชดำริ จำหน่ายตั๋วเครื่องบิน จองห้องพัก รถรับ-ส่ง
                  แพ็คเกจทัวร์แบบส่วนตัว
                </p>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.9, marginBottom: 0 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;ให้บริการด้านงานท่องเที่ยว ดำเนินธุรกิจด้วยหัวใจของคนทำทัวร์
                  การท่องเที่ยวคือการคืนกำไรให้กับชีวิตการแสวงหาความสุขเพื่อสร้างแรงบันดาลใจ
                  เพื่อเพิ่มพลังกายพลังใจให้กับการดำเนินชีวิตในวันต่อๆ ไป ไปอย่างมีพลัง
                  การเดินทางท่องเที่ยวต้องเดินทางด้วยความสุข ความพร้อม ทั้งร่างกายและจิตใจ
                  ถึงจะเรียกว่า "ความสุข" และนั่นคือ ความหมายของการท่องเที่ยว
                  และเป็นเป้าหมายหลักของความสำเร็จในการดำเนินธุรกิจของ WeCraft Travel
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.9, marginBottom: 14 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;<strong>WeCraft Abroad Co., Ltd.</strong> is a full-service travel agency
                  operating both domestic and international tours across all regions of the world.
                  We organise group tours for leisure travel, meetings, seminars, study trips, annual company outings,
                  community tourism, royal-initiative projects, and also offer flight tickets, hotel reservations,
                  airport transfers, and private tour packages.
                </p>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.9, marginBottom: 0 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;We run our business with the heart of true travel professionals.
                  Travel is the reward of life — a pursuit of happiness that inspires and recharges both body and mind
                  for the days ahead. Every journey should be made with joy and full readiness.
                  That is what "happiness" truly means, and it is the core mission of WeCraft Travel.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Services + License */}
        <div className="about-card">
          <div className="about-section-title">
            <span>ℹ️</span> {th ? 'บริการหลักของเรา' : 'Our Core Services'}
          </div>
          <div className="about-services-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {services.map((item, i) => (
                <div key={i} className="about-bullet">{item}</div>
              ))}
            </div>

            {/* License image */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <img
                src="/license.jpg"
                alt="Tourism Business Licence 11/11550"
                style={{
                  width: 240,
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,.15)',
                  border: '1px solid #ddd',
                }}
              />
              <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                {th ? 'ใบอนุญาต ททท. เลขที่ 11/11550' : 'TAT Licence No. 11/11550'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="about-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #e8f8f0, #fff)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#222', marginBottom: 8 }}>
            {th ? 'ติดต่อเรา' : 'Contact Us'}
          </div>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            {th ? 'พร้อมให้บริการ จันทร์–ศุกร์ 09.00–18.00 น.' : 'Available Mon–Fri, 09:00–18:00'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:0618686889" style={{
              background: 'var(--primary)', color: '#fff',
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>📞 061-868-6889</a>
            <a href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer" style={{
              background: '#06c755', color: '#fff',
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>💚 LINE: @wecrafttravel</a>
            <button onClick={() => navigate('group-quote')} style={{
              background: '#fff', color: 'var(--primary)',
              border: '2px solid var(--primary)',
              padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            }}>🎯 {th ? 'ขอราคากรุ๊ปเหมา' : 'Group Tour Quote'}</button>
          </div>
        </div>

      </div>
    </div>
  );
}

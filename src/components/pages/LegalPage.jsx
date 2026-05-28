export default function LegalPage({ lang, navigate, settings, type }) {
  const legal = settings?.legal || {};

  const pages = {
    privacy: {
      titleTh: 'นโยบายความเป็นส่วนตัว',
      titleEn: 'Privacy Policy',
      icon: '🔒',
      defaultTh: `<h2>นโยบายความเป็นส่วนตัว</h2>
<p>บริษัท วีคราฟท์ อะบรอด จำกัด ("บริษัท") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของลูกค้าและผู้ใช้บริการทุกท่าน</p>
<h3>ข้อมูลที่เราเก็บรวบรวม</h3>
<ul>
  <li>ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์</li>
  <li>ข้อมูลการจองและชำระเงิน</li>
  <li>ข้อมูลการใช้งานเว็บไซต์</li>
</ul>
<h3>วัตถุประสงค์การใช้ข้อมูล</h3>
<p>เราใช้ข้อมูลเพื่อดำเนินการจอง, ติดต่อสื่อสาร, ปรับปรุงบริการ และปฏิบัติตามกฎหมายเท่านั้น</p>
<h3>การคุ้มครองข้อมูล</h3>
<p>เราไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก ยกเว้นในกรณีที่จำเป็นเพื่อให้บริการและตามที่กฎหมายกำหนด</p>
<h3>ติดต่อเรา</h3>
<p>หากมีข้อสงสัยเกี่ยวกับนโยบายนี้ กรุณาติดต่อ info@wecraft-travel.com</p>`,
      defaultEn: `<h2>Privacy Policy</h2>
<p>WeCraft Abroad Co., Ltd. ("Company") values the privacy of all customers and users.</p>
<h3>Information We Collect</h3>
<ul>
  <li>Name, email, phone number</li>
  <li>Booking and payment details</li>
  <li>Website usage data</li>
</ul>
<h3>How We Use Information</h3>
<p>We use data only to process bookings, communicate with you, improve services, and comply with legal obligations.</p>
<h3>Data Protection</h3>
<p>We do not disclose personal data to third parties except as necessary to provide services or as required by law.</p>
<h3>Contact Us</h3>
<p>For questions about this policy, contact info@wecraft-travel.com</p>`,
    },
    terms: {
      titleTh: 'เงื่อนไขการใช้บริการ',
      titleEn: 'Terms of Service',
      icon: '📋',
      defaultTh: `<h2>เงื่อนไขการใช้บริการ</h2>
<p>การใช้บริการของ WeCraft Travel ถือว่าท่านยอมรับเงื่อนไขดังต่อไปนี้</p>
<h3>บริการของเรา</h3>
<p>เราให้บริการจัดทัวร์, จองตั๋วเครื่องบิน, รถเช่า และบริการท่องเที่ยวครบวงจร</p>
<h3>ราคาและการชำระเงิน</h3>
<ul>
  <li>ราคาที่แสดงเป็นราคาเริ่มต้น อาจมีการเปลี่ยนแปลงตามช่วงเวลา</li>
  <li>ต้องชำระมัดจำตามที่บริษัทกำหนด</li>
</ul>
<h3>การยกเลิก</h3>
<p>กรุณาอ่านเงื่อนไขการจองสำหรับนโยบายการยกเลิกและคืนเงินโดยละเอียด</p>
<h3>ข้อจำกัดความรับผิด</h3>
<p>บริษัทไม่รับผิดชอบต่อเหตุการณ์ที่อยู่นอกเหนือการควบคุม เช่น ภัยธรรมชาติ หรือนโยบายของสายการบิน</p>`,
      defaultEn: `<h2>Terms of Service</h2>
<p>By using WeCraft Travel services, you agree to the following terms.</p>
<h3>Our Services</h3>
<p>We provide tour packages, flight booking, car rental, and full travel services.</p>
<h3>Pricing & Payment</h3>
<ul>
  <li>Prices shown are starting prices and may vary by season</li>
  <li>A deposit is required as specified by the company</li>
</ul>
<h3>Cancellations</h3>
<p>Please refer to our Booking Terms for detailed cancellation and refund policies.</p>
<h3>Limitation of Liability</h3>
<p>The company is not liable for events beyond our control, such as natural disasters or airline policy changes.</p>`,
    },
    booking: {
      titleTh: 'เงื่อนไขการจอง',
      titleEn: 'Booking Terms',
      icon: '✈️',
      defaultTh: `<h2>เงื่อนไขการจอง</h2>
<h3>การจองและมัดจำ</h3>
<ul>
  <li>มัดจำ 30% ของราคาทัวร์ภายใน 3 วันหลังการจอง</li>
  <li>ชำระส่วนที่เหลือก่อนการเดินทาง 30 วัน</li>
</ul>
<h3>นโยบายการยกเลิก</h3>
<ul>
  <li>ยกเลิกก่อน 45 วัน: คืนเงินมัดจำ 100%</li>
  <li>ยกเลิกก่อน 30 วัน: คืนเงินมัดจำ 50%</li>
  <li>ยกเลิกก่อน 15 วัน: ไม่คืนเงินมัดจำ</li>
  <li>ยกเลิกก่อน 7 วัน: ไม่คืนเงิน</li>
</ul>
<h3>เอกสารที่ต้องใช้</h3>
<ul>
  <li>สำเนาหนังสือเดินทางที่มีอายุไม่น้อยกว่า 6 เดือน</li>
  <li>รูปถ่ายสีขนาด 2 นิ้ว จำนวน 2 ใบ</li>
</ul>
<h3>ประกันการเดินทาง</h3>
<p>แนะนำให้ทำประกันการเดินทาง เราให้บริการประกันเดินทางในราคาพิเศษ</p>`,
      defaultEn: `<h2>Booking Terms</h2>
<h3>Booking & Deposit</h3>
<ul>
  <li>30% deposit required within 3 days of booking</li>
  <li>Full payment due 30 days before departure</li>
</ul>
<h3>Cancellation Policy</h3>
<ul>
  <li>Cancel 45+ days before: 100% deposit refund</li>
  <li>Cancel 30+ days before: 50% deposit refund</li>
  <li>Cancel 15+ days before: No deposit refund</li>
  <li>Cancel within 7 days: No refund</li>
</ul>
<h3>Required Documents</h3>
<ul>
  <li>Passport copy with at least 6 months validity</li>
  <li>2 passport-size color photos</li>
</ul>
<h3>Travel Insurance</h3>
<p>We recommend travel insurance and offer it at special rates.</p>`,
    },
  };

  const page = pages[type];
  if (!page) return null;

  const title   = lang === 'th' ? page.titleTh : page.titleEn;
  const content = lang === 'th'
    ? (legal[type]?.th || page.defaultTh)
    : (legal[type]?.en || page.defaultEn);

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)', minHeight: '80vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f3460,#16213e)', padding: '56px 0 48px' }}>
        <div className="wrap-wide" style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{page.icon}</div>
          <h1 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <section style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
        <div className="wrap-wide">
          <nav style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => navigate('home')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
              {lang === 'th' ? 'หน้าหลัก' : 'Home'}
            </button>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{title}</span>
          </nav>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '48px 0 80px' }}>
        <div className="wrap-wide">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div
              className="article-body"
              style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--ink-2)' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <style>{`
              .article-body h2 { font-size:1.5em;font-weight:800;margin:1.4em 0 .5em;color:var(--ink) }
              .article-body h3 { font-size:1.1em;font-weight:700;margin:1.2em 0 .4em;color:var(--ink) }
              .article-body ul  { list-style:disc;padding-left:1.8em;margin:.6em 0 1em }
              .article-body ol  { list-style:decimal;padding-left:1.8em;margin:.6em 0 1em }
              .article-body li  { margin-bottom:.4em }
              .article-body p   { margin-bottom:.9em }
              .article-body strong { font-weight:700;color:var(--ink) }
            `}</style>

            <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--line)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { key: 'privacy', labelTh: 'นโยบายความเป็นส่วนตัว', labelEn: 'Privacy Policy' },
                { key: 'terms',   labelTh: 'เงื่อนไขการใช้บริการ',  labelEn: 'Terms of Service' },
                { key: 'booking', labelTh: 'เงื่อนไขการจอง',        labelEn: 'Booking Terms' },
              ].filter(p => p.key !== type).map(p => (
                <button key={p.key}
                  onClick={() => navigate('legal-' + p.key)}
                  className="btn btn-ghost"
                  style={{ fontSize: 13 }}>
                  {lang === 'th' ? p.labelTh : p.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

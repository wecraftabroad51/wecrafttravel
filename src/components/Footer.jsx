function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-r':   return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'line':      return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'facebook':  return <svg {...p}><path d="M14 8h3V5h-3c-2 0-3 1.5-3 3v2H8v3h3v8h3v-8h3l1-3h-4V8z"/></svg>;
    case 'instagram': return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>;
    case 'youtube':   return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>;
    case 'tiktok':    return <svg {...p}><path d="M13 4v10a3.5 3.5 0 1 1-3.5-3.5M13 4c.5 2.5 2 4 4.5 4.5"/></svg>;
    case 'lemon8':    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 8h4l-4 8h5" strokeWidth={2}/></svg>;
    case 'phone':     return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'mail':      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
    case 'map-pin':   return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'clock':     return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    default: return null;
  }
}

function FooterLink({ children, onClick }) {
  return (
    <a
      href="#"
      onClick={e => { e.preventDefault(); onClick?.(); }}
      style={{
        color: 'rgba(255,255,255,.75)', textDecoration: 'none',
        fontSize: 14, display: 'block', padding: '3px 0',
        transition: 'color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#FFB74D'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.75)'}
    >
      {children}
    </a>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 14, fontWeight: 700, color: '#FFB74D',
        borderBottom: '1px solid rgba(255,255,255,.15)',
        paddingBottom: 10, marginBottom: 14,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

const SOCIAL = [
  { icon: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { icon: 'line',      label: 'LINE',      color: '#06c755' },
  { icon: 'instagram', label: 'Instagram', color: '#e1306c' },
  { icon: 'youtube',   label: 'YouTube',   color: '#ff0000' },
  { icon: 'tiktok',    label: 'TikTok',    color: '#010101' },
  { icon: 'lemon8',    label: 'Lemon8',    color: '#f5a623' },
];

export default function Footer({ lang, t, navigate, settings }) {
  const { contact } = settings;

  const activeSocials = settings.social?.filter(s => s.enabled && s.url) || [];

  return (
    <footer style={{ background: '#1a1a2e', color: '#fff', marginTop: 0 }}>
      {/* Main footer */}
      <div className="wrap" style={{ padding: '48px 20px 32px' }}>
        <div className="layout-footer" style={{ gap: 32, alignItems: 'start' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="/logo.png" alt="WeCraft Travel" style={{ width: 60, height: 60, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#FFB74D' }}>WeCraft Travel</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>WE CRAFT TRAVEL · est. 2017</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.65, marginBottom: 20 }}>
              บจก. วีคราฟท์ อะบรอด<br />
              We craft happiness · We craft travel<br />
              เลขประจำตัวผู้เสียภาษี: 0105560030634<br />
              ใบอนุญาต ททท. 11/11550
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.75)' }}>
                <Icon name="phone" size={14} /> {contact?.phone || '061-868-6889'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.75)' }}>
                <Icon name="mail" size={14} /> {contact?.email || 'info@wecraft-travel.com'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.75)' }}>
                <Icon name="clock" size={14} /> จ–ศ 09:00–18:00 น.
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'rgba(255,255,255,.75)' }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name="map-pin" size={14} /></span>
                <span>
                  {contact?.address?.th ||
                    'เลขที่ 99/548 อาคารบี ชั้น 14 ถ.รัชดาภิเษก(ท่าพระ-ตากสิน) แขวงตลาดพลู เขตธนบุรี กทม. 10600'}
                </span>
              </div>
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(activeSocials.length ? activeSocials : SOCIAL).map((s, i) => (
                <a
                  key={i}
                  href={s.url || '#'}
                  onClick={s.url ? undefined : e => e.preventDefault()}
                  target={s.url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,.1)',
                    border: '1px solid rgba(255,255,255,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', textDecoration: 'none',
                    transition: 'background .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = s.color || 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                >
                  <Icon name={s.icon || s.platform} size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <FooterCol title="ทัวร์ต่างประเทศ">
            <FooterLink onClick={() => navigate('tours')}>ทัวร์ยุโรป</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์ญี่ปุ่น</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์จีน</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์เกาหลีใต้</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์ไต้หวัน</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์สิงคโปร์</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>ทัวร์อเมริกา</FooterLink>
          </FooterCol>

          {/* Services */}
          <FooterCol title="บริการของเรา">
            <FooterLink onClick={() => navigate('tours')}>ทัวร์ในประเทศ</FooterLink>
            <FooterLink onClick={() => navigate('promotions')}>โปรโมชั่นพิเศษ</FooterLink>
            <FooterLink onClick={() => navigate('gallery')}>แกลเลอรี่</FooterLink>
            <FooterLink onClick={() => navigate('articles')}>บทความท่องเที่ยว</FooterLink>
            <FooterLink onClick={() => navigate('faq')}>คำถามที่พบบ่อย</FooterLink>
            <FooterLink onClick={() => navigate('contact')}>ติดต่อเรา</FooterLink>
          </FooterCol>

          {/* Newsletter */}
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: '#FFB74D',
              borderBottom: '1px solid rgba(255,255,255,.15)',
              paddingBottom: 10, marginBottom: 14,
            }}>
              รับข่าวสารและโปรโมชั่น
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, marginBottom: 14 }}>
              สมัครรับข่าวสาร โปรโมชั่นพิเศษ และทริปใหม่ๆ ก่อนใคร!
            </p>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff', padding: '10px 14px',
                  borderRadius: 6, width: '100%',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', borderRadius: 6, padding: '10px 0',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Icon name="arrow-r" size={14} /> สมัครรับข่าวสาร
              </button>
            </form>

            <div style={{
              marginTop: 20, padding: '14px', borderRadius: 8,
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>ช่องทางติดต่อ LINE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4CAF50' }}>@wecrafttravel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: 'rgba(0,0,0,.3)', padding: '14px 0' }}>
        <div className="wrap" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13, color: 'rgba(255,255,255,.45)', flexWrap: 'wrap', gap: 10,
        }}>
          <div>© 2026 บจก. วีคราฟท์ อะบรอด (We Craft Abroad Co.,Ltd) · wecraft-travel.com</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>นโยบายความเป็นส่วนตัว</a>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>เงื่อนไขการใช้บริการ</a>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>เงื่อนไขการจอง</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

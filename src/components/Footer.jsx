function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'line':        return <svg {...p}><path d="M21 11c0 4.4-4 8-9 8-1 0-2-.1-3-.4L4 20l1.5-3.6A8.4 8.4 0 0 1 3 11c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'facebook':    return <svg {...p}><path d="M14 8h3V5h-3c-2 0-3 1.5-3 3v2H8v3h3v8h3v-8h3l1-3h-4V8z"/></svg>;
    case 'instagram':   return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>;
    case 'youtube':     return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>;
    case 'tiktok':      return <svg {...p}><path d="M13 4v10a3.5 3.5 0 1 1-3.5-3.5M13 4c.5 2.5 2 4 4.5 4.5"/></svg>;
    case 'phone':       return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'mail':        return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
    case 'map-pin':     return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    default: return null;
  }
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {children}
      </div>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
      style={{ color: 'rgba(244,239,230,.85)', textDecoration: 'none', fontSize: 14 }}
    >
      {children}
    </a>
  );
}

export default function Footer({ lang, t, navigate, settings }) {
  const { contact } = settings;

  const socialIcons = ['line', 'facebook', 'instagram', 'youtube', 'tiktok'];

  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--canvas)', marginTop: 80 }}>
      <div className="wrap-wide" style={{ padding: '80px 32px 28px' }}>
        <div className="layout-footer" style={{ gap: 48, alignItems: 'start' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="var(--canvas)" strokeWidth="1.4"/>
                <path d="M9 22 L14 12 L18 20 L22 12 L27 22"
                      stroke="var(--canvas)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="18" cy="18" r="1.6" fill="var(--accent)"/>
              </svg>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--canvas)' }}>
                  WeCraft <span style={{ fontStyle: 'italic', fontWeight: 400, fontFamily: 'Instrument Serif, serif' }}>Travel</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(244,239,230,.5)', letterSpacing: '.18em', marginTop: 2, textTransform: 'uppercase' }}>
                  Crafted journeys · est. 2015
                </div>
              </div>
            </div>
            <p style={{ marginTop: 24, fontSize: 14, color: 'rgba(244,239,230,.7)', maxWidth: 320, lineHeight: 1.55 }}>
              {lang === 'th'
                ? 'เราออกแบบทัวร์ยุโรปกลุ่มเล็กสำหรับนักท่องเที่ยวชาวไทยที่ใส่ใจในความช้า ผู้คน และช่วงเวลาระหว่างทาง'
                : 'We design small-group European journeys for Thai travelers who care about pace, people, and the spaces in between.'}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {(settings.social?.filter(s => s.enabled && s.url) || []).map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                   style={{
                     width: 38, height: 38, borderRadius: '50%',
                     border: '1px solid rgba(244,239,230,.2)',
                     display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                     color: 'var(--canvas)', textDecoration: 'none',
                   }}>
                  <Icon name={s.platform} size={15} />
                </a>
              ))}
              {/* Fallback social icons when none configured */}
              {(!settings.social || !settings.social.filter(s => s.enabled && s.url).length) &&
                socialIcons.map(s => (
                  <a key={s} href="#" onClick={e => e.preventDefault()}
                     style={{
                       width: 38, height: 38, borderRadius: '50%',
                       border: '1px solid rgba(244,239,230,.2)',
                       display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                       color: 'var(--canvas)', textDecoration: 'none',
                     }}>
                    <Icon name={s} size={15} />
                  </a>
                ))
              }
            </div>
          </div>

          <FooterCol title={lang === 'th' ? 'สำรวจ' : 'Explore'}>
            <FooterLink onClick={() => navigate('tours')}>{lang === 'th' ? 'ทัวร์ทั้งหมด' : 'All tours'}</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>{lang === 'th' ? 'แยกตามทวีป' : 'By continent'}</FooterLink>
            <FooterLink onClick={() => navigate('tours')}>{lang === 'th' ? 'แยกตามเดือน' : 'By month'}</FooterLink>
            <FooterLink onClick={() => navigate('gallery')}>{lang === 'th' ? 'แกลเลอรี่' : 'Gallery'}</FooterLink>
            <FooterLink onClick={() => navigate('articles')}>{lang === 'th' ? 'บทความ' : 'Journal'}</FooterLink>
          </FooterCol>

          <FooterCol title={lang === 'th' ? 'บริษัท' : 'Company'}>
            <FooterLink>{lang === 'th' ? 'เกี่ยวกับเรา' : 'About us'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'ไกด์ของเรา' : 'Our guides'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'ร่วมงานกับเรา' : 'Careers'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'สื่อมวลชน' : 'Press'}</FooterLink>
            <FooterLink>TAT License 11/12345</FooterLink>
          </FooterCol>

          <FooterCol title={lang === 'th' ? 'ความช่วยเหลือ' : 'Help'}>
            <FooterLink onClick={() => navigate('faq')}>FAQ</FooterLink>
            <FooterLink onClick={() => navigate('contact')}>{lang === 'th' ? 'ติดต่อเรา' : 'Contact'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'เงื่อนไขการจอง' : 'Booking terms'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'สนับสนุนวีซ่า' : 'Visa support'}</FooterLink>
            <FooterLink>{lang === 'th' ? 'ประกันเดินทาง' : 'Travel insurance'}</FooterLink>
          </FooterCol>

          {/* Newsletter */}
          <div>
            <div className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>
              {lang === 'th' ? 'จดหมายข่าว' : 'Newsletter'}
            </div>
            <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.4, color: 'var(--canvas)' }}>
              {lang === 'th'
                ? 'อีเมลเบาๆ ทัวร์ใหม่ เคล็ดลับช่วงไหล่ฤดู และโปสการ์ดจากการเดินทาง'
                : 'Quiet emails. New tours, shoulder-season tips, and the occasional postcard from the road.'}
            </div>
            <form style={{ marginTop: 18, display: 'flex', gap: 8 }} onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  background: 'rgba(244,239,230,.08)',
                  border: '1px solid rgba(244,239,230,.2)',
                  color: 'var(--canvas)', flex: 1,
                }}
              />
              <button type="submit" style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 'var(--r-md)', padding: '0 18px',
                fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center',
              }}>
                <Icon name="arrow-right" size={16} />
              </button>
            </form>
            {/* Contact info */}
            {contact?.phone && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contact.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(244,239,230,.8)' }}>
                    <Icon name="phone" size={13} /> {contact.phone}
                  </div>
                )}
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(244,239,230,.8)' }}>
                    <Icon name="mail" size={13} /> {contact.email}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Watermark */}
        <div style={{ marginTop: 80 }}>
          <svg viewBox="0 0 1200 120" width="100%" height="120" preserveAspectRatio="none" style={{ display: 'block' }}>
            <text x="0" y="105" fontFamily="Space Grotesk" fontSize="140" fontWeight="600"
                  letterSpacing="-0.04em" fill="rgba(244,239,230,.08)">
              WECRAFTTRAVEL
            </text>
          </svg>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 24, paddingTop: 24,
          borderTop: '1px solid rgba(244,239,230,.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'rgba(244,239,230,.5)', flexWrap: 'wrap', gap: 12,
        }}>
          <div>© 2026 WeCraft Travel Co., Ltd. · Bangkok, Thailand</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

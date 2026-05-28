import { LEGAL_DEFAULTS } from '../../lib/legalDefaults.js';

const PAGE_META = {
  privacy: { titleTh: 'นโยบายความเป็นส่วนตัว', titleEn: 'Privacy Policy',    icon: '🔒' },
  terms:   { titleTh: 'เงื่อนไขการใช้บริการ',  titleEn: 'Terms of Service',  icon: '📋' },
  booking: { titleTh: 'เงื่อนไขการจอง',        titleEn: 'Booking Terms',     icon: '✈️' },
};

export default function LegalPage({ lang, navigate, settings, type }) {
  const meta = PAGE_META[type];
  if (!meta) return null;

  const legal   = settings?.legal || {};
  const title   = lang === 'th' ? meta.titleTh : meta.titleEn;
  // ใช้เนื้อหาจาก settings (admin แก้ได้), fallback ไป defaults ถ้ายังไม่เคย save
  const content = lang === 'th'
    ? (legal[type]?.th || LEGAL_DEFAULTS[type].th)
    : (legal[type]?.en || LEGAL_DEFAULTS[type].en);

  return (
    <main className="page-enter" style={{ background: 'var(--canvas)', minHeight: '80vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f3460,#16213e)', padding: '56px 0 48px' }}>
        <div className="wrap-wide" style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{meta.icon}</div>
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
              className="legal-body"
              style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--ink-2)' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <style>{`
              .legal-body h2 { font-size:1.5em;font-weight:800;margin:1.4em 0 .5em;color:var(--ink) }
              .legal-body h3 { font-size:1.1em;font-weight:700;margin:1.2em 0 .4em;color:var(--ink) }
              .legal-body ul  { list-style:disc;padding-left:1.8em;margin:.6em 0 1em }
              .legal-body ol  { list-style:decimal;padding-left:1.8em;margin:.6em 0 1em }
              .legal-body li  { margin-bottom:.4em }
              .legal-body p   { margin-bottom:.9em }
              .legal-body strong { font-weight:700;color:var(--ink) }
            `}</style>

            {/* Links to other legal pages */}
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

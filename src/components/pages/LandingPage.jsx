import { useMemo, useEffect } from 'react';
import TourCard from '../TourCard.jsx';
import { getLandingPage } from '../../lib/landingPages.js';

// ── เซลเพจ (Landing Page) — ใช้โครงเดียวกันทุกหน้า ตั้งค่าที่ src/lib/landingPages.js ──
// โครง: ปัญหา (pain) → ทางออกของเรา → ทัวร์ที่ตรงเงื่อนไข → ความน่าเชื่อถือ → CTA
export default function LandingPage({ lang, t, navigate, tours = [], supplierTours = [], suppliersLoading = 0, reviews = [], slug, compareList = [], toggleCompare }) {
  const page = getLandingPage(slug);
  const allTours = useMemo(() => [...(tours || []), ...(supplierTours || [])], [tours, supplierTours]);

  // ทัวร์ที่ตรงเงื่อนไขของเพจนี้ (ราคาถูกสุดก่อน) · ถ้าน้อยเกินไปใช้เงื่อนไขสำรอง
  const picked = useMemo(() => {
    if (!page?.filter) return [];
    let list = allTours.filter(page.filter);
    if (list.length < 4 && page.fallback) {
      const extra = allTours.filter(tr => page.fallback(tr) && !list.includes(tr));
      list = [...list, ...extra];
    }
    return list.sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 12);
  }, [allTours, page]);

  // ส่ง event ให้ GTM รู้ว่าเปิดเซลเพจไหน (ใช้วัดผลโฆษณา)
  useEffect(() => {
    if (!page || typeof window === 'undefined' || !window.dataLayer) return;
    window.dataLayer.push({ event: 'view_landing_page', lp_slug: page.slug, lp_title: page.title });
  }, [page]);

  useEffect(() => { if (page) document.title = `${page.title} · WeCraft Travel`; }, [page]);

  if (!page) {
    return (
      <div style={{ padding: '90px 24px', textAlign: 'center', color: '#94a3b8' }}>
        ไม่พบหน้านี้
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('home')}>กลับหน้าแรก</button>
        </div>
      </div>
    );
  }

  const goCta = () => {
    if (page.ctaPage) return navigate(page.ctaPage);
    document.getElementById('lp-tours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const showReviews = (reviews || []).filter(r => r.approved && !r.text?._hidden).slice(0, 3);

  return (
    <main className="page-enter">
      <style>{`
        .lp-hero { background: linear-gradient(135deg,#0f3460 0%,#1e4a7a 55%,#e65c00 160%); color:#fff; padding:56px 0 62px; }
        .lp-badge { display:inline-block; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.28);
          padding:6px 16px; border-radius:999px; font-size:14px; font-weight:700; margin-bottom:16px; }
        .lp-h1 { font-size:40px; font-weight:900; line-height:1.2; margin:0 0 12px; letter-spacing:-.01em; }
        .lp-sub { font-size:18px; opacity:.92; margin:0 0 26px; }
        .lp-cta { background:#e65c00; color:#fff; border:none; border-radius:12px; padding:15px 32px;
          font-size:17px; font-weight:800; cursor:pointer; font-family:inherit; box-shadow:0 6px 20px rgba(230,92,0,.4); }
        .lp-cta:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .lp-cta2 { background:#06c755; color:#fff; border:none; border-radius:12px; padding:15px 26px;
          font-size:17px; font-weight:800; cursor:pointer; font-family:inherit; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; }
        .lp-sec { padding:52px 0; }
        .lp-h2 { font-size:29px; font-weight:900; color:#0f172a; margin:0 0 26px; line-height:1.3; }
        .lp-pain { background:#fff7f5; border-left:4px solid #dc2626; border-radius:12px; padding:16px 18px;
          display:flex; gap:12px; align-items:flex-start; }
        .lp-solve { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:22px 20px;
          box-shadow:0 2px 10px rgba(0,0,0,.05); }
        .lp-grid2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); gap:14px; }
        .lp-trust { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; }
        .lp-trust > div { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:18px 14px; text-align:center; }
        .lp-final { background:linear-gradient(135deg,#0f3460,#1e4a7a); color:#fff; border-radius:18px; padding:42px 26px; text-align:center; }
        @media (max-width:640px){ .lp-h1{font-size:29px} .lp-sub{font-size:16px} .lp-h2{font-size:23px} .lp-hero{padding:40px 0 46px} .lp-sec{padding:38px 0} }
      `}</style>

      {/* HERO */}
      <section className="lp-hero">
        <div className="wrap-wide" style={{ maxWidth: 900 }}>
          <span className="lp-badge">{page.badge}</span>
          <h1 className="lp-h1">{page.title}</h1>
          <p className="lp-sub">{page.subtitle}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="lp-cta" onClick={goCta}>{page.cta} →</button>
            <a className="lp-cta2" href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer">
              💬 สอบถามทาง LINE
            </a>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="lp-sec" style={{ background: '#f8fafc' }}>
        <div className="wrap-wide" style={{ maxWidth: 900 }}>
          <h2 className="lp-h2">{page.pain.head}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {page.pain.items.map((x, i) => (
              <div key={i} className="lp-pain">
                <span style={{ fontSize: 19, lineHeight: 1.2 }}>😕</span>
                <span style={{ fontSize: 16.5, color: '#334155', lineHeight: 1.6 }}>{x}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="lp-sec">
        <div className="wrap-wide" style={{ maxWidth: 980 }}>
          <h2 className="lp-h2">✅ {page.solve.head}</h2>
          <div className="lp-grid2">
            {page.solve.items.map((s, i) => (
              <div key={i} className="lp-solve">
                <div style={{ fontSize: 30, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 17.5, fontWeight: 800, color: '#0f3460', marginBottom: 5 }}>{s.t}</div>
                <div style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURS */}
      {page.filter && (
        <section className="lp-sec" id="lp-tours" style={{ background: '#f8fafc' }}>
          <div className="wrap-wide">
            <h2 className="lp-h2">
              🎫 โปรแกรมที่แนะนำ
              {picked.length > 0 && <span style={{ fontSize: 17, color: '#64748b', fontWeight: 700 }}> · {picked.length} โปรแกรม</span>}
            </h2>
            {picked.length === 0 ? (
              <div style={{ padding: 46, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 14, background: '#fff' }}>
                {suppliersLoading > 0 ? (
                  <>
                    <span className="tp-spin" style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #e65c00', borderTopColor: 'transparent', display: 'inline-block' }} />
                    <div style={{ marginTop: 12, fontWeight: 700, color: '#0f172a' }}>กำลังโหลดโปรแกรม…</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>ยังไม่มีโปรแกรมที่ตรงเงื่อนไขในตอนนี้</div>
                    <div style={{ fontSize: 14.5, color: '#64748b', marginTop: 6 }}>ทักหาเราทาง LINE เดี๋ยวจัดหาให้ครับ</div>
                  </>
                )}
              </div>
            ) : (
              <div className="tours-grid" style={{ gap: 16 }}>
                {picked.map(tr => (
                  <TourCard key={tr.id} tour={tr} t={t} navigate={navigate}
                    inCompare={compareList.includes(tr.id)} onCompare={() => toggleCompare?.(tr.id)} />
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: 26 }}>
              <button className="btn btn-light" onClick={() => navigate('tours')}>ดูทัวร์ทั้งหมด →</button>
            </div>
          </div>
        </section>
      )}

      {/* TRUST */}
      <section className="lp-sec">
        <div className="wrap-wide" style={{ maxWidth: 980 }}>
          <h2 className="lp-h2">ทำไมต้อง WeCraft Travel</h2>
          <div className="lp-trust">
            <div><div style={{ fontSize: 26, fontWeight: 900, color: '#e65c00' }}>ททท. 11/11550</div><div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>ใบอนุญาตถูกต้อง</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 900, color: '#e65c00' }}>est. 2017</div><div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>ประสบการณ์ 8 ปี</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 900, color: '#e65c00' }}>50,000+</div><div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>นักท่องเที่ยวไว้ใจ</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 900, color: '#e65c00' }}>ตอบไว</div><div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>จันทร์-เสาร์ 09:00-18:00</div></div>
          </div>

          {showReviews.length > 0 && (
            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
              {showReviews.map((r, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                  <div style={{ color: '#f59e0b', fontSize: 15 }}>{'★'.repeat(r.rating || 5)}</div>
                  <div style={{ fontSize: 15, color: '#334155', margin: '8px 0', lineHeight: 1.6 }}>
                    “{typeof r.text === 'string' ? r.text : (r.text?.th || r.text?.en || '')}”
                  </div>
                  <div style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>— {r.name || 'ลูกค้า WeCraft'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="wrap-wide" style={{ maxWidth: 900 }}>
          <div className="lp-final">
            <div style={{ fontSize: 27, fontWeight: 900, marginBottom: 10 }}>สนใจโปรแกรมไหน ทักมาได้เลย</div>
            <div style={{ fontSize: 16.5, opacity: .9, marginBottom: 24 }}>ทีมงานตอบทุกคำถาม ช่วยเลือกโปรแกรมที่ใช่ ฟรีไม่มีค่าใช้จ่าย</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="lp-cta2" href="https://line.me/R/ti/p/@wecrafttravel" target="_blank" rel="noopener noreferrer">💬 แชท LINE</a>
              <a className="lp-cta" href="tel:0618686889" style={{ textDecoration: 'none', display: 'inline-block' }}>📞 061-868-6889</a>
              {page.ctaPage && <button className="lp-cta" onClick={() => navigate(page.ctaPage)}>{page.cta}</button>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

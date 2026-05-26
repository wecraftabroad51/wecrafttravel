import { useState } from 'react';

function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'swap':        return <svg {...p}><path d="M3 8h14m0 0-4-4m4 4-4 4M21 16H7m0 0 4 4m-4-4 4-4"/></svg>;
    case 'close':       return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'x':           return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    default: return null;
  }
}

export default function CompareBar({ compareList, setCompareList, tours, t, navigate }) {
  const [showModal, setShowModal] = useState(false);
  const selected = tours.filter(tr => compareList.includes(tr.id));

  if (!compareList.length) return null;

  return (
    <>
      <div style={{
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        bottom: 24, zIndex: 45,
        background: 'var(--ink)', color: 'var(--canvas)',
        borderRadius: 999, padding: '10px 12px 10px 20px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', alignItems: 'center', gap: 16,
        maxWidth: 'min(100%, 720px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="swap" size={16} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {t({ th: 'เปรียบเทียบ', en: 'Compare' })} · {compareList.length} of 3
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {selected.map(tr => (
            <span key={tr.id}
                  style={{
                    background: 'rgba(244,239,230,.12)',
                    borderRadius: 999,
                    padding: '4px 8px 4px 4px',
                    fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6,
                    maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
              {tr.image && (
                <img src={tr.image} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(tr.name)}</span>
              <button
                onClick={() => setCompareList(p => p.filter(id => id !== tr.id))}
                style={{ background: 'transparent', color: 'inherit', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}
              >
                <Icon name="close" size={11} />
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button
            onClick={() => setCompareList([])}
            style={{
              background: 'transparent', color: 'rgba(244,239,230,.7)',
              border: 'none', fontSize: 12, cursor: 'pointer', padding: '8px 4px',
            }}
          >
            {t({ th: 'ล้าง', en: 'Clear' })}
          </button>
          <button
            disabled={compareList.length < 2}
            onClick={() => setShowModal(true)}
            style={{
              background: compareList.length < 2 ? 'rgba(244,239,230,.2)' : 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 999,
              padding: '8px 16px', fontSize: 12, fontWeight: 600,
              cursor: compareList.length < 2 ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {t({ th: 'เปรียบเทียบ', en: 'Compare' })} <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>

      {/* Compare Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,31,26,.7)',
          zIndex: 50, display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', padding: 16, overflowY: 'auto',
        }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{
            background: 'var(--card)', borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)', maxWidth: 900, width: '100%',
            marginTop: 40, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '24px 32px', borderBottom: '1px solid var(--line)',
            }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
                {t({ th: 'เปรียบเทียบทัวร์', en: 'Compare Tours' })}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div style={{ overflowX: 'auto', padding: '24px 32px 32px' }}>
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--muted)', paddingRight: 16, width: 140, paddingBottom: 16 }}>
                      {t({ th: 'รายการ', en: 'Item' })}
                    </td>
                    {selected.map(tr => (
                      <th key={tr.id} style={{ textAlign: 'center', paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}>
                        <img src={tr.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t(tr.name)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [t({ th: 'ปลายทาง', en: 'Destination' }), tr => t(tr.destination)],
                    [t({ th: 'ทวีป', en: 'Continent' }), tr => tr.continent],
                    [t({ th: 'ระยะเวลา', en: 'Duration' }), tr => `${tr.duration} ${t({ th: 'วัน', en: 'days' })}`],
                    [t({ th: 'กลุ่มสูงสุด', en: 'Max Group' }), tr => `${tr.groupSize} ${t({ th: 'คน', en: 'pax' })}`],
                    [t({ th: 'สายการบิน', en: 'Airline' }), tr => tr.flight?.outbound?.airline || '-'],
                    [t({ th: 'ราคาเริ่มต้น', en: 'Price from' }), tr => `฿${tr.price?.toLocaleString()}`],
                  ].map(([label, fn]) => (
                    <tr key={label} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 16px 14px 0', color: 'var(--muted)', fontWeight: 500 }}>{label}</td>
                      {selected.map(tr => (
                        <td key={tr.id} style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--ink)' }}>
                          {fn(tr)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${selected.length}, 1fr)`, marginTop: 20 }}>
                <div />
                {selected.map(tr => (
                  <div key={tr.id} style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <button
                      onClick={() => { navigate('tour-detail', tr.id); setShowModal(false); }}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {t({ th: 'ดูรายละเอียด', en: 'View Tour' })} <Icon name="arrow-right" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

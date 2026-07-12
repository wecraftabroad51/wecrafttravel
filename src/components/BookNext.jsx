// ปุ่ม "สนใจจองอะไรต่อ?" — แสดงในหน้าจองสำเร็จของทุกบริการ (cross-sell)
const BOOKINGS = [
  { key: 'tours',          th: 'จอยทัวร์',          en: 'Join a Tour',   icon: '🌏' },
  { key: 'group-quote',    th: 'กรุ๊ปเหมา',         en: 'Group Quote',   icon: '🎯' },
  { key: 'ticket-booking', th: 'จองตั๋วเครื่องบิน', en: 'Flight Ticket', icon: '🎫' },
  { key: 'car-rental',     th: 'จองรถ',             en: 'Car Rental',    icon: '🚗' },
  { key: 'hotel-booking',  th: 'จองโรงแรม',         en: 'Hotel',         icon: '🏨' },
];

export default function BookNext({ current, navigate, lang = 'th' }) {
  const items = BOOKINGS.filter(b => b.key !== current);
  return (
    <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px dashed #e2e2e2' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#444', marginBottom: 14 }}>
        {lang === 'en' ? '✨ Interested in booking something else?' : '✨ สนใจจองอะไรต่อ?'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {items.map(b => (
          <button key={b.key} type="button" onClick={() => navigate(b.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
              border: '1.5px solid #e4e4e4', borderRadius: 12, padding: '11px 16px',
              fontSize: 14, fontWeight: 700, color: '#333', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 1px 5px rgba(0,0,0,.05)', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#e65c00'; e.currentTarget.style.color = '#e65c00'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e4'; e.currentTarget.style.color = '#333'; }}>
            <span style={{ fontSize: 18 }}>{b.icon}</span>
            {lang === 'en' ? b.en : b.th}
          </button>
        ))}
      </div>
    </div>
  );
}

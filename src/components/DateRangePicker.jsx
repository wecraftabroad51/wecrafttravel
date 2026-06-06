import { useState, useEffect, useRef } from 'react';

const DAYS_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function toDateStr(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(str) {
  if (!str) return '';
  const d = parseDate(str);
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()].slice(0, 3)}. ${d.getFullYear()}`;
}

function CalendarMonth({ year, month, startDate, endDate, hoverDate, onSelect, onHover, minDate }) {
  const firstDay = new Date(year, month, 1);
  // Monday-first: 0=Mon ... 6=Sun
  let startDow = firstDay.getDay(); // 0=Sun,1=Mon...
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const hover = hoverDate ? parseDate(hoverDate) : null;
  const min = minDate ? parseDate(minDate) : null;

  const rangeEnd = end || hover;

  return (
    <div style={{ minWidth: 280 }}>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#1a1a2e' }}>
        {MONTHS_TH[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_TH.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const date = new Date(year, month, d);
          const dateStr = toDateStr(date);
          const isStart = startDate === dateStr;
          const isEnd = endDate === dateStr;
          const isPast = min && date < min;
          const inRange = start && rangeEnd && date > (isStart ? start : start) && date < rangeEnd && !isStart && !isEnd;
          const isRangeStart = start && toDateStr(start) === dateStr;
          const isRangeEnd = rangeEnd && toDateStr(rangeEnd) === dateStr;

          let bg = 'transparent';
          let color = '#334155';
          let borderRadius = 8;
          let fontWeight = 400;

          if (isStart || isRangeStart) { bg = '#0f766e'; color = '#fff'; fontWeight = 700; }
          else if (isEnd || isRangeEnd) { bg = '#0f766e'; color = '#fff'; fontWeight = 700; }
          else if (inRange) { bg = '#ccfbf1'; color = '#0f766e'; borderRadius = 0; }

          if (isPast) { color = '#cbd5e1'; bg = 'transparent'; }

          return (
            <div
              key={i}
              onClick={() => !isPast && onSelect(dateStr)}
              onMouseEnter={() => !isPast && onHover(dateStr)}
              onMouseLeave={() => onHover(null)}
              style={{
                textAlign: 'center', padding: '7px 0',
                background: bg, color, borderRadius, fontWeight,
                fontSize: 13, cursor: isPast ? 'not-allowed' : 'pointer',
                transition: 'background .1s',
                opacity: isPast ? 0.4 : 1,
              }}
              onMouseOver={e => { if (!isPast && !isStart && !isEnd && !inRange) e.currentTarget.style.background = '#f0fdfa'; }}
              onMouseOut={e => { if (!isPast && !isStart && !isEnd && !inRange) e.currentTarget.style.background = bg; }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  startDate, endDate,
  onStartChange, onEndChange,
  startLabel = 'วันไป', endLabel = 'วันกลับ',
  minDate,
}) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'
  const [hoverDate, setHoverDate] = useState(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nextMonth = viewMonth === 11 ? { year: viewYear + 1, month: 0 } : { year: viewYear, month: viewMonth + 1 };

  const handleSelect = (dateStr) => {
    if (selecting === 'start') {
      onStartChange(dateStr);
      onEndChange('');
      setSelecting('end');
    } else {
      const start = parseDate(startDate);
      const selected = parseDate(dateStr);
      if (start && selected < start) {
        // clicked before start → make it new start
        onStartChange(dateStr);
        onEndChange('');
        setSelecting('end');
      } else {
        onEndChange(dateStr);
        setSelecting('start');
        setOpen(false);
      }
    }
  };

  const prevMonthNav = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonthNav = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const inp = {
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8,
    padding: '8px 12px', fontSize: 14, color: '#334155',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    width: '100%', display: 'block',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{startLabel}</div>
          <button type="button" onClick={() => { setOpen(true); setSelecting('start'); }}
            style={{ ...inp, borderColor: open && selecting === 'start' ? '#0f766e' : '#e2e8f0' }}>
            {startDate ? formatDisplay(startDate) : <span style={{ color: '#94a3b8' }}>วว/ดด/ปปปป</span>}
          </button>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{endLabel}</div>
          <button type="button" onClick={() => { setOpen(true); setSelecting('end'); }}
            style={{ ...inp, borderColor: open && selecting === 'end' ? '#0f766e' : '#e2e8f0' }}>
            {endDate ? formatDisplay(endDate) : <span style={{ color: '#94a3b8' }}>วว/ดด/ปปปป</span>}
          </button>
        </div>
      </div>

      {/* Hint */}
      {open && (
        <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, marginTop: 4 }}>
          {selecting === 'start' ? '👆 เลือกวันออกเดินทาง' : '👆 เลือกวันเดินทางกลับ'}
        </div>
      )}

      {/* Calendar dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 9999,
          background: '#fff', borderRadius: 16, marginTop: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" onClick={prevMonthNav}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>‹</button>
            <div style={{ display: 'flex', gap: 32 }}>
              <CalendarMonth year={viewYear} month={viewMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onSelect={handleSelect} onHover={setHoverDate} minDate={minDate} />
              <CalendarMonth year={nextMonth.year} month={nextMonth.month}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onSelect={handleSelect} onHover={setHoverDate} minDate={minDate} />
            </div>
            <button type="button" onClick={nextMonthNav}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>›</button>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            <button type="button" onClick={() => { onStartChange(''); onEndChange(''); setSelecting('start'); }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              ล้าง
            </button>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {startDate && endDate ? `${formatDisplay(startDate)} → ${formatDisplay(endDate)}` :
               startDate ? `${formatDisplay(startDate)} → เลือกวันกลับ` : 'เลือกวันออกเดินทาง'}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

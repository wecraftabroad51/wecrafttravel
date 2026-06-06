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
  let startDow = firstDay.getDay();
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
    <div style={{ width: 252 }}>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#1a1a2e' }}>
        {MONTHS_TH[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_TH.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const date = new Date(year, month, d);
          const dateStr = toDateStr(date);
          const isStart = start && toDateStr(start) === dateStr;
          const isEnd = end && toDateStr(end) === dateStr;
          const isHoverEnd = !end && hover && toDateStr(hover) === dateStr;
          const isPast = min && date < min;
          const inRange = start && rangeEnd && date > start && date < rangeEnd;

          let bg = 'transparent';
          let color = '#334155';
          let br = 8;
          let fw = 400;

          if (isStart) { bg = '#0f766e'; color = '#fff'; fw = 700; }
          else if (isEnd || isHoverEnd) { bg = '#0f766e'; color = '#fff'; fw = 700; }
          else if (inRange) { bg = '#ccfbf1'; color = '#0f766e'; br = 0; }

          if (isPast) { color = '#cbd5e1'; bg = 'transparent'; }

          return (
            <div key={i}
              onClick={() => !isPast && onSelect(dateStr)}
              onMouseEnter={() => !isPast && onHover(dateStr)}
              onMouseLeave={() => onHover(null)}
              style={{
                textAlign: 'center', padding: '7px 2px',
                background: bg, color, borderRadius: br, fontWeight: fw,
                fontSize: 13, cursor: isPast ? 'not-allowed' : 'pointer',
                opacity: isPast ? 0.35 : 1,
                transition: 'background .1s',
                userSelect: 'none',
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
  const [selecting, setSelecting] = useState('start');
  const [hoverDate, setHoverDate] = useState(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  // Position dropdown using fixed so it escapes overflow:hidden modals
  const openDropdown = (mode) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.left;
      // Prevent going off right edge of screen
      if (left + 660 > window.innerWidth) left = window.innerWidth - 670;
      setDropPos({ top: rect.bottom + 6, left: Math.max(8, left) });
    }
    setSelecting(mode);
    setOpen(true);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nextMonth = viewMonth === 11
    ? { year: viewYear + 1, month: 0 }
    : { year: viewYear, month: viewMonth + 1 };

  const handleSelect = (dateStr) => {
    if (selecting === 'start') {
      onStartChange(dateStr);
      onEndChange('');
      setSelecting('end');
    } else {
      const s = parseDate(startDate);
      const sel = parseDate(dateStr);
      if (s && sel < s) {
        onStartChange(dateStr);
        onEndChange('');
        setSelecting('end');
      } else {
        onEndChange(dateStr);
        setOpen(false);
        setSelecting('start');
      }
    }
  };

  const prevM = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextM = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const btn = {
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8,
    padding: '9px 12px', fontSize: 14, color: '#334155',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    width: '100%', display: 'block',
  };

  return (
    <>
      <div ref={triggerRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{startLabel}</div>
          <button type="button" onClick={() => openDropdown('start')}
            style={{ ...btn, borderColor: open && selecting === 'start' ? '#0f766e' : '#e2e8f0', boxShadow: open && selecting === 'start' ? '0 0 0 2px #ccfbf1' : 'none' }}>
            {startDate ? formatDisplay(startDate) : <span style={{ color: '#94a3b8' }}>เลือกวันที่</span>}
          </button>
        </div>
        {endLabel && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{endLabel}</div>
            <button type="button" onClick={() => openDropdown('end')}
              style={{ ...btn, borderColor: open && selecting === 'end' ? '#0f766e' : '#e2e8f0', boxShadow: open && selecting === 'end' ? '0 0 0 2px #ccfbf1' : 'none' }}>
              {endDate ? formatDisplay(endDate) : <span style={{ color: '#94a3b8' }}>เลือกวันที่</span>}
            </button>
          </div>
        )}
      </div>

      {open && selecting && (
        <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, marginTop: 4 }}>
          {selecting === 'start' ? '📅 กรุณาเลือกวันออกเดินทาง' : '📅 กรุณาเลือกวันเดินทางกลับ'}
        </div>
      )}

      {/* Calendar — position: fixed เพื่อหนี overflow:hidden */}
      {open && (
        <div ref={dropRef} style={{
          position: 'fixed',
          top: dropPos.top,
          left: dropPos.left,
          zIndex: 99999,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          minWidth: 640,
        }}>
          {/* Header hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: selecting === 'start' ? '#0f766e' : '#64748b' }}>
              {selecting === 'start' ? '● วันออกเดินทาง' : '○ วันออกเดินทาง'}
            </span>
            <span style={{ color: '#e2e8f0' }}>→</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: selecting === 'end' ? '#0f766e' : '#64748b' }}>
              {selecting === 'end' ? '● วันเดินทางกลับ' : '○ วันเดินทางกลับ'}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>✕</button>
          </div>

          {/* 2 Calendars */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            <button type="button" onClick={prevM}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, flexShrink: 0, alignSelf: 'center' }}>‹</button>

            <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
              <CalendarMonth year={viewYear} month={viewMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onSelect={handleSelect} onHover={setHoverDate} minDate={minDate} />
              <div style={{ width: 1, background: '#f1f5f9', alignSelf: 'stretch' }} />
              <CalendarMonth year={nextMonth.year} month={nextMonth.month}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onSelect={handleSelect} onHover={setHoverDate} minDate={minDate} />
            </div>

            <button type="button" onClick={nextM}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, flexShrink: 0, alignSelf: 'center' }}>›</button>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 16 }}>
            <button type="button" onClick={() => { onStartChange(''); onEndChange(''); setSelecting('start'); }}
              style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8, padding: '6px 14px' }}>
              ล้างวันที่
            </button>
            <span style={{ fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
              {startDate && endDate
                ? `${formatDisplay(startDate)} → ${formatDisplay(endDate)}`
                : startDate ? `${formatDisplay(startDate)} → ?`
                : 'เลือกวันออกเดินทางก่อน'}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ยืนยัน
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { LogOut, LayoutDashboard, Globe, Tag, Star, FileText, HelpCircle,
  Mail, Settings, Plane, Check, X, Eye, Trash2, Plus, Edit2, MessageSquare } from 'lucide-react';
import {
  upsertTour, deleteTour, toggleTourFeatured, toggleTourActive,
  upsertArticle, deleteArticle,
  upsertPromotion, deletePromotion, togglePromoActive,
  upsertFaq, deleteFaq,
  approveReview, deleteReview,
  updateBookingStatus, deleteBooking,
  markMessageRead, deleteMessage,
  updateSettings, uploadImage, uploadFile,
} from '../../lib/db.js';
import { supabase } from '../../lib/supabase.js';
import { LEGAL_DEFAULTS } from '../../lib/legalDefaults.js';

const MENU = [
  { key: 'dashboard',   label: 'Dashboard',   labelTh: 'ภาพรวม',       icon: LayoutDashboard },
  { key: 'tours',       label: 'Tours',        labelTh: 'ทัวร์',         icon: Globe },
  { key: 'promotions',  label: 'Promotions',   labelTh: 'โปรโมชั่น',    icon: Tag },
  { key: 'reviews',     label: 'Reviews',      labelTh: 'รีวิว',         icon: Star },
  { key: 'articles',    label: 'Articles',     labelTh: 'บทความ',        icon: FileText },
  { key: 'faqs',        label: 'FAQs',         labelTh: 'คำถามที่พบบ่อย', icon: HelpCircle },
  { key: 'messages',    label: 'Bookings',     labelTh: 'การจอง',        icon: Plane },
  { key: 'settings',    label: 'Settings',     labelTh: 'ตั้งค่า',       icon: Settings },
];

// ⚠️ ค่าต้องตรงกับ TOUR_TYPE_TABS ใน ToursPage.jsx เสมอ
const TOUR_TYPES = [
  { value: 'outbound',      label: 'ทัวร์ต่างประเทศ' },
  { value: 'inbound',       label: 'ทัวร์ในประเทศ' },
  { value: 'premiumtour',   label: 'ทัวร์พรีเมี่ยม' },
  { value: 'hottour',       label: 'ทัวร์โปรไฟไหม้ 🔥' },
  { value: 'tourpackage',   label: 'แพ็คเกจทัวร์' },
  { value: 'cruise',        label: 'เรือสำราญ' },
];

const CONTINENT_OPTIONS = [
  { value: 'Europe',     label: 'ยุโรป',                        countries: ['ฝรั่งเศส','อิตาลี','สวิตเซอร์แลนด์','เยอรมัน','อังกฤษ','สเปน','โปรตุเกส','ออสเตรีย','เนเธอร์แลนด์','เบลเยียม','นอร์เวย์','สวีเดน','เดนมาร์ก','กรีซ','ตุรกี'] },
  { value: 'Asia-East',  label: 'เอเชียตะวันออก',               countries: ['ญี่ปุ่น','จีน','เกาหลีใต้','ไต้หวัน','ฮ่องกง','มาเก๊า'] },
  { value: 'Asia-SE',    label: 'เอเชียตะวันออกเฉียงใต้',       countries: ['สิงคโปร์','เวียดนาม','มาเลเซีย','อินโดนีเซีย','ฟิลิปปินส์','พม่า','กัมพูชา','ลาว','บรูไน'] },
  { value: 'Asia-S-ME',  label: 'เอเชียใต้ / ตะวันออกกลาง',    countries: ['อินเดีย','มัลดีฟส์','ศรีลังกา','สหรัฐอาหรับเอมิเรตส์','ซาอุดีอาระเบีย','กาตาร์','จอร์แดน','อิสราเอล','โอมาน'] },
  { value: 'Americas',   label: 'อเมริกา',                      countries: ['สหรัฐอเมริกา','แคนาดา','เม็กซิโก','เปรู','บราซิล','อาร์เจนตินา','ชิลี'] },
  { value: 'Oceania',    label: 'โอเชียเนีย / แปซิฟิก',         countries: ['ออสเตรเลีย','นิวซีแลนด์','ฟิจิ','ฮาวาย'] },
  { value: 'Africa',     label: 'แอฟริกา',                      countries: ['โมร็อกโก','แอฟริกาใต้','เคนยา','อียิปต์','แทนซาเนีย','มาดากัสการ์'] },
  { value: 'Dom-North',  label: 'ในประเทศ — ภาคเหนือ',          countries: ['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','น่าน','ลำปาง','พะเยา','แพร่','อุตรดิตถ์'] },
  { value: 'Dom-Central',label: 'ในประเทศ — ภาคกลาง/ตะวันออก', countries: ['กรุงเทพฯ','พัทยา','ระยอง','เกาะเสม็ด','เกาะช้าง','กาญจนบุรี','สุพรรณบุรี','อยุธยา'] },
  { value: 'Dom-South',  label: 'ในประเทศ — ภาคใต้',            countries: ['ภูเก็ต','กระบี่','เกาะสมุย','เกาะพะงัน','เกาะลันตา','ตรัง','สตูล','หาดใหญ่'] },
  { value: 'Dom-NE',     label: 'ในประเทศ — ภาคอีสาน',          countries: ['เขาใหญ่','โคราช','ขอนแก่น','อุดรธานี','หนองคาย','เลย','อุบลราชธานี','สกลนคร'] },
];

// ── Reusable Modal Shell ──────────────────────────────────────
function Modal({ title, onClose, children, wide, xl }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${xl ? 'max-w-4xl' : wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[92vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

// ── Image Upload Component ────────────────────────────────────
function ImageUpload({ value, onChange, hint, folder = 'tours' }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)'); return; }
    setUploading(true);
    const { url, error } = await uploadImage(file, folder);
    setUploading(false);
    if (error) { alert('อัพโหลดไม่สำเร็จ: ' + (error.message || JSON.stringify(error))); return; }
    onChange(url);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={inp}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="วาง URL รูปภาพ หรือกดอัพโหลด →"
        />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
        >
          {uploading
            ? <><span className="animate-spin">⏳</span> กำลังอัพโหลด...</>
            : <><span>📁</span> อัพโหลดรูป</>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1.5">📐 {hint}</p>}
      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="" className="h-28 rounded-xl object-cover bg-slate-100 border border-slate-200" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center leading-none"
            title="ลบรูป"
          >×</button>
        </div>
      )}
    </div>
  );
}

// ── PDF Upload Component ──────────────────────────────────────
function PdfUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { alert('กรุณาเลือกไฟล์ PDF เท่านั้น'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 20MB)'); return; }
    setUploading(true);
    const { url, error } = await uploadFile(file, 'pdfs');
    setUploading(false);
    if (error) { alert('อัพโหลดไม่สำเร็จ: ' + (error.message || JSON.stringify(error))); return; }
    onChange(url);
    e.target.value = '';
  };

  const fileName = value ? value.split('/').pop().split('?')[0] : '';

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={inp}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="วาง URL ไฟล์ PDF หรือกดอัพโหลด →"
        />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
        >
          {uploading
            ? <><span className="animate-spin">⏳</span> กำลังอัพโหลด...</>
            : <><span>📄</span> อัพโหลด PDF</>
          }
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
          <span className="text-orange-600 text-lg">📄</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-orange-800 truncate">{fileName || 'ไฟล์ PDF'}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
              คลิกดูไฟล์ →
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
            title="ลบไฟล์ PDF"
          >×</button>
        </div>
      )}
    </div>
  );
}

// ── Rich Text Editor ─────────────────────────────────────────
const SEP = 'sep';
const FONT_SIZES = [
  { label: 'เล็กมาก', val: '1' }, { label: 'เล็ก', val: '2' },
  { label: 'ปกติ',    val: '3' }, { label: 'ใหญ่',   val: '4' },
  { label: 'ใหญ่มาก', val: '5' }, { label: 'ใหญ่พิเศษ', val: '6' },
];
const PRESET_COLORS = [
  '#000000','#374151','#6b7280','#ef4444','#f97316',
  '#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6',
  '#ec4899','#ffffff',
];

function RichEditor({ value, onChange, placeholder, minHeight = 320 }) {
  const ref      = useRef(null);
  const isInit   = useRef(false);
  const fgRef    = useRef(null);
  const bgRef    = useRef(null);
  const [showFgPalette, setShowFgPalette] = useState(false);
  const [showBgPalette, setShowBgPalette] = useState(false);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffff00');

  useEffect(() => {
    if (ref.current && !isInit.current) {
      ref.current.innerHTML = value || '';
      isInit.current = true;
    }
  }, [value]);

  // Close palettes on outside click
  useEffect(() => {
    const close = () => { setShowFgPalette(false); setShowBgPalette(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const exec = (cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML || '');
  };

  const insertLink = () => {
    const url = window.prompt('ใส่ URL ลิงก์:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('ใส่ URL รูปภาพ:', 'https://');
    if (url) exec('insertImage', url);
  };

  const btn = (label, title, action, extra = {}) => (
    <button
      type="button" title={title}
      onMouseDown={e => { e.preventDefault(); action(); }}
      style={{
        padding: '3px 8px', borderRadius: 5,
        border: '1px solid #e2e8f0', background: '#fff',
        color: '#334155', cursor: 'pointer',
        fontSize: 12, fontFamily: 'inherit',
        lineHeight: 1.5, whiteSpace: 'nowrap',
        transition: 'background .1s',
        ...extra,
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
      onMouseLeave={e => e.currentTarget.style.background = extra.background || '#fff'}
    >{label}</button>
  );

  const sep = () => <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 3px', flexShrink: 0 }} />;

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>

      {/* ── ROW 1: History · Format · Script · Size · Color ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center',
        padding: '7px 10px', background: '#f8fafc',
        borderBottom: '1px solid #e9ecef',
      }}>
        {/* Undo / Redo */}
        {btn('↩ Undo', 'เลิกทำ (Ctrl+Z)',   () => exec('undo'))}
        {btn('↪ Redo', 'ทำซ้ำ (Ctrl+Y)',    () => exec('redo'))}
        {sep()}

        {/* Text Format */}
        {btn(<b style={{fontWeight:900}}>B</b>,      'ตัวหนา (Ctrl+B)',        () => exec('bold'))}
        {btn(<i>I</i>,                               'ตัวเอียง (Ctrl+I)',       () => exec('italic'))}
        {btn(<u>U</u>,                               'ขีดเส้นใต้ (Ctrl+U)',    () => exec('underline'))}
        {btn(<s>S</s>,                               'ขีดทับ',                 () => exec('strikeThrough'))}
        {sep()}

        {/* Superscript / Subscript */}
        {btn('x²', 'ตัวยก (Superscript)', () => exec('superscript'))}
        {btn('x₂', 'ตัวห้อย (Subscript)', () => exec('subscript'))}
        {sep()}

        {/* Font Size */}
        <select
          title="ขนาดตัวอักษร"
          defaultValue="3"
          onChange={e => exec('fontSize', e.target.value)}
          style={{
            padding: '3px 6px', borderRadius: 5, border: '1px solid #e2e8f0',
            fontSize: 12, cursor: 'pointer', background: '#fff', color: '#334155',
          }}
        >
          {FONT_SIZES.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
        </select>
        {sep()}

        {/* Text Color */}
        <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
          <button type="button" title="สีตัวอักษร"
            onMouseDown={e => { e.preventDefault(); setShowFgPalette(v => !v); setShowBgPalette(false); }}
            style={{
              padding: '3px 8px', borderRadius: 5, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            <span style={{ fontWeight: 700, color: fgColor, textShadow: fgColor === '#ffffff' ? '0 0 1px #aaa' : 'none' }}>A</span>
            <span style={{ width: 16, height: 4, borderRadius: 2, background: fgColor, border: '1px solid #e2e8f0' }} />
          </button>
          {showFgPalette && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 99,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: 8, display: 'grid', gridTemplateColumns: 'repeat(6,20px)', gap: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,.12)',
            }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button"
                  onMouseDown={e => { e.preventDefault(); setFgColor(c); exec('foreColor', c); setShowFgPalette(false); }}
                  style={{ width: 20, height: 20, borderRadius: 4, background: c, border: c === '#ffffff' ? '1px solid #ccc' : '1px solid transparent', cursor: 'pointer' }}
                />
              ))}
              <input type="color" value={fgColor} title="สีอื่น"
                onChange={e => { setFgColor(e.target.value); exec('foreColor', e.target.value); }}
                style={{ width: 20, height: 20, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
          <button type="button" title="สีไฮไลต์ (พื้นหลัง)"
            onMouseDown={e => { e.preventDefault(); setShowBgPalette(v => !v); setShowFgPalette(false); }}
            style={{
              padding: '3px 8px', borderRadius: 5, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            <span style={{ fontSize: 13 }}>🖊</span>
            <span style={{ width: 16, height: 4, borderRadius: 2, background: bgColor, border: '1px solid #e2e8f0' }} />
          </button>
          {showBgPalette && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 99,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: 8, display: 'grid', gridTemplateColumns: 'repeat(6,20px)', gap: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,.12)',
            }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button"
                  onMouseDown={e => { e.preventDefault(); setBgColor(c); exec('backColor', c); setShowBgPalette(false); }}
                  style={{ width: 20, height: 20, borderRadius: 4, background: c, border: c === '#ffffff' ? '1px solid #ccc' : '1px solid transparent', cursor: 'pointer' }} />
              ))}
              <input type="color" value={bgColor} title="สีอื่น"
                onChange={e => { setBgColor(e.target.value); exec('backColor', e.target.value); }}
                style={{ width: 20, height: 20, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
            </div>
          )}
        </div>
        {sep()}

        {/* Remove Format */}
        {btn('✕ ล้าง', 'ล้างการจัดรูปแบบทั้งหมด', () => exec('removeFormat'), { color: '#ef4444' })}
      </div>

      {/* ── ROW 2: Block · Align · List · Insert ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center',
        padding: '6px 10px', background: '#f1f5f9',
        borderBottom: '1px solid #e9ecef',
      }}>
        {/* Headings */}
        {btn('H1', 'หัวข้อ 1 (ใหญ่สุด)',  () => exec('formatBlock','h1'))}
        {btn('H2', 'หัวข้อ 2',             () => exec('formatBlock','h2'))}
        {btn('H3', 'หัวข้อ 3',             () => exec('formatBlock','h3'))}
        {btn('¶ ปกติ', 'ข้อความปกติ',     () => exec('formatBlock','p'))}
        {btn('" " Quote', 'อ้างอิง/Blockquote', () => exec('formatBlock','blockquote'))}
        {btn('── เส้นคั่น', 'แทรกเส้นแบ่ง', () => exec('insertHorizontalRule'))}
        {sep()}

        {/* Align */}
        {btn('⫷ ซ้าย',  'ชิดซ้าย',   () => exec('justifyLeft'))}
        {btn('⊟ กลาง',  'กึ่งกลาง',  () => exec('justifyCenter'))}
        {btn('⫸ ขวา',   'ชิดขวา',    () => exec('justifyRight'))}
        {btn('≡ เต็ม',   'กระจาย',    () => exec('justifyFull'))}
        {sep()}

        {/* Indent */}
        {btn('→ ร่น',  'เพิ่มการย่อหน้า',  () => exec('indent'))}
        {btn('← ชิด', 'ลดการย่อหน้า',     () => exec('outdent'))}
        {sep()}

        {/* Lists */}
        {btn('• ลิสต์จุด',   'รายการแบบจุด',   () => exec('insertUnorderedList'))}
        {btn('1. ลิสต์เลข',  'รายการแบบตัวเลข', () => exec('insertOrderedList'))}
        {sep()}

        {/* Insert */}
        {btn('🔗 ลิงก์',    'แทรกลิงก์',      insertLink)}
        {btn('🔗✕ ลบลิงก์', 'ลบลิงก์',         () => exec('unlink'))}
        {btn('🖼 รูปภาพ',   'แทรกรูปจาก URL',  insertImage)}
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        data-placeholder={placeholder}
        style={{
          minHeight, padding: '16px 18px',
          outline: 'none', fontSize: 14, lineHeight: 1.8,
          fontFamily: 'inherit', color: '#1e293b',
          overflowY: 'auto',
        }}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8; pointer-events: none;
        }
        [contenteditable] h1 { font-size:1.6em;font-weight:800;margin:.9em 0 .45em;color:#0f172a }
        [contenteditable] h2 { font-size:1.35em;font-weight:700;margin:.8em 0 .4em;color:#1e293b }
        [contenteditable] h3 { font-size:1.1em;font-weight:700;margin:.7em 0 .35em;color:#334155 }
        [contenteditable] blockquote {
          border-left:3px solid #14b8a6;margin:.7em 0;padding:.5em 1em;
          background:#f0fdfa;color:#0f766e;font-style:italic;border-radius:0 6px 6px 0;
        }
        [contenteditable] hr { border:none;border-top:2px solid #e2e8f0;margin:1em 0; }
        [contenteditable] ul { list-style:disc;padding-left:1.6em;margin:.5em 0; }
        [contenteditable] ol { list-style:decimal;padding-left:1.6em;margin:.5em 0; }
        [contenteditable] li { margin-bottom:.3em; }
        [contenteditable] p  { margin:0 0 .7em; }
        [contenteditable] a  { color:#0d9488;text-decoration:underline; }
        [contenteditable] img { max-width:100%;height:auto;border-radius:6px;margin:.5em 0; }
      `}</style>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────
export default function AdminPanel(props) {
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loggedIn, setLoggedIn]   = useState(false);
  const [section, setSection]     = useState('dashboard');
  const [sideOpen, setSideOpen]   = useState(true);

  const { lang, t, setLang, tours, setTours, articles, setArticles,
    promotions, setPromotions, faqs, setFaqs, reviews, setReviews,
    bookings, setBookings, messages, setMessages,
    settings, setSettings, onLogout } = props;

  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin123';
  const checkLogin = () => {
    if (loginForm.user === ADMIN_USER && loginForm.pass === ADMIN_PASS) setLoggedIn(true);
    else alert('Username หรือ Password ไม่ถูกต้อง');
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Admin Login</h1>
          </div>
          <div className="space-y-3">
            <input className={inp} placeholder="Username" value={loginForm.user}
              onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))} />
            <input type="password" className={inp} placeholder="Password" value={loginForm.pass}
              onChange={e => setLoginForm(p => ({ ...p, pass: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') checkLogin(); }} />
            <button
              onClick={checkLogin}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors">
              Login
            </button>
          </div>
          <button onClick={onLogout} className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm transition-colors">← Back to Website</button>
        </div>
      </div>
    );
  }

  const unreadMsg      = messages.filter(m => !m.read).length;
  const pendingReviews = reviews.filter(r => !r.approved).length;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className={`${sideOpen ? 'w-56' : 'w-16'} bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          {sideOpen && <span className="font-bold text-sm truncate">WeCraftTravel Admin</span>}
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {MENU.map(({ key, label, labelTh, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                section === key ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {sideOpen && (
                <span className="truncate">{lang === 'th' ? labelTh : label}
                  {key === 'messages' && unreadMsg > 0      && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadMsg}</span>}
                  {key === 'reviews'  && pendingReviews > 0 && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingReviews}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sideOpen && <span>Exit Admin</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSideOpen(!sideOpen)} className="text-slate-400 hover:text-slate-700">
            {sideOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="text-xs border border-slate-200 px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-50">
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard'  && <DashboardSection tours={tours} articles={articles} bookings={bookings} messages={messages} reviews={reviews} />}
          {section === 'tours'      && <ToursSection tours={tours} setTours={setTours} t={t} />}
          {section === 'promotions' && <PromotionsSection promotions={promotions} setPromotions={setPromotions} t={t} />}
          {section === 'reviews'    && <ReviewsSection reviews={reviews} setReviews={setReviews} tours={tours} t={t} />}
          {section === 'articles'   && <ArticlesSection articles={articles} setArticles={setArticles} t={t} />}
          {section === 'faqs'       && <FaqsSection faqs={faqs} setFaqs={setFaqs} t={t} />}
          {section === 'bookings'   && <BookingsSection bookings={bookings} setBookings={setBookings} tours={tours} t={t} />}
          {section === 'messages'   && <MessagesSection messages={messages} setMessages={setMessages} />}
          {section === 'settings'   && <SettingsSection settings={settings} setSettings={setSettings} t={t} />}
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function DashboardSection({ tours, articles, bookings, messages, reviews }) {
  const stats = [
    { label: 'ทัวร์ทั้งหมด',  value: tours.length,                             color: 'bg-teal-500' },
    { label: 'การจองทั้งหมด',  value: messages.length,                          color: 'bg-blue-500' },
    { label: 'บทความ',         value: articles.length,                          color: 'bg-purple-500' },
    { label: 'รีวิวรอ',        value: reviews.filter(r => !r.approved).length,  color: 'bg-amber-500' },
    { label: 'การจองใหม่',     value: messages.filter(m => !m.read).length,     color: 'bg-red-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-bold text-white ${s.color} rounded-xl py-2 mb-2`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TOURS =====
const EMPTY_TOUR = {
  name: { th: '', en: '' }, destination: { th: '', en: '' }, description: { th: '', en: '' },
  image: '', tourType: 'outbound', continent: 'Asia-East', country: '',
  code: '', duration: 7, groupSize: 20, price: 0, featured: false, active: true,
  pdfUrl: '',
  flight: { outbound: { airline: '', flightNo: '', departure: '', arrival: '' }, return: { airline: '', flightNo: '', departure: '', arrival: '' } },
  hotels: [], itinerary: [], includes: [], excludes: [], priceTiers: [], departures: [], gallery: [],
};

const TOUR_TABS = ['พื้นฐาน', 'ราคา', 'โปรแกรม', 'ที่พัก', 'รวม/ไม่รวม', 'ภาพ'];

function ToursSection({ tours, setTours, t }) {
  const [modal, setModal]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_TOUR);
  const [tourTab, setTourTab]     = useState('พื้นฐาน');
  const [autoSaved, setAutoSaved] = useState(null);
  const autoSaveRef               = useRef(null);

  const openAdd  = () => { setForm(EMPTY_TOUR); setTourTab('พื้นฐาน'); setAutoSaved(null); setModal({ mode: 'add' }); };
  const openEdit = (tour) => { setForm(tour); setTourTab('พื้นฐาน'); setAutoSaved(null); setModal({ mode: 'edit', tour }); };
  const closeModal = () => { clearInterval(autoSaveRef.current); setModal(null); };

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  // Array helpers for priceTiers, departures, itinerary, etc.
  const addToArr = (field, item) => setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), item] }));
  const removeFromArr = (field, idx) => setForm(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));
  const updateArr = (field, idx, val) => setForm(prev => {
    const arr = [...(prev[field] || [])];
    arr[idx] = val;
    return { ...prev, [field]: arr };
  });

  // Auto-save draft every 5 minutes
  useEffect(() => {
    if (!modal) { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!form.name?.th) return;
      setAutoSaved('saving');
      const { data, error } = await upsertTour({ ...form, active: false });
      if (!error && data) {
        setForm(prev => ({ ...prev, id: data.id }));
        setTours(prev => {
          const exists = prev.find(tr => tr.id === data.id);
          return exists ? prev.map(tr => tr.id === data.id ? data : tr) : [data, ...prev];
        });
        setAutoSaved(new Date());
      } else {
        setAutoSaved(null);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(autoSaveRef.current);
  }, [modal, form]);

  const handleSave = async (asDraft = false) => {
    if (!form.name.th) return alert('กรุณากรอกชื่อทัวร์ (ภาษาไทย)');
    setSaving(true);
    const { data, error } = await upsertTour({ ...form, active: asDraft ? false : form.active });
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setTours(prev => {
      const exists = prev.find(tr => tr.id === data.id);
      return exists ? prev.map(tr => tr.id === data.id ? data : tr) : [data, ...prev];
    });
    closeModal();
  };

  const handleDelete = async (tour) => {
    if (!confirm(`ลบทัวร์ "${t(tour.name)}" ใช่ไหม?`)) return;
    const { error } = await deleteTour(tour.id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setTours(prev => prev.filter(tr => tr.id !== tour.id));
  };

  const handleToggleFeatured = async (tour) => {
    const next = !tour.featured;
    const { error } = await toggleTourFeatured(tour.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setTours(prev => prev.map(tr => tr.id === tour.id ? { ...tr, featured: next } : tr));
  };

  const handleToggleActive = async (tour) => {
    const next = !tour.active;
    const { error } = await toggleTourActive(tour.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setTours(prev => prev.map(tr => tr.id === tour.id ? { ...tr, active: next } : tr));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการทัวร์ ({tours.length})</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มทัวร์
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทัวร์</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ทวีป</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">ราคา</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">วัน</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Featured</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">สถานะ</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tours.map(tour => (
              <tr key={tour.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={tour.image} alt="" className="w-10 h-8 rounded object-cover bg-slate-100" />
                    <span className="font-medium text-slate-700">{t(tour.name)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{tour.continent}</td>
                <td className="px-4 py-3 font-semibold text-teal-700">฿{tour.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{tour.duration}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleFeatured(tour)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${tour.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {tour.featured ? '★ Featured' : 'ปกติ'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(tour)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${tour.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {tour.active !== false ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(tour)} className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(tour)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">ยังไม่มีทัวร์</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tour Modal — Tabbed */}
      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มทัวร์ใหม่' : 'แก้ไขทัวร์'} onClose={closeModal} wide>
          {/* Tab bar */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {TOUR_TABS.map(tab => (
              <button key={tab} onClick={() => setTourTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tourTab === tab ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab: พื้นฐาน ── */}
          {tourTab === 'พื้นฐาน' && (
            <div className="space-y-4">
              {/* Tour type + continent + country */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Field label="ประเภทการเดินทาง *">
                  <select className={inp} value={form.tourType || 'international'} onChange={e => setF(['tourType'], e.target.value)}>
                    {TOUR_TYPES.map(tt => <option key={tt.value} value={tt.value}>{tt.label}</option>)}
                  </select>
                </Field>
                <Field label="โซน / ทวีป *">
                  <select className={inp} value={form.continent || ''} onChange={e => { setF(['continent'], e.target.value); setF(['country'], ''); }}>
                    <option value="">-- เลือกโซน --</option>
                    {CONTINENT_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="ประเทศ / จังหวัด *">
                  <select className={inp} value={form.country || ''} onChange={e => setF(['country'], e.target.value)} disabled={!form.continent}>
                    <option value="">-- เลือกประเทศ --</option>
                    {(CONTINENT_OPTIONS.find(c => c.value === form.continent)?.countries || []).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อทัวร์ (ไทย) *">
                  <input className={inp} value={form.name.th} onChange={e => setF(['name','th'], e.target.value)} placeholder="ทัวร์ญี่ปุ่น..." />
                </Field>
                <Field label="ชื่อทัวร์ (English)">
                  <input className={inp} value={form.name.en} onChange={e => setF(['name','en'], e.target.value)} placeholder="Japan Tour..." />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="คำอธิบายปลายทาง (ไทย)">
                  <input className={inp} value={form.destination.th} onChange={e => setF(['destination','th'], e.target.value)} placeholder="โตเกียว โอซาก้า เกียวโต" />
                </Field>
                <Field label="คำอธิบายปลายทาง (English)">
                  <input className={inp} value={form.destination.en} onChange={e => setF(['destination','en'], e.target.value)} placeholder="Tokyo, Osaka, Kyoto" />
                </Field>
              </div>
              <Field label="คำอธิบายทัวร์ (ไทย)">
                <textarea className={inp} rows={4} style={{ resize: 'vertical' }} value={form.description.th} onChange={e => setF(['description','th'], e.target.value)} placeholder="อธิบายไฮไลท์ของทัวร์ สถานที่น่าสนใจ ประสบการณ์ที่จะได้รับ..." />
              </Field>
              <Field label="คำอธิบายทัวร์ (English)">
                <textarea className={inp} rows={3} style={{ resize: 'vertical' }} value={form.description.en} onChange={e => setF(['description','en'], e.target.value)} placeholder="Tour highlights, key attractions and experiences..." />
              </Field>
              <Field label="รูปภาพหลัก">
                <ImageUpload
                  value={form.image}
                  onChange={val => setF(['image'], val)}
                  hint="แนะนำ 1280×720 px (16:9) · JPG/PNG/WebP · ไม่เกิน 5MB"
                  folder="tours/main"
                />
              </Field>
              <div className="grid grid-cols-4 gap-3">
                <Field label="ราคาเริ่มต้น (฿)">
                  <input className={inp} type="number" style={{ textAlign: 'right' }} value={form.price} onChange={e => setF(['price'], Number(e.target.value))} />
                </Field>
                <Field label="ระยะเวลา (วัน)">
                  <input className={inp} type="number" style={{ textAlign: 'center' }} value={form.duration} onChange={e => setF(['duration'], Number(e.target.value))} />
                </Field>
                <Field label="จำนวนคน (สูงสุด)">
                  <input className={inp} type="number" style={{ textAlign: 'center' }} value={form.groupSize} onChange={e => setF(['groupSize'], Number(e.target.value))} />
                </Field>
                <Field label="ส่วนลด (%)">
                  <input className={inp} type="number" min={0} max={99} style={{ textAlign: 'center' }} value={form.discount || 0} onChange={e => setF(['discount'], Number(e.target.value))} placeholder="0" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="รหัสทัวร์ (Tour Code)">
                  <input className={inp} value={form.code || ''} onChange={e => setF(['code'], e.target.value)} placeholder="เช่น CANAQ0326, JPNTOK001" />
                </Field>
                <Field label="สายการบิน">
                  <input className={inp} value={form.flight?.outbound?.airline || ''} onChange={e => setF(['flight','outbound','airline'], e.target.value)} placeholder="เช่น Thai Airways (TG), AirAsia (FD)" />
                </Field>
              </div>
              <Field label="📄 PDF โปรแกรมทัวร์">
                <PdfUpload value={form.pdfUrl || ''} onChange={url => setF(['pdfUrl'], url)} />
              </Field>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setF(['featured'], e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-slate-700">Featured (แนะนำ / โปรไฟไหม้)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active !== false} onChange={e => setF(['active'], e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-slate-700">Active (แสดงในเว็บ)</span>
                </label>
              </div>
            </div>
          )}

          {/* ── Tab: ราคา ── */}
          {tourTab === 'ราคา' && (
            <div className="space-y-6">
              {/* Price Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 text-sm">ระดับราคา (Price Tiers)</h4>
                  <button onClick={() => addToArr('priceTiers', { tier: '', description: '', price: 0 })}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3 h-3" /> เพิ่มระดับ
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.priceTiers || []).map((pt, i) => (
                    <div key={i} className="grid grid-cols-7 gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <input className={`${inp} col-span-2`} placeholder="ชื่อระดับ (ผู้ใหญ่, เด็ก, Single)" value={pt.tier || pt.name || ''}
                        onChange={e => updateArr('priceTiers', i, { ...pt, tier: e.target.value, name: e.target.value })} />
                      <input className={`${inp} col-span-2`} placeholder="รายละเอียด" value={pt.description || ''}
                        onChange={e => updateArr('priceTiers', i, { ...pt, description: e.target.value })} />
                      <input className={`${inp} col-span-2`} type="number" placeholder="ราคา (฿)" value={pt.price || ''}
                        onChange={e => updateArr('priceTiers', i, { ...pt, price: Number(e.target.value) })} />
                      <button onClick={() => removeFromArr('priceTiers', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {!(form.priceTiers || []).length && <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีระดับราคา</p>}
                </div>
              </div>

              {/* Departures */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 text-sm">วันเดินทาง (Departures)</h4>
                  <button onClick={() => addToArr('departures', { date: '', returnDate: '', totalSeats: 20, bookedSeats: 0, price: 0, childPrice: 0, singleSupplement: 0 })}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3 h-3" /> เพิ่มวัน
                  </button>
                </div>
                <div className="space-y-3">
                  {(form.departures || []).map((dep, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">วันไป</label>
                          <input className={inp} type="date" value={dep.date || ''}
                            onChange={e => updateArr('departures', i, { ...dep, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">วันกลับ</label>
                          <input className={inp} type="date" value={dep.returnDate || ''}
                            onChange={e => updateArr('departures', i, { ...dep, returnDate: e.target.value })} />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1">ที่นั่งทั้งหมด</label>
                            <input className={inp} type="number" min={0} value={dep.totalSeats ?? 20}
                              onChange={e => updateArr('departures', i, { ...dep, totalSeats: Number(e.target.value) })} />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1">จองแล้ว</label>
                            <input className={inp} type="number" min={0} value={dep.bookedSeats ?? 0}
                              onChange={e => updateArr('departures', i, { ...dep, bookedSeats: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 items-end">
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">ราคาผู้ใหญ่ (฿)</label>
                          <input className={inp} type="number" min={0} placeholder="0" value={dep.price || ''}
                            onChange={e => updateArr('departures', i, { ...dep, price: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">ราคาเด็ก (฿)</label>
                          <input className={inp} type="number" min={0} placeholder="0" value={dep.childPrice || ''}
                            onChange={e => updateArr('departures', i, { ...dep, childPrice: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">พักเดี่ยว +฿</label>
                          <input className={inp} type="number" min={0} placeholder="0" value={dep.singleSupplement || ''}
                            onChange={e => updateArr('departures', i, { ...dep, singleSupplement: Number(e.target.value) })} />
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => removeFromArr('departures', i)}
                            className="w-full h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold">
                            <X className="w-3.5 h-3.5" /> ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!(form.departures || []).length && <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีวันเดินทาง</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: โปรแกรม ── */}
          {tourTab === 'โปรแกรม' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">โปรแกรมการเดินทาง</h4>
                <button onClick={() => addToArr('itinerary', { title: '', description: '', meals: [], hotel: '' })}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มวัน
                </button>
              </div>
              <div className="space-y-3">
                {(form.itinerary || []).map((day, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <button onClick={() => removeFromArr('itinerary', i)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input className={inp} placeholder="หัวข้อวัน (เช่น เดินทางถึงโตเกียว)" value={day.title}
                      onChange={e => updateArr('itinerary', i, { ...day, title: e.target.value })} />
                    <textarea className={inp} rows={4} style={{ resize: 'vertical' }} placeholder="อธิบายกิจกรรมของวันนี้ สถานที่ที่จะไป ประสบการณ์ที่จะได้รับ..." value={day.description}
                      onChange={e => updateArr('itinerary', i, { ...day, description: e.target.value })} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs text-slate-500 shrink-0">มื้ออาหาร:</span>
                      {['เช้า', 'กลางวัน', 'เย็น'].map(meal => (
                        <label key={meal} className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox"
                            checked={(day.meals || []).includes(meal)}
                            onChange={e => updateArr('itinerary', i, {
                              ...day,
                              meals: e.target.checked
                                ? [...(day.meals || []), meal]
                                : (day.meals || []).filter(m => m !== meal)
                            })}
                            className="w-3.5 h-3.5 accent-teal-600" />
                          <span className="text-xs text-slate-600">{meal}</span>
                        </label>
                      ))}
                    </div>
                    <input className={inp} placeholder="ที่พัก (ชื่อโรงแรม)" value={day.hotel || ''}
                      onChange={e => updateArr('itinerary', i, { ...day, hotel: e.target.value })} />
                  </div>
                ))}
                {!(form.itinerary || []).length && (
                  <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีโปรแกรม — กด "เพิ่มวัน" เพื่อเริ่มต้น</p>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: ที่พัก ── */}
          {tourTab === 'ที่พัก' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">โรงแรม / ที่พัก</h4>
                <button onClick={() => addToArr('hotels', { name: '', stars: 4, description: '' })}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มที่พัก
                </button>
              </div>
              <div className="space-y-3">
                {(form.hotels || []).map((hotel, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input className={`${inp} flex-1`} placeholder="ชื่อโรงแรม" value={hotel.name}
                        onChange={e => updateArr('hotels', i, { ...hotel, name: e.target.value })} />
                      <select className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-24 shrink-0"
                        value={hotel.stars}
                        onChange={e => updateArr('hotels', i, { ...hotel, stars: Number(e.target.value) })}>
                        {[3, 4, 5].map(s => <option key={s} value={s}>{s} ดาว</option>)}
                      </select>
                      <button onClick={() => removeFromArr('hotels', i)}
                        className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea className={inp} rows={3} style={{ resize: 'vertical' }} placeholder="ที่ตั้ง สิ่งอำนวยความสะดวก ระดับของโรงแรม..." value={hotel.description || ''}
                      onChange={e => updateArr('hotels', i, { ...hotel, description: e.target.value })} />
                  </div>
                ))}
                {!(form.hotels || []).length && <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีที่พัก</p>}
              </div>
            </div>
          )}

          {/* ── Tab: รวม/ไม่รวม ── */}
          {tourTab === 'รวม/ไม่รวม' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-700 text-sm">✅ รวมในแพ็กเกจ</h4>
                  <button onClick={() => addToArr('includes', '')}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">
                    + เพิ่ม
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.includes || []).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inp} flex-1`} value={item} placeholder="เช่น ตั๋วเครื่องบิน"
                        onChange={e => updateArr('includes', i, e.target.value)} />
                      <button onClick={() => removeFromArr('includes', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!(form.includes || []).length && <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีรายการ</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-600 text-sm">❌ ไม่รวมในแพ็กเกจ</h4>
                  <button onClick={() => addToArr('excludes', '')}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-semibold">
                    + เพิ่ม
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.excludes || []).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inp} flex-1`} value={item} placeholder="เช่น ค่าวีซ่า"
                        onChange={e => updateArr('excludes', i, e.target.value)} />
                      <button onClick={() => removeFromArr('excludes', i)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!(form.excludes || []).length && <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีรายการ</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: ภาพ ── */}
          {tourTab === 'ภาพ' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 text-sm">แกลเลอรี่รูปภาพ</h4>
                <button onClick={() => addToArr('gallery', '')}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Plus className="w-3 h-3" /> เพิ่มรูป
                </button>
              </div>
              <p className="text-xs text-slate-400 -mt-1 mb-3">📐 แนะนำ 1200×800 px (3:2) · JPG/PNG/WebP · ไม่เกิน 5MB ต่อรูป</p>
              <div className="space-y-3">
                {(form.gallery || []).map((url, i) => (
                  <div key={i} className="flex gap-2 items-start bg-slate-50 p-2 rounded-xl">
                    <div className="flex-1">
                      <ImageUpload
                        value={url}
                        onChange={val => updateArr('gallery', i, val)}
                        folder="tours/gallery"
                      />
                    </div>
                    <button onClick={() => removeFromArr('gallery', i)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {!(form.gallery || []).length && <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีรูปภาพ — กด "เพิ่มรูป" เพื่อเริ่มต้น</p>}
              </div>
            </div>
          )}

          {/* Save/Cancel always at bottom */}
          {autoSaved && (
            <p className="text-xs text-slate-400 text-right mt-3">
              {autoSaved === 'saving' ? '⏳ กำลังบันทึกฉบับร่างอัตโนมัติ...' : `✅ บันทึกอัตโนมัติล่าสุด ${autoSaved instanceof Date ? autoSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}`}
            </p>
          )}
          <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
              {saving ? 'กำลังบันทึก...' : (modal.mode === 'add' ? 'เพิ่มทัวร์' : 'บันทึก')}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              บันทึกฉบับร่าง
            </button>
            <button onClick={closeModal} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-500 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              ยกเลิก
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== PROMOTIONS =====
const EMPTY_PROMO = { title: { th: '', en: '' }, description: { th: '', en: '' }, image: '', badge: '', discount: 10, code: '', active: true };

function PromotionsSection({ promotions, setPromotions, t }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_PROMO);
  const [saving, setSaving] = useState(false);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  const handleSave = async () => {
    if (!form.title.th) return alert('กรุณากรอกชื่อโปรโมชั่น');
    setSaving(true);
    const { data, error } = await upsertPromotion(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setPromotions(prev => modal.mode === 'add' ? [data, ...prev] : prev.map(p => p.id === data.id ? data : p));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบโปรโมชั่นนี้?')) return;
    const { error } = await deletePromotion(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const handleToggle = async (promo) => {
    const next = !promo.active;
    const { error } = await togglePromoActive(promo.id, next);
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: next } : p));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการโปรโมชั่น</h2>
        <button onClick={() => { setForm(EMPTY_PROMO); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มโปรโมชั่น
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{t(promo.title)}</h3>
                <p className="text-xs text-slate-400">{promo.code && `Code: ${promo.code}`}</p>
              </div>
              <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">-{promo.discount}%</span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{t(promo.description)}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => handleToggle(promo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${promo.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {promo.active ? '✅ Active' : '❌ Inactive'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setForm(promo); setModal({ mode: 'edit' }); }}
                  className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(promo.id)}
                  className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มโปรโมชั่น' : 'แก้ไขโปรโมชั่น'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ชื่อ (ไทย) *"><input className={inp} value={form.title.th} onChange={e => setF(['title','th'], e.target.value)} /></Field>
              <Field label="ชื่อ (English)"><input className={inp} value={form.title.en} onChange={e => setF(['title','en'], e.target.value)} /></Field>
            </div>
            <Field label="คำอธิบาย (ไทย)">
              <textarea className={inp} rows={3} style={{ resize: 'vertical' }} value={form.description.th} onChange={e => setF(['description','th'], e.target.value)} placeholder="รายละเอียดโปรโมชั่น เงื่อนไข และสิทธิพิเศษ..." />
            </Field>
            <Field label="คำอธิบาย (English)">
              <textarea className={inp} rows={2} style={{ resize: 'vertical' }} value={form.description.en} onChange={e => setF(['description','en'], e.target.value)} placeholder="Promotion details, conditions and benefits..." />
            </Field>
            <div className="grid gap-3" style={{ gridTemplateColumns: '80px 1fr 1fr' }}>
              <Field label="ส่วนลด (%)">
                <input className={inp} type="number" style={{ textAlign: 'center' }} value={form.discount} onChange={e => setF(['discount'], Number(e.target.value))} />
              </Field>
              <Field label="Promo Code"><input className={inp} value={form.code} onChange={e => setF(['code'], e.target.value)} placeholder="SAVE10" /></Field>
              <Field label="Badge / ป้ายกำกับ"><input className={inp} value={form.badge} onChange={e => setF(['badge'], e.target.value)} placeholder="🔥 Hot Deal" /></Field>
            </div>
            <Field label="รูปภาพโปรโมชั่น">
              <ImageUpload
                value={form.image}
                onChange={val => setF(['image'], val)}
                hint="แนะนำ 1200×630 px (สัดส่วน 1.9:1) · JPG/PNG · ไม่เกิน 5MB"
                folder="promotions"
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== REVIEWS =====
function ReviewsSection({ reviews, setReviews, tours, t }) {
  const handleApprove = async (id) => {
    const { error } = await approveReview(id, true);
    if (error) { alert('อนุมัติไม่สำเร็จ'); return; }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };
  const handleReject = async (id) => {
    if (!confirm('ลบรีวิวนี้?')) return;
    const { error } = await deleteReview(id);
    if (error) { alert('ลบไม่สำเร็จ'); return; }
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">จัดการรีวิว</h2>
      <div className="space-y-4">
        {reviews.map(review => {
          const tour = tours.find(tr => tr.id === review.tourId);
          return (
            <div key={review.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${review.approved ? 'border-green-400' : 'border-amber-400'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{review.name}</span>
                    <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${review.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {review.approved ? 'อนุมัติแล้ว' : 'รอการอนุมัติ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{tour ? t(tour.name) : ''}</p>
                  <p className="text-sm text-slate-600">{t(review.comment || review.text || {})}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!review.approved && (
                    <button onClick={() => handleApprove(review.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleReject(review.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {reviews.length === 0 && <p className="text-slate-400 text-sm">ยังไม่มีรีวิว</p>}
      </div>
    </div>
  );
}

// ===== ARTICLES =====
const ARTICLE_CATS = ['บทความท่องเที่ยว','บทความอาหาร','บทความน่าอ่าน','เกี่ยวกับการเดินทาง'];
const EMPTY_ARTICLE = { title: { th: '', en: '' }, excerpt: { th: '', en: '' }, content: { th: '', en: '' }, image: '', category: 'บทความท่องเที่ยว', author: 'Admin', published: true };

const calcReadTime = (content) => {
  const text = typeof content === 'object'
    ? Object.values(content).join(' ')
    : (content || '');
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

function ArticlesSection({ articles, setArticles, t }) {
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY_ARTICLE);
  const [saving, setSaving]     = useState(false);
  const [autoSaved, setAutoSaved] = useState(null); // null | 'saving' | timestamp
  const autoSaveRef             = useRef(null);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  // Auto-save draft every 5 minutes when modal is open and has title
  useEffect(() => {
    if (!modal) { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!form.title?.th) return;
      setAutoSaved('saving');
      const readTime = calcReadTime(form.content);
      const { data, error } = await upsertArticle({ ...form, readTime, published: false });
      if (!error && data) {
        setForm(prev => ({ ...prev, id: data.id }));
        setArticles(prev => {
          const exists = prev.find(a => a.id === data.id);
          return exists ? prev.map(a => a.id === data.id ? data : a) : [data, ...prev];
        });
        setAutoSaved(new Date());
      } else {
        setAutoSaved(null);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(autoSaveRef.current);
  }, [modal, form]);

  const handleSave = async (asDraft = false) => {
    if (!form.title.th) return alert('กรุณากรอกชื่อบทความ');
    setSaving(true);
    const readTime = calcReadTime(form.content);
    const { data, error } = await upsertArticle({ ...form, readTime, published: asDraft ? false : form.published });
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setArticles(prev => {
      const exists = prev.find(a => a.id === data.id);
      return exists ? prev.map(a => a.id === data.id ? data : a) : [data, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบบทความนี้?')) return;
    const { error } = await deleteArticle(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการบทความ</h2>
        <button onClick={() => { setForm(EMPTY_ARTICLE); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่มบทความ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <img src={article.image || article.coverImage} alt="" className="w-full h-32 object-cover bg-slate-100" />
            <div className="p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-1">{t(article.title)}</h3>
              <div className="flex items-center gap-2 mb-2">
                {article.category && (
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{article.category}</span>
                )}
                <span className="text-xs text-slate-400">{article.author} · {article.readTime || article.readingTime} นาที</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setForm(article); setModal({ mode: 'edit' }); }}
                  className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> แก้ไข
                </button>
                <button onClick={() => handleDelete(article.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่มบทความ' : 'แก้ไขบทความ'} onClose={() => setModal(null)} xl>
          <div className="space-y-4">
            {/* ชื่อบทความ */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="ชื่อบทความ (ไทย) *"><input className={inp} value={form.title.th} onChange={e => setF(['title','th'], e.target.value)} placeholder="หัวข้อบทความภาษาไทย" /></Field>
              <Field label="ชื่อบทความ (English)"><input className={inp} value={form.title.en} onChange={e => setF(['title','en'], e.target.value)} placeholder="Article title in English" /></Field>
            </div>

            {/* Meta */}
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 140px' }}>
              <Field label="หมวดหมู่">
                <select className={inp} value={form.category || 'บทความท่องเที่ยว'} onChange={e => setF(['category'], e.target.value)}>
                  {ARTICLE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ผู้เขียน"><input className={inp} value={form.author} onChange={e => setF(['author'], e.target.value)} /></Field>
            </div>

            {/* รูปภาพ */}
            <Field label="รูปภาพปก (Cover)">
              <ImageUpload
                value={form.image || form.coverImage || ''}
                onChange={val => setF(['image'], val)}
                hint="แนะนำ 1200×630 px (16:9) · JPG/PNG · ไม่เกิน 5MB"
                folder="articles"
              />
            </Field>

            {/* คำอธิบายย่อ */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำอธิบายย่อ (ไทย) — แสดงในหน้ารายการ">
                <textarea className={inp} rows={3} style={{ resize: 'vertical' }} value={form.excerpt?.th || ''} onChange={e => setF(['excerpt','th'], e.target.value)} placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยค เพื่อดึงดูดผู้อ่าน..." />
              </Field>
              <Field label="คำอธิบายย่อ (English)">
                <textarea className={inp} rows={3} style={{ resize: 'vertical' }} value={form.excerpt?.en || ''} onChange={e => setF(['excerpt','en'], e.target.value)} placeholder="Brief summary to attract readers..." />
              </Field>
            </div>

            {/* เนื้อหาบทความ — Rich Text Editor */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                📝 เนื้อหาบทความ — รองรับ ตัวหนา / เอียง / ขีดเส้นใต้ / หัวข้อ / การจัดวาง / รายการ
              </p>
              <Field label="เนื้อหา (ภาษาไทย)">
                <RichEditor
                  value={form.content?.th || ''}
                  onChange={val => setF(['content','th'], val)}
                  placeholder="เขียนเนื้อหาบทความภาษาไทยที่นี่..."
                  minHeight={340}
                />
              </Field>
              <Field label="เนื้อหา (English)">
                <RichEditor
                  value={form.content?.en || ''}
                  onChange={val => setF(['content','en'], val)}
                  placeholder="Write article content in English here..."
                  minHeight={240}
                />
              </Field>
            </div>

            {/* Auto-save status */}
            {autoSaved && (
              <p className="text-xs text-slate-400 text-right -mb-1">
                {autoSaved === 'saving' ? '⏳ กำลังบันทึกฉบับร่างอัตโนมัติ...' : `✅ บันทึกอัตโนมัติล่าสุด ${autoSaved instanceof Date ? autoSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}`}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                บันทึกฉบับร่าง
              </button>
              <button onClick={() => setModal(null)} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-500 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== FAQS =====
const EMPTY_FAQ = { question: { th: '', en: '' }, answer: { th: '', en: '' }, category: 'general', active: true, sortOrder: 0 };

function FaqsSection({ faqs, setFaqs, t }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_FAQ);
  const [saving, setSaving] = useState(false);

  const setF = (path, val) => setForm(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    path.reduce((o, k, i) => { if (i === path.length - 1) o[k] = val; return o[k]; }, next);
    return next;
  });

  const handleSave = async () => {
    if (!form.question.th) return alert('กรุณากรอกคำถาม');
    setSaving(true);
    const { data, error } = await upsertFaq(form);
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setFaqs(prev => modal.mode === 'add' ? [...prev, data] : prev.map(f => f.id === data.id ? data : f));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบ FAQ นี้?')) return;
    const { error } = await deleteFaq(id);
    if (error) { alert('ลบไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleToggle = async (faq) => {
    const next = !faq.active;
    const { error } = await upsertFaq({ ...faq, active: next });
    if (error) { alert('แก้ไขไม่สำเร็จ'); return; }
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, active: next } : f));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการ FAQ</h2>
        <button onClick={() => { setForm(EMPTY_FAQ); setModal({ mode: 'add' }); }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> เพิ่ม FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className="flex-1">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{faq.category}</span>
              <p className="text-sm font-semibold text-slate-700 mt-1">{t(faq.question)}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t(faq.answer)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleToggle(faq)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${faq.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {faq.active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => { setForm(faq); setModal({ mode: 'edit' }); }}
                className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(faq.id)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'เพิ่ม FAQ' : 'แก้ไข FAQ'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำถาม (ไทย) *">
                <textarea className={inp} rows={2} style={{ resize: 'vertical' }} value={form.question.th} onChange={e => setF(['question','th'], e.target.value)} placeholder="คำถามที่ลูกค้าถามบ่อย..." />
              </Field>
              <Field label="คำถาม (English)">
                <textarea className={inp} rows={2} style={{ resize: 'vertical' }} value={form.question.en} onChange={e => setF(['question','en'], e.target.value)} placeholder="Frequently asked question..." />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="คำตอบ (ไทย)">
                <textarea className={inp} rows={6} style={{ resize: 'vertical' }} value={form.answer.th} onChange={e => setF(['answer','th'], e.target.value)} placeholder="คำตอบที่ชัดเจน ครบถ้วน..." />
              </Field>
              <Field label="คำตอบ (English)">
                <textarea className={inp} rows={6} style={{ resize: 'vertical' }} value={form.answer.en} onChange={e => setF(['answer','en'], e.target.value)} placeholder="Clear and complete answer..." />
              </Field>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 100px' }}>
              <Field label="หมวดหมู่">
                <select className={inp} value={form.category} onChange={e => setF(['category'], e.target.value)}>
                  {['general','booking','payment','visa','flight','hotel'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ลำดับ">
                <input className={inp} type="number" style={{ textAlign: 'center' }} value={form.sortOrder} onChange={e => setF(['sortOrder'], Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">ยกเลิก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== BOOKINGS =====
function BookingsSection({ bookings, setBookings, tours, t }) {
  const statusColor = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700' };

  const handleStatus = async (id, status) => {
    const { error } = await updateBookingStatus(id, status);
    if (error) { alert('อัปเดตสถานะไม่สำเร็จ'); return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบการจองนี้?')) return;
    const { error } = await deleteBooking(id);
    if (error) { alert('ลบไม่สำเร็จ'); return; }
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">การจองทั้งหมด ({bookings.length})</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>{['ชื่อ','ทัวร์','จำนวน','ราคารวม','สถานะ','จัดการ'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map(b => {
              const tour = tours.find(tr => tr.id === b.tourId);
              const name = b.customer?.name || b.name || '-';
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{name}</td>
                  <td className="px-4 py-3 text-slate-500">{tour ? t(tour.name) : t(b.tourName) || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{b.travelers}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700">฿{(b.total || b.totalPrice || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[b.status] || 'bg-slate-100 text-slate-500'}`}>{b.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select value={b.status} onChange={e => handleStatus(b.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <button onClick={() => handleDelete(b.id)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">ยังไม่มีการจอง</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== MESSAGES =====
const MSG_TYPES = {
  group:   { label: '🎯 กรุ๊ปเหมา', color: '#e65c00', bg: '#fff3e0', border: '#fb923c' },
  ticket:  { label: '🎫 จองตั๋ว',   color: '#1565c0', bg: '#e3f2fd', border: '#3b82f6' },
  car:     { label: '🚗 รถเช่า',    color: '#166534', bg: '#dcfce7', border: '#22c55e' },
  contact: { label: '💬 ติดต่อ',    color: '#6b21a8', bg: '#f3e8ff', border: '#a855f7' },
};

function getMsgType(msg) {
  const body = (msg.message || msg.body || '');
  const ti   = (msg.tourInterest || msg.tour_interest || '');

  // 1. ตรวจจาก tour_interest ที่แต่ละ form ตั้งค่าไว้ชัดเจน
  if (ti.startsWith('รถเช่า') || ti.includes('รถเช่า'))          return 'car';
  if (ti === 'จองตั๋วเครื่องบิน' || ti.startsWith('จองตั๋ว'))     return 'ticket';

  // 2. ตรวจจาก body ด้วย pattern เจาะจง (ป้องกัน false positive)
  if (body.includes('=== ขอราคากรุ๊ปเหมา') || body.includes('หมายเลขอ้างอิง: GI')) return 'group';
  if (body.includes('ประเภท: จองตั๋วเครื่องบิน') || body.includes('หมายเลขอ้างอิง: TK')) return 'ticket';
  if (body.includes('ประเภท: รถเช่า') || body.includes('หมายเลขอ้างอิง: RC'))          return 'car';

  return 'contact';
}

function parseMsg(body) {
  if (!body) return [];
  return body.split('\n')
    .filter(l => l.includes(':') && !l.startsWith('===') && !l.startsWith('---'))
    .map(l => { const i = l.indexOf(':'); return { k: l.slice(0,i).trim(), v: l.slice(i+1).trim() }; })
    .filter(({ k, v }) => k && v && v !== '-');
}

function MessagesSection({ messages, setMessages }) {
  const [tab,      setTab]      = useState('all');
  const [expanded, setExpanded] = useState(null);

  const handleRead = async (id) => {
    const { error } = await markMessageRead(id);
    if (error) { alert('อัปเดตไม่สำเร็จ'); return; }
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };
  const handleDelete = async (id) => {
    if (!window.confirm('ลบข้อความนี้?')) return;
    const { error } = await deleteMessage(id);
    if (error) { alert('ลบไม่สำเร็จ'); return; }
    setMessages(prev => prev.filter(m => m.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const TABS = [
    { key: 'all',     icon: '📋', label: 'ทั้งหมด'  },
    { key: 'group',   icon: '🎯', label: 'กรุ๊ปเหมา' },
    { key: 'ticket',  icon: '🎫', label: 'จองตั๋ว'  },
    { key: 'car',     icon: '🚗', label: 'รถเช่า'   },
    { key: 'contact', icon: '💬', label: 'ติดต่อ'   },
  ];

  const unread   = messages.filter(m => !m.read).length;
  const filtered = tab === 'all' ? messages : messages.filter(m => getMsgType(m) === tab);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>
          การจอง{' '}
          {unread > 0 && (
            <span style={{ background: '#e65c00', color: '#fff', fontSize: 13, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginLeft: 6 }}>
              {unread} ใหม่
            </span>
          )}
        </h2>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>ทั้งหมด {messages.length} รายการ</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const cnt    = t.key === 'all' ? messages.length : messages.filter(m => getMsgType(m) === t.key).length;
          const newCnt = t.key === 'all' ? unread : messages.filter(m => getMsgType(m) === t.key && !m.read).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: active ? '#0f766e' : '#f1f5f9',
              color: active ? '#fff' : '#475569',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all .15s',
              boxShadow: active ? '0 2px 8px rgba(15,118,110,.3)' : 'none',
            }}>
              {t.icon} {t.label}
              <span style={{
                background: active ? 'rgba(255,255,255,.25)' : newCnt > 0 ? '#e65c00' : '#cbd5e1',
                color: '#fff', fontSize: 11, fontWeight: 800,
                padding: '1px 7px', borderRadius: 20, minWidth: 20, textAlign: 'center',
              }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(msg => {
          const type   = getMsgType(msg);
          const cfg    = MSG_TYPES[type];
          const body   = msg.message || msg.body || '';
          const pairs  = parseMsg(body);
          const open   = expanded === msg.id;
          const seqNo  = pairs.find(p => p.k === 'หมายเลขอ้างอิง')?.v || '';

          return (
            <div key={msg.id} style={{
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              border: `1px solid ${msg.read ? '#e2e8f0' : cfg.border}`,
              borderLeft: `4px solid ${msg.read ? '#cbd5e1' : cfg.border}`,
              boxShadow: msg.read ? 'none' : '0 2px 10px rgba(0,0,0,.06)',
              transition: 'box-shadow .15s',
            }}>
              {/* ── Row header (always visible) ── */}
              <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => setExpanded(open ? null : msg.id)}>

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: cfg.bg, color: cfg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800,
                }}>
                  {(msg.name || '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{msg.name}</span>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{cfg.label}</span>
                    {!msg.read && <span style={{ background: '#e65c00', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>ใหม่</span>}
                    {seqNo && (
                      <span style={{ background: '#0f172a', color: '#f8fafc', fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 20, letterSpacing: '.02em', fontFamily: 'monospace' }}>
                        # {seqNo}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {msg.email && <span>✉ {msg.email}</span>}
                    {msg.phone && <span>☎ {msg.phone}</span>}
                    {(msg.createdAt || msg.date) && (
                      <span>📅 {new Date(msg.createdAt || msg.date).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {!msg.read && (
                    <button onClick={e => { e.stopPropagation(); handleRead(msg.id); }} style={{
                      background: '#ccfbf1', color: '#0f766e', border: 'none',
                      borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}>✓ อ่านแล้ว</button>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleDelete(msg.id); }} style={{
                    width: 32, height: 32, background: '#fef2f2', color: '#ef4444',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                  }}>🗑</button>
                  <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* ── Expanded detail ── */}
              {open && (
                <div style={{ borderTop: `1px solid ${cfg.bg}`, background: '#f8fafc', padding: '16px 20px' }}>
                  {pairs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px 24px' }}>
                      {pairs.map(({ k, v }, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'flex-start' }}>
                          <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 110, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                          <span style={{ color: '#1e293b', fontWeight: 500, wordBreak: 'break-word' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{body}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14 }}>ไม่มีข้อความในหมวดนี้</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== SETTINGS =====
function SettingsSection({ settings, setSettings, t }) {
  const [tab, setTab]       = useState('contact');
  const [saving, setSaving] = useState(false);

  const update = (path, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      path.reduce((obj, key, i) => { if (i === path.length - 1) obj[key] = value; return obj[key]; }, next);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateSettings({ contact: settings.contact, social: settings.social, popup: settings.popup, legal: settings.legal });
    setSaving(false);
    if (error) { alert('บันทึกไม่สำเร็จ: ' + JSON.stringify(error)); return; }
    alert('บันทึกเรียบร้อย ✅');
  };

  const TABS = [
    { key: 'contact',  label: '📞 ติดต่อ' },
    { key: 'social',   label: '🔗 โซเชียล' },
    { key: 'legal',    label: '📄 นโยบาย' },
    { key: 'database', label: '🗄 Database' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Site Settings</h2>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === tb.key ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {tab === 'contact' && (
          <div className="space-y-4">
            {[
              { label: 'โทรศัพท์', key: 'phone' }, { label: 'Email', key: 'email' },
              { label: 'LINE ID', key: 'line' },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <input className={inp} value={settings.contact?.[f.key] || ''} onChange={e => update(['contact', f.key], e.target.value)} />
              </Field>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <Field label="ที่อยู่ (ไทย)">
                <input className={inp} value={settings.contact?.address?.th || ''} onChange={e => update(['contact','address','th'], e.target.value)} />
              </Field>
              <Field label="ที่อยู่ (English)">
                <input className={inp} value={settings.contact?.address?.en || ''} onChange={e => update(['contact','address','en'], e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-3">
            {(settings.social || []).map((s, i) => (
              <div key={s.platform} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: s.color }}>
                  {s.platform[0].toUpperCase()}
                </div>
                <span className="w-20 text-sm text-slate-600 capitalize shrink-0">{s.platform}</span>
                <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={`${s.platform} URL`} value={s.url}
                  onChange={e => { const next = [...settings.social]; next[i] = { ...next[i], url: e.target.value }; setSettings(p => ({ ...p, social: next })); }} />
                <button onClick={() => { const next = [...settings.social]; next[i] = { ...next[i], enabled: !next[i].enabled }; setSettings(p => ({ ...p, social: next })); }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.enabled ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'legal' && (
          <div className="space-y-6">
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
              แก้ไขเนื้อหาหน้านโยบาย — รองรับ HTML (h2, h3, p, ul, li, strong)
            </p>
            {[
              { key: 'privacy', labelTh: '🔒 นโยบายความเป็นส่วนตัว', labelEn: 'Privacy Policy' },
              { key: 'terms',   labelTh: '📋 เงื่อนไขการใช้บริการ',  labelEn: 'Terms of Service' },
              { key: 'booking', labelTh: '✈️ เงื่อนไขการจอง',        labelEn: 'Booking Terms' },
            ].map(({ key, labelTh, labelEn }) => (
              <div key={key} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>{labelTh} — {labelEn}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>ภาษาไทย</label>
                    <textarea
                      rows={10}
                      style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
                      value={settings.legal?.[key]?.th || LEGAL_DEFAULTS[key].th}
                      onChange={e => update(['legal', key, 'th'], e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>English</label>
                    <textarea
                      rows={10}
                      style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
                      value={settings.legal?.[key]?.en || LEGAL_DEFAULTS[key].en}
                      onChange={e => update(['legal', key, 'en'], e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'database' && (
          <div className="space-y-5">
            {/* Supabase status */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${supabase ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className={`w-3 h-3 rounded-full ${supabase ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className={`font-semibold text-sm ${supabase ? 'text-green-800' : 'text-red-800'}`}>
                  {supabase ? 'Supabase: เชื่อมต่อแล้ว ✅' : 'Supabase: ยังไม่ได้เชื่อมต่อ ❌'}
                </div>
                {!supabase && (
                  <div className="text-xs text-red-600 mt-0.5">
                    กรุณาใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env.local แล้ว restart server
                  </div>
                )}
              </div>
            </div>

            {/* Schema instructions */}
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-800 mb-2">📋 ข้อมูลการเชื่อมต่อ Supabase</h3>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>ไปที่ <span className="font-mono bg-slate-100 px-1 rounded">supabase.com</span> → Project ของคุณ</li>
                <li>Project Settings → API → Copy URL + anon key</li>
                <li>ใส่ใน Environment Variables ของ Vercel แล้ว Redeploy</li>
              </ol>
            </div>
          </div>
        )}

        {tab !== 'database' && (
        <button onClick={handleSave} disabled={saving}
          className="mt-6 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          {saving ? 'กำลังบันทึก...' : '💾 บันทึก Settings'}
        </button>
        )}
      </div>
    </div>
  );
}

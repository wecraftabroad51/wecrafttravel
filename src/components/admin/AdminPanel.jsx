import { useState, useEffect, useRef } from 'react';
import DateRangePicker from '../DateRangePicker.jsx';
import { LogOut, LayoutDashboard, Globe, Tag, Star, FileText, HelpCircle,
  Mail, Settings, Plane, Check, X, Eye, Trash2, Plus, Edit2, MessageSquare, Building2,
  Shield, Users } from 'lucide-react';
import {
  signInWithGoogle, signOut, getCurrentUser, onAuthChange, checkAdminAccess,
  listAdmins, addAdmin, removeAdmin, SUPER_ADMIN_EMAIL, isMissingTable,
} from '../../lib/auth.js';
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
  { key: 'dashboard',   label: 'Dashboard',   labelTh: 'ภาพรวม',        icon: LayoutDashboard },
  { key: 'tours',       label: 'Tours',        labelTh: 'ทัวร์ของเรา',   icon: Globe },
  { key: 'suppliers',   label: 'Suppliers',    labelTh: 'ทัวร์ซัพพลายเออร์', icon: Building2 },
  { key: 'promotions',  label: 'Promotions',   labelTh: 'โปรโมชั่น',     icon: Tag },
  { key: 'reviews',     label: 'Reviews',      labelTh: 'รีวิว',          icon: Star },
  { key: 'articles',    label: 'Articles',     labelTh: 'บทความ',         icon: FileText },
  { key: 'faqs',        label: 'FAQs',         labelTh: 'คำถามที่พบบ่อย', icon: HelpCircle },
  { key: 'messages',    label: 'Bookings',     labelTh: 'การจอง',         icon: Plane },
  { key: 'settings',    label: 'Settings',     labelTh: 'ตั้งค่า',        icon: Settings },
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
  const [authUser, setAuthUser]   = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // loading | anon | denied | ok
  const [adminRole, setAdminRole] = useState(null);         // 'super' | 'admin'
  const [signingIn, setSigningIn] = useState(false);
  const [section, setSection]     = useState('dashboard');
  const [sideOpen, setSideOpen]   = useState(true);

  const { lang, t, setLang, tours, setTours, supplierTours = [], articles, setArticles,
    promotions, setPromotions, faqs, setFaqs, reviews, setReviews,
    bookings, setBookings, messages, setMessages,
    settings, setSettings, onLogout } = props;

  // ── ตรวจสอบ session + สิทธิ์ ──────────────────────────────────
  useEffect(() => {
    let active = true;
    // กำลัง redirect กลับจาก Google → รอ session ห้ามโชว์หน้า login แว๊บ
    const returningFromOAuth = /[#&](access_token|error)=/.test(window.location.hash);

    const evalUser = async (u, event) => {
      if (!active) return;
      setAuthUser(u);
      if (!u) {
        // ระหว่างรอ OAuth ยังไม่ตัดสินว่า anon (กันหน้า login แว๊บ)
        if (returningFromOAuth && event !== 'SIGNED_OUT') return;
        setAuthStatus('anon'); setAdminRole(null);
        return;
      }
      const res = await checkAdminAccess(u.email);
      if (!active) return;
      if (res.ok) { setAuthStatus('ok'); setAdminRole(res.role); }
      else        { setAuthStatus('denied'); setAdminRole(null); }
      // ล้าง token ออกจาก URL ให้สะอาด
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    const unsub = onAuthChange(evalUser);
    getCurrentUser().then(u => evalUser(u, 'INITIAL'));

    // กันค้างหน้าโหลด ถ้า OAuth ล้มเหลว/ช้าเกิน 8 วิ
    const safety = setTimeout(() => {
      if (active) setAuthStatus(s => (s === 'loading' ? 'anon' : s));
    }, 8000);

    return () => { active = false; unsub(); clearTimeout(safety); };
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try { await signInWithGoogle(); }
    catch (e) { alert(e.message || 'เข้าสู่ระบบไม่สำเร็จ'); setSigningIn(false); }
  };
  // ออกจากระบบ → กลับมาหน้า login ของ admin (ไม่เด้งออกไปหน้าเว็บลูกค้า)
  const handleSignOut = async () => {
    await signOut();
    setAuthStatus('anon'); setAuthUser(null); setAdminRole(null);
    setSection('dashboard');
  };

  // ── หน้า Loading เต็มจอ (กัน flash การ์ด login) ────────────────
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin" />
          กำลังตรวจสอบสิทธิ์…
        </div>
      </div>
    );
  }

  // ── หน้า Login / สถานะ ─────────────────────────────────────────
  if (authStatus !== 'ok') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">WeCraft Travel Admin</h1>
          <p className="text-sm text-slate-500 mb-6">ระบบจัดการหลังบ้าน</p>

          {authStatus === 'anon' && (
            <button onClick={handleSignIn} disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 border border-slate-300 hover:bg-slate-50 py-3 rounded-xl font-semibold text-slate-700 transition-colors disabled:opacity-60">
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6c-2 1.5-4.7 2.4-7.7 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.6 5.6C41.4 36.2 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              {signingIn ? 'กำลังเปิด Google…' : 'เข้าสู่ระบบด้วย Google'}
            </button>
          )}

          {authStatus === 'denied' && (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-left">
                <div className="font-bold text-red-700 text-sm mb-1">⛔ ไม่มีสิทธิ์เข้าถึง</div>
                <div className="text-xs text-red-600">
                  บัญชี <strong>{authUser?.email}</strong> ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ
                  กรุณาติดต่อ Super Admin เพื่อขอเพิ่มสิทธิ์
                </div>
              </div>
              <button onClick={handleSignOut}
                className="w-full border border-slate-300 hover:bg-slate-50 py-2.5 rounded-xl font-semibold text-slate-600 text-sm transition-colors">
                ออกจากระบบ / เปลี่ยนบัญชี
              </button>
            </div>
          )}

          <button onClick={onLogout} className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm transition-colors">← กลับหน้าเว็บไซต์</button>
        </div>
      </div>
    );
  }

  const unreadMsg      = messages.filter(m => !m.read).length;
  const pendingReviews = reviews.filter(r => !r.approved).length;

  // เมนู admins แสดงเฉพาะ Super Admin
  const menuItems = adminRole === 'super'
    ? [...MENU, { key: 'admins', label: 'User Management', labelTh: 'จัดการผู้ใช้งาน', icon: Shield }]
    : MENU;

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
          {menuItems.map(({ key, label, labelTh, icon: Icon }) => (
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
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sideOpen && <span>ออกจากระบบ</span>}
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
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-slate-700">{authUser?.email}</span>
              {adminRole === 'super' && <span className="text-[10px] text-teal-600 font-bold">SUPER ADMIN</span>}
            </div>
            {authUser?.user_metadata?.avatar_url
              ? <img src={authUser.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              : <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{(authUser?.email || 'A')[0].toUpperCase()}</div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard'  && <DashboardSection tours={tours} supplierTours={supplierTours} articles={articles} bookings={bookings} messages={messages} reviews={reviews} />}
          {section === 'tours'      && <ToursSection tours={tours} setTours={setTours} t={t} />}
          {section === 'suppliers'  && <SuppliersSection supplierTours={supplierTours} />}
          {section === 'promotions' && <PromotionsSection promotions={promotions} setPromotions={setPromotions} t={t} />}
          {section === 'reviews'    && <ReviewsSection reviews={reviews} setReviews={setReviews} tours={tours} t={t} />}
          {section === 'articles'   && <ArticlesSection articles={articles} setArticles={setArticles} t={t} />}
          {section === 'faqs'       && <FaqsSection faqs={faqs} setFaqs={setFaqs} t={t} />}
          {section === 'bookings'   && <BookingsSection bookings={bookings} setBookings={setBookings} tours={tours} t={t} />}
          {section === 'messages'   && <MessagesSection messages={messages} setMessages={setMessages} />}
          {section === 'settings'   && <SettingsSection settings={settings} setSettings={setSettings} t={t} />}
          {section === 'admins'     && adminRole === 'super' && <AdminsSection currentEmail={authUser?.email} />}
        </div>
      </div>
    </div>
  );
}

// ===== ADMINS (super admin only) =====
// ตารางสิทธิ์: super = ทำได้ทุกอย่าง · admin = ทุกอย่างยกเว้นจัดการผู้ดูแลระบบ
const PERMISSIONS = [
  { feature: 'ภาพรวม (Dashboard)',      super: true,  admin: true  },
  { feature: 'จัดการทัวร์ของเรา',        super: true,  admin: true  },
  { feature: 'ทัวร์ซัพพลายเออร์',         super: true,  admin: true  },
  { feature: 'โปรโมชั่น',                super: true,  admin: true  },
  { feature: 'รีวิว',                    super: true,  admin: true  },
  { feature: 'บทความ',                   super: true,  admin: true  },
  { feature: 'คำถามที่พบบ่อย (FAQ)',      super: true,  admin: true  },
  { feature: 'การจอง',                   super: true,  admin: true  },
  { feature: 'ตั้งค่าเว็บไซต์',           super: true,  admin: true  },
  { feature: 'จัดการผู้ดูแลระบบ (Admins)', super: true,  admin: false },
];

function PermsCell({ ok }) {
  return ok
    ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"><Check className="w-4 h-4" /></span>
    : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300"><X className="w-4 h-4" /></span>;
}

function AdminsSection({ currentEmail }) {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState('');
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setAdmins(await listAdmins()); setNeedsSetup(false); }
    catch (e) { setAdmins([]); if (isMissingTable(e)) setNeedsSetup(true); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setMsg(null); setBusy(true);
    try {
      await addAdmin(email, currentEmail);
      setMsg({ ok: true, text: `เพิ่ม ${email.trim().toLowerCase()} แล้ว · ส่งอีเมลแจ้งเรียบร้อย` });
      setEmail('');
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'เพิ่มไม่สำเร็จ' });
    }
    setBusy(false);
  };

  const handleRemove = async (em) => {
    if (!confirm(`ลบสิทธิ์ admin ของ ${em}?`)) return;
    try { await removeAdmin(em); await load(); }
    catch (e) { alert(e.message || 'ลบไม่สำเร็จ'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h2>
        <p className="text-sm text-slate-500 mt-1">จัดการสิทธิ์เข้าถึงหลังบ้าน · เฉพาะ Super Admin เท่านั้น</p>
      </div>

      {/* Setup banner — ยังไม่ได้สร้างตาราง admins */}
      {needsSetup && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 max-w-2xl">
          <div className="font-bold text-amber-800 mb-1">⚙️ ยังตั้งค่าไม่เสร็จ — ต้องสร้างตาราง admins ก่อน</div>
          <p className="text-sm text-amber-700 mb-3">
            ระบบยังหาตาราง <code className="bg-amber-100 px-1 rounded">admins</code> ใน Supabase ไม่เจอ
            (คุณเข้าได้เพราะเป็น Super Admin แต่ยังเพิ่ม admin คนอื่นไม่ได้จนกว่าจะสร้างตาราง)
          </p>
          <ol className="text-sm text-amber-800 list-decimal list-inside space-y-1 mb-2">
            <li>เปิด Supabase Dashboard → <strong>SQL Editor</strong> → New query</li>
            <li>วางสคริปต์จากไฟล์ <code className="bg-amber-100 px-1 rounded">docs/admins-setup.sql</code> → กด <strong>Run</strong></li>
            <li>กลับมาหน้านี้แล้วกด "โหลดใหม่" ด้านล่าง</li>
          </ol>
          <button onClick={load} className="mt-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            🔄 โหลดใหม่
          </button>
        </div>
      )}

      {/* Add admin */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold text-sm">
          <Users className="w-4 h-4" /> เพิ่มผู้ดูแลระบบใหม่
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !busy) handleAdd(); }}
            placeholder="กรอกอีเมล Google ของผู้ดูแลใหม่..."
            className="flex-1 min-w-[240px] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={handleAdd} disabled={busy || !email.trim()}
            className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> {busy ? 'กำลังเพิ่ม…' : 'เพิ่ม + ส่งอีเมล'}
          </button>
        </div>
        {msg && (
          <div className={`mt-3 text-sm rounded-lg px-3 py-2 ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg.ok ? '✅ ' : '⚠️ '}{msg.text}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">
          ผู้ที่ถูกเพิ่มต้องเข้าสู่ระบบด้วยบัญชี Google ที่ตรงกับอีเมลนี้ · ระบบจะส่งอีเมลแจ้งอัตโนมัติ
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">สิทธิ์</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {/* Super admin (fixed) */}
            <tr className="border-b border-slate-100 bg-teal-50/40">
              <td className="px-4 py-3 font-medium text-slate-800">{SUPER_ADMIN_EMAIL}</td>
              <td className="px-4 py-3"><span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">Super Admin</span></td>
              <td className="px-4 py-3 text-right text-slate-300 text-xs">ล็อคไว้</td>
            </tr>
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">กำลังโหลด…</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">ยังไม่มีผู้ดูแลเพิ่มเติม</td></tr>
            ) : admins.map(a => (
              <tr key={a.email} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{a.email}</td>
                <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">Admin</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleRemove(a.email)}
                    className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 text-xs font-semibold">
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ตารางสิทธิ์การใช้งาน ─────────────────────────────── */}
      <div className="mt-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
          <Shield className="w-4 h-4" /> ตารางสิทธิ์การใช้งาน
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">เมนู / สิทธิ์</th>
                <th className="px-4 py-3 text-center text-xs">
                  <span className="inline-block bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">Super Admin</span>
                </th>
                <th className="px-4 py-3 text-center text-xs">
                  <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Admin</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(p => (
                <tr key={p.feature} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-700">{p.feature}</td>
                  <td className="px-4 py-2.5 text-center"><PermsCell ok={p.super} /></td>
                  <td className="px-4 py-2.5 text-center"><PermsCell ok={p.admin} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          <strong>Super Admin</strong> จัดการผู้ดูแลระบบได้ (เพิ่ม/ลบสิทธิ์) · <strong>Admin</strong> เข้าถึงทุกเมนูจัดการเนื้อหาได้ ยกเว้นการจัดการผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}

// ===== SUPPLIERS =====
function SuppliersSection({ supplierTours }) {
  const [search, setSearch]     = useState('');
  const [supFilter, setSupFilter] = useState('all');
  const [viewTour, setViewTour] = useState(null);
  const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const fmt = (d) => {
    if (!d) return '-';
    const parts = String(d).split('-');
    if (parts.length < 3) return d;
    return `${parseInt(parts[2])} ${MONTHS_TH[parseInt(parts[1])-1]} ${parseInt(parts[0])+543}`;
  };

  // รายชื่อซัพพลายเออร์ที่มีข้อมูล
  const supList = Array.from(
    supplierTours.reduce((m, t) => m.set(t._source, t._sourceName || t._source), new Map())
  ); // [ [id, name], ... ]

  const filtered = supplierTours.filter(t => {
    if (supFilter !== 'all' && t._source !== supFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return t.code?.toLowerCase().includes(q) ||
      t.name?.th?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q);
  });

  // Group: supplier → country
  const bySupplier = filtered.reduce((acc, t) => {
    const s = t._source || 'unknown';
    if (!acc[s]) acc[s] = { name: t._sourceName || s, byCountry: {} };
    const c = t.country || 'อื่นๆ';
    if (!acc[s].byCountry[c]) acc[s].byCountry[c] = [];
    acc[s].byCountry[c].push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ทัวร์ซัพพลายเออร์</h2>
          <p className="text-sm text-slate-500 mt-1">ดึงข้อมูล Live จาก API ผู้ผลิตทัวร์ · อ่านอย่างเดียว · ลูกค้าเห็นรวมกับทัวร์ของเรา</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm font-semibold px-3 py-1.5 rounded-lg">
            {supplierTours.length} รายการ
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-lg">
            {supList.length} ซัพพลายเออร์
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[200px] max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="ค้นหารหัส / ชื่อทัวร์ / ประเทศ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setSupFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${supFilter === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          ทั้งหมด
        </button>
        {supList.map(([id, name]) => (
          <button key={id} onClick={() => setSupFilter(id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${supFilter === id ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {name}
          </button>
        ))}
      </div>

      {supplierTours.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-700">
          ⏳ กำลังโหลดข้อมูลจากซัพพลายเออร์... หรือ API ไม่ตอบสนอง
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(bySupplier).map(([supId, { name, byCountry }]) => {
            const supCount = Object.values(byCountry).reduce((n, arr) => n + arr.length, 0);
            return (
              <div key={supId} className="border border-slate-200 rounded-2xl overflow-hidden">
                {/* Supplier header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-teal-300" />
                  <h3 className="text-white font-bold">{name}</h3>
                  <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
                    {supCount} โปรแกรม
                  </span>
                </div>

                <div className="p-4 space-y-5">
                  {Object.entries(byCountry).map(([country, tours]) => (
                    <div key={country}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-bold text-slate-700">{tours[0]?.destination?.th || country}</h4>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">{country}</span>
                        <span className="text-xs text-slate-400">{tours.length} โปรแกรม</span>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ภาพ</th>
                              <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">รหัส</th>
                              <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ชื่อโปรแกรม</th>
                              <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">วัน/คืน</th>
                              <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ราคาเริ่มต้น</th>
                              <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">รอบเดินทาง</th>
                              <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">เดินทางถัดไป</th>
                              <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">PDF</th>
                              <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ดู</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tours.map((tour, i) => {
                              const nextDep = tour.departures?.[0];
                              return (
                                <tr key={tour.id} onClick={() => setViewTour(tour)} title="คลิกเพื่อดูรายละเอียด (อ่านอย่างเดียว)"
                                  className={`border-b border-slate-100 hover:bg-teal-50/50 cursor-pointer transition-colors ${i === tours.length-1 ? 'border-none' : ''}`}>
                                  <td className="px-4 py-2.5">
                                    {tour.image
                                      ? <img src={tour.image} alt="" className="w-14 h-10 rounded object-cover bg-slate-100 border border-slate-200" loading="lazy" />
                                      : <div className="w-14 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 text-lg">🖼️</div>}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{tour.code}</span>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="font-medium text-slate-800 text-xs leading-snug max-w-xs">{tour.name?.th || tour.name?.en}</div>
                                  </td>
                                  <td className="px-4 py-2.5 text-center text-slate-600">{tour.duration}D/{tour._night || (tour.duration-1)}N</td>
                                  <td className="px-4 py-2.5 text-right font-bold text-red-600">{tour.price?.toLocaleString()} ฿</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                      {tour.departures?.length || 0} รอบ
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-center text-slate-600 text-xs">
                                    {nextDep ? fmt(nextDep.date) : '-'}
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    {tour.pdfUrl ? (
                                      <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                        className="text-blue-600 hover:text-blue-800 text-xs underline">PDF</a>
                                    ) : '-'}
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button onClick={e => { e.stopPropagation(); setViewTour(tour); }} title="ดูรายละเอียด"
                                      className="text-teal-600 hover:text-teal-800 inline-flex items-center justify-center">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Popup รายละเอียดทัวร์ (อ่านอย่างเดียว) ─────────────── */}
      {viewTour && <SupplierTourModal tour={viewTour} fmt={fmt} onClose={() => setViewTour(null)} />}
    </div>
  );
}

// ── Modal รายละเอียดทัวร์ซัพพลายเออร์ (read-only) ────────────────
function SupplierTourModal({ tour, fmt, onClose }) {
  const info = [
    { label: 'รหัสทัวร์',    val: tour.code || '-' },
    { label: 'ประเทศ',       val: tour.destination?.th || tour.country || '-' },
    { label: 'ราคาเริ่มต้น',  val: `฿${(tour.price || 0).toLocaleString()}`, red: true },
    { label: 'จำนวนวัน',     val: `${tour.duration || '-'} วัน / ${tour._night || (tour.duration ? tour.duration - 1 : '-')} คืน` },
    { label: 'สายการบิน',    val: tour.airline || '-' },
    { label: 'ระดับโรงแรม',  val: tour._hotelStars ? '⭐'.repeat(tour._hotelStars) : '-' },
    { label: 'จำนวนรอบเดินทาง', val: `${tour.departures?.length || 0} รอบ` },
  ];
  const depStatus = (d) => {
    if (!d.totalSeats) return { t: 'ว่าง', c: 'bg-green-100 text-green-700' };
    const a = d.totalSeats - (d.bookedSeats || 0);
    if (a <= 0) return { t: 'เต็ม', c: 'bg-red-100 text-red-600' };
    if (a <= 5) return { t: `เหลือ ${a}`, c: 'bg-amber-100 text-amber-700' };
    return { t: `ว่าง ${a}`, c: 'bg-green-100 text-green-700' };
  };

  return (
    <Modal title={`รายละเอียดทัวร์ · ${tour._sourceName || 'ซัพพลายเออร์'}`} onClose={onClose} xl>
      <div className="space-y-5">
        {/* Banner */}
        {tour.image && (
          <img src={tour.image} alt="" className="w-full max-h-64 object-cover rounded-xl border border-slate-200 bg-slate-100" />
        )}

        {/* Name */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tour._sourceName}</span>
            {tour.code && <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{tour.code}</span>}
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🔒 อ่านอย่างเดียว (แก้ไขไม่ได้)</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 leading-snug">{tour.name?.th || tour.name?.en}</h3>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {info.map(x => (
            <div key={x.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{x.label}</div>
              <div className={`text-sm font-bold ${x.red ? 'text-red-600' : 'text-slate-700'}`}>{x.val}</div>
            </div>
          ))}
        </div>

        {/* PDF */}
        {tour.pdfUrl && (
          <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            📄 ดาวน์โหลดโปรแกรม (PDF)
          </a>
        )}

        {/* Departures */}
        {tour.departures?.length > 0 && (
          <div>
            <div className="font-semibold text-slate-700 text-sm mb-2">วันเดินทางและราคา ({tour.departures.length} รอบ)</div>
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-slate-100 text-slate-600 text-xs">
                    <th className="px-3 py-2 text-left">วันเดินทาง</th>
                    <th className="px-3 py-2 text-right">ผู้ใหญ่</th>
                    <th className="px-3 py-2 text-right">เด็กทารก</th>
                    <th className="px-3 py-2 text-right">พักเดี่ยว</th>
                    <th className="px-3 py-2 text-right">จอยแลนด์</th>
                    <th className="px-3 py-2 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.departures.map((d, idx) => {
                    const st = depStatus(d);
                    const money = (n) => n ? Number(n).toLocaleString() : '-';
                    return (
                      <tr key={d.periodId || idx} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">
                          {fmt(d.date)}{d.returnDate ? ` – ${fmt(d.returnDate)}` : ''}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-red-600">{money(d.price)}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{money(d.infantPrice)}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{d.singleSupplement ? `+${money(d.singleSupplement)}` : '-'}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{money(d.joinPrice)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.c}`}>{st.t}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ===== DASHBOARD =====
function DashboardSection({ tours, supplierTours = [], articles, bookings, messages, reviews }) {
  const stats = [
    { label: 'ทัวร์ของเรา',    value: tours.length,                             color: 'bg-teal-500' },
    { label: 'ทัวร์ซัพพลายเออร์', value: supplierTours.length,                 color: 'bg-blue-500' },
    { label: 'การจองทั้งหมด',  value: messages.length,                          color: 'bg-indigo-500' },
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

// ===== AIRLINE LIST =====
const AIRLINES = {
  'สายการบินไทย': [
    'Thai Airways (TG)','Bangkok Airways (PG)','Thai AirAsia (FD)','Thai AirAsia X (XJ)',
    'Thai Lion Air (SL)','Nok Air (DD)','Thai Smile (WE)','Thai Vietjet (VZ)',
    'NokScoot (XW)','Kan Air (KR)','Solar Air (8S)','Happy Air (HP)',
  ],
  'เอเชียตะวันออกเฉียงใต้': [
    'AirAsia (AK)','AirAsia X (D7)','Batik Air Malaysia (OD)','Malaysia Airlines (MH)',
    'Firefly (FY)','MASwings (MY)','Malindo Air (OD)',
    'Singapore Airlines (SQ)','Scoot (TR)','Jetstar Asia (3K)','SilkAir (MI)',
    'Vietnam Airlines (VN)','VietJet Air (VJ)','Bamboo Airways (QH)','Pacific Airlines (BL)',
    'Cambodia Angkor Air (K6)','Lanmei Airlines (LQ)','Sky Angkor Airlines (ZA)',
    'Lao Airlines (QV)','Lao Skyway (LK)',
    'Myanmar Airways International (8M)','Air KBZ (K7)','Asian Wings Airways (AW)','FMI Air (FMI)',
    'Garuda Indonesia (GA)','Citilink (QG)','Lion Air (JT)','Batik Air (ID)',
    'Wings Air (IW)','Sriwijaya Air (SJ)','NAM Air (IN)','Trigana Air (IL)',
    'TransNusa (8B)','Pelita Air (6D)','Xpressair (XN)',
    'Philippines Airlines (PR)','Cebu Pacific (5J)','AirAsia Philippines (Z2)',
    'Philippines AirAsia (Z2)','Sunlight Air (SRQ)','Cebgo (DG)','Skyjet Airlines (M8)',
    'Royal Brunei Airlines (BI)',
    'Air Asia Cambodia (K6)',
  ],
  'เอเชียตะวันออก — เกาหลี': [
    'Korean Air (KE)','Asiana Airlines (OZ)','Jeju Air (7C)','Jin Air (LJ)',
    'Air Busan (BX)','Eastar Jet (ZE)','T\'way Air (TW)','Air Seoul (RS)',
    'Aero K (RF)','Air Premia (YP)',
  ],
  'เอเชียตะวันออก — ญี่ปุ่น': [
    'Japan Airlines (JL)','ANA - All Nippon Airways (NH)','Peach Aviation (MM)',
    'Jetstar Japan (GK)','Spring Japan (IJ)','Zipair (ZG)','SkyMark Airlines (BC)',
    'Air Do (HD)','Solaseed Air (6J)','StarFlyer (7G)','Ibex Airlines (FW)',
    'Fuji Dream Airlines (JH)','Oriental Air Bridge (OC)','RAC Ryukyu Air Commuter (DD)',
    'JAL Express (JC)',
  ],
  'เอเชียตะวันออก — จีน': [
    'Air China (CA)','China Eastern (MU)','China Southern (CZ)','Hainan Airlines (HU)',
    'Xiamen Airlines (MF)','Shenzhen Airlines (ZH)','Sichuan Airlines (3U)',
    'Juneyao Airlines (HO)','Shanghai Airlines (FM)','Chongqing Airlines (OQ)',
    'Tianjin Airlines (GS)','Lucky Air (8L)','Ruili Airlines (DR)','9 Air (AQ)',
    'West Air (PN)','Loong Air (GJ)','Colorful Guizhou Airlines (GY)',
    'Urumqi Air (UQ)','Jiuyuan Airlines (JR)','Donghai Airlines (DZ)',
    'Okay Airways (BK)','Suparna Airlines (Y8)','Colorful Guizhou (GY)',
    'Grand China Air (CN)','Beijing Capital Airlines (JD)','Hebei Airlines (NS)',
  ],
  'เอเชียตะวันออก — ไต้หวัน / ฮ่องกง / มาเก๊า': [
    'China Airlines (CI)','Eva Air (BR)','Starlux Airlines (JX)','Mandarin Airlines (AE)',
    'TransAsia Airways (GE)','Tigerair Taiwan (IT)',
    'Cathay Pacific (CX)','HK Express (UO)','Hong Kong Airlines (HX)',
    'Greater Bay Airlines (HB)','Air Hong Kong (LD)',
    'Air Macau (NX)',
  ],
  'เอเชียตะวันออก — มองโกเลีย': [
    'MIAT Mongolian Airlines (OM)','Hunnu Air (MR)','Eznis Airways (EZ)',
  ],
  'เอเชียใต้ — อินเดีย': [
    'Air India (AI)','Air India Express (IX)','IndiGo (6E)','SpiceJet (SG)',
    'Vistara (UK)','GoAir (G8)','AirAsia India (I5)','Akasa Air (QP)',
    'Alliance Air (CD)','Blue Dart Aviation (BZ)','Star Air (S5)',
    'FlyBig (S9)','Flybig (S9)',
  ],
  'เอเชียใต้ — อื่นๆ': [
    'Pakistan International Airlines (PK)','AirBlue (PA)','SereneAir (ER)','AirSial (PF)',
    'SriLankan Airlines (UL)','FitsAir (FAE)','Maldivian (Q2)','FlyMe (FME)',
    'Drukair (KB)','Bhutan Airlines (B3)',
    'Buddha Air (U4)','Yeti Airlines (YT)','Shree Airlines (SHA)',
    'Biman Bangladesh (BG)','US-Bangla Airlines (BS)','NovoAir (VQ)','Regent Airways (RX)',
    'Fly Siam (FS)',
  ],
  'เอเชียกลาง & คอเคซัส': [
    'Air Astana (KC)','FlyArystan (KC2)','SCAT Airlines (DV)',
    'Uzbekistan Airways (HY)','Qanot Sharq (HH)','Silk Avia (SLO)',
    'Tajik Air (7J)','Somon Air (SZ)',
    'Turkmenistan Airlines (T5)',
    'Kyrgyzstan Airlines (QH)','Air Kyrgyzstan (LYN)',
    'Azerbaijan Airlines (J2)','Silk Way West Airlines (7L)','Buta Airways (4B)',
    'Georgian Airways (A9)','Myway Airlines (MYW)',
    'Armenia Aircompany (RM)',
  ],
  'ตะวันออกกลาง': [
    'Emirates (EK)','Etihad Airways (EY)','Air Arabia (G9)','flydubai (FZ)','Air Arabia Abu Dhabi (3L)',
    'Qatar Airways (QR)',
    'Saudi Arabian Airlines (SV)','flynas (XY)','flyadeal (F3)','Nesma Airlines (NE)',
    'Kuwait Airways (KU)','Jazeera Airways (J9)','Wataniya Airways (WAT)',
    'Oman Air (WY)','SalamAir (OV)',
    'Gulf Air (GF)',
    'Middle East Airlines (ME)',
    'Royal Jordanian (RJ)','Roya Jordanian Express (RJX)',
    'Iraqi Airways (IA)','FlyBaghdad (IF)',
    'Iran Air (IR)','Mahan Air (W5)','Qeshm Air (QB)','Iran Airtour (B9)','Zagros Air (IZG)',
    'Yemenia (IY)','Felix Airways (FEL)',
  ],
  'ยุโรป — เยอรมนี / ออสเตรีย / สวิส': [
    'Lufthansa (LH)','Eurowings (EW)','Eurowings Discover (4Y)','Condor (DE)',
    'TUIfly (X3)','Hahn Air (HR)','Sundair (SR)','German Airways (ST)',
    'Austrian Airlines (OS)','LEVEL Austria (LV)',
    'Swiss International Air Lines (LX)','Edelweiss Air (WK)','Helvetic Airways (2L)',
  ],
  'ยุโรป — สหราชอาณาจักร': [
    'British Airways (BA)','easyJet (U2)','Jet2 (LS)','Virgin Atlantic (VS)',
    'TUI Airways (BY)','Loganair (LM)','Eastern Airways (T3)','bmi Regional (BM)',
    'Flybe (BE)','Aurigny Air Services (GR)','Blue Islands (SI)',
  ],
  'ยุโรป — ฝรั่งเศส': [
    'Air France (AF)','Transavia France (TO)','Corsair (SS)','Air Corsica (XK)',
    'Chalair Aviation (CE)','Twinjet (T7)',
  ],
  'ยุโรป — เนเธอร์แลนด์ / เบลเยียม / ลักเซมเบิร์ก': [
    'KLM (KL)','Transavia (HV)','Corendon Dutch Airlines (CD2)',
    'Brussels Airlines (SN)','TUI fly Belgium (TB)',
    'Luxair (LG)',
  ],
  'ยุโรป — สเปน / โปรตุเกส': [
    'Iberia (IB)','Vueling (VY)','Iberia Express (I2)','Air Europa (UX)',
    'Binter Canarias (NT)','Canaryfly (PM)','Air Nostrum (YW)',
    'TAP Air Portugal (TP)','SATA Air Açores (SP)','Azores Airlines (S4)',
  ],
  'ยุโรป — อิตาลี': [
    'ITA Airways (AZ)','Neos (NO)','Blue Panorama (BV)','Air Dolomiti (EN)',
    'Aeroitalia (IG)',
  ],
  'ยุโรป — สแกนดิเนเวีย': [
    'Scandinavian Airlines (SK)','Norwegian Air (DY)','Wideroe (WF)',
    'Finnair (AY)','Nordic Regional Airlines (N7)','Norse Atlantic Airways (N0)',
    'Icelandair (FI)','PLAY Airlines (OG)','Eagle Air (EAG)',
  ],
  'ยุโรป — ไอร์แลนด์ / กรีซ': [
    'Ryanair (FR)','Aer Lingus (EI)','CityJet (WX)',
    'Aegean Airlines (A3)','Olympic Air (OA)','Sky Express (GQ)',
  ],
  'ยุโรป — โปแลนด์ / เช็ก / ฮังการี': [
    'LOT Polish Airlines (LO)','Enter Air (ENT)','Ryanair Sun (RYS)',
    'Czech Airlines (OK)','Smartwings (QS)',
    'Wizz Air (W6)','Wizz Air Hungary (W6H)',
  ],
  'ยุโรป — โรมาเนีย / บัลแกเรีย / โครเอเชีย': [
    'TAROM (RO)','Blue Air (0B)',
    'Bulgaria Air (FB)',
    'Croatia Airlines (OU)',
    'Air Serbia (JU)','Air Montenegro (ME)',
    'Adria Airways (JP)',
  ],
  'ยุโรปตะวันออก — รัสเซีย': [
    'Aeroflot (SU)','Rossiya Airlines (FV)','S7 Airlines (S7)','Ural Airlines (U6)',
    'UTair (UT)','Pobeda (DP)','Nordwind Airlines (N4)','Azur Air (ZF)',
    'Red Wings Airlines (WZ)','Smartavia (5N)','IrAero (IO)',
  ],
  'ยุโรปตะวันออก — อื่นๆ': [
    'Ukraine International Airlines (PS)','SkyUp Airlines (PQ)','Motor Sich Airlines (M9)',
    'Belavia (B2)',
    'Air Moldova (9U)',
    'Air Baltic (BT)',
    'LOT Estonian Airlines (OV)',
  ],
  'แอฟริกาเหนือ': [
    'EgyptAir (MS)','Air Cairo (SM)',
    'Royal Air Maroc (AT)','Air Arabia Maroc (3O)',
    'Air Algerie (AH)','Tassili Airlines (SF)',
    'Tunisair (TU)','Nouvelair (BJ)','Tunisair Express (UG)',
    'Libyan Airlines (LN)',
  ],
  'แอฟริกาตะวันออก & เอธิโอเปีย': [
    'Ethiopian Airlines (ET)',
    'Kenya Airways (KQ)','Jambojet (JM)',
    'RwandAir (WB)',
    'Uganda Airlines (UR)',
    'Precision Air (PW)','Air Tanzania (TC)',
    'Fastjet Tanzania (FN)',
    'Fly540 (5H)',
    'Eritrean Airlines (B8)',
    'Djibouti Airlines (D3)',
    'Somali Airlines (QS)',
  ],
  'แอฟริกาใต้': [
    'South African Airways (SA)','Mango (JE)','FlySafair (FA)','Airlink (4Z)',
    'Comair (MN)','CemAir (CP)',
    'LAM Mozambique (TM)',
    'Air Zimbabwe (UM)',
    'Fastjet Zimbabwe (FN2)',
    'Air Botswana (BP)',
    'Air Namibia (SW)','Namibia Commercial Aviation (NC)',
  ],
  'แอฟริกาตะวันตก & กลาง': [
    'TAAG Angola Airlines (DT)',
    'Air Côte d\'Ivoire (HF)',
    'Arik Air (W3)',
    'Air Nigeria (VK)',
    'Dana Air (9J)',
    'Med-View Airline (VL)',
    'Cronos Airlines (ECI)',
    'Camair-Co (QC)',
    'Gabon Airlines (GY)',
    'Air Gabon (GN)',
    'Congo Airways (DCD)',
    'Air Senegal (HC)',
    'Transair Senegal (8T)',
    'Air Mauritania (MR2)',
    'Air Mali (IB2)',
  ],
  'แอฟริกา — เกาะ': [
    'Air Seychelles (HM)',
    'Air Mauritius (MK)',
    'Air Austral (UU)',
    'Corsair International (SS)',
    'Air Madagascar (MD)',
    'Comoros Aviation (KR2)',
    'Air Mayotte (AYT)',
  ],
  'อเมริกาเหนือ — สหรัฐ': [
    'American Airlines (AA)','United Airlines (UA)','Delta Air Lines (DL)',
    'Southwest Airlines (WN)','JetBlue Airways (B6)','Alaska Airlines (AS)',
    'Spirit Airlines (NK)','Frontier Airlines (F9)','Allegiant Air (G4)',
    'Hawaiian Airlines (HA)','Sun Country Airlines (SY)','Avelo Airlines (XP)',
    'Breeze Airways (MX)','Cape Air (9K)','Contour Airlines (LF)',
    'Southern Airways Express (9X)','CommutAir (C5)','SkyWest Airlines (OO)',
    'Envoy Air (MQ)','PSA Airlines (OH)','Piedmont Airlines (PT)',
  ],
  'อเมริกาเหนือ — แคนาดา': [
    'Air Canada (AC)','WestJet (WS)','Porter Airlines (PD)','Air Transat (TS)',
    'Sunwing Airlines (WG)','Flair Airlines (F8)','Pacific Coastal Airlines (8P)',
    'Canadian North (5T)','Air Inuit (3H)','Air Creebec (YN)',
  ],
  'อเมริกาเหนือ — เม็กซิโก': [
    'Aeromexico (AM)','Volaris (Y4)','VivaAerobus (VB)','Interjet (4O)',
    'Aerolitoral (LC)','Magnicharters (MG)',
  ],
  'อเมริกากลาง & แคริบเบียน': [
    'Copa Airlines (CM)','Copa Airlines Colombia (P6)',
    'Avianca (AV)','Avianca Guatemala (GU)','Avianca Honduras (WC)',
    'TACA Airlines (TA)','Aerogal (2K)',
    'Caribbean Airlines (BW)',
    'Cayman Airways (KX)',
    'Cubana (CU)','Aerocaribbe (7C2)',
    'Bahamasair (UP)',
    'LIAT (LI)',
    'Winair (WM)',
    'Air Caraibes (TX)',
    'Air Antilles (3S)',
    'Intercaribbean Airways (JY)',
    'Amerijet International (M6)',
    'Sunrise Airways (S6)',
  ],
  'อเมริกาใต้ — บราซิล': [
    'LATAM Brasil (JJ)','GOL Transportes Aéreos (G3)','Azul Brazilian Airlines (AD)',
    'Passaredo Linhas Aereas (2Z)','MAP Linhas Aereas (M1)',
  ],
  'อเมริกาใต้ — อื่นๆ': [
    'LATAM Chile (LA)','Sky Airline (H2)','JetSMART (JA)',
    'Aerolíneas Argentinas (AR)','Flybondi (FO)','Andes Líneas Aéreas (OY)',
    'Avianca Colombia (AV)','Wingo (P5)','EasyFly (VE)',
    'Conviasa (V0)','Avior Airlines (9V)','Rutaca Airlines (5R)',
    'Boliviana de Aviación (OB)','Amaszonas (Z8)',
    'LATAM Perú (LP)','Star Peru (2I)','Peruvian Airlines (P9)',
    'Aerosur (5L)','EcoJet (8J)',
    'LATAM Ecuador (XL)','TAME (EQ)',
    'Surinam Airways (PY)','Caribbean Airlines Suriname (BW2)',
    'LATAM Paraguay (PZ)','Paranair (ZP)',
    'BQB Líneas Aéreas (QQ)',
  ],
  'โอเชียเนีย — ออสเตรเลีย': [
    'Qantas (QF)','Jetstar Airways (JQ)','Virgin Australia (VA)',
    'Rex Regional Express (ZL)','Bonza (AB)','Alliance Airlines (QQ2)',
    'Skytrans Airlines (QN)','Airnorth (TL)',
  ],
  'โอเชียเนีย — นิวซีแลนด์ & แปซิฟิก': [
    'Air New Zealand (NZ)','Jetstar New Zealand (JQ)',
    'Fiji Airways (FJ)','Fiji Link (PC2)',
    'Air Vanuatu (NF)',
    'Solomon Airlines (IE)',
    'Air Niugini (PX)','PNG Air (CG)',
    'Air Tahiti Nui (TN)','Air Tahiti (VT)',
    'Air Caledonie (TY)','Aircalin (SB)',
    'Air Rarotonga (GZ)','Air Niue (RP)',
    'Air Marshall Islands (CW)','Our Airline (ON)',
    'Air Pacific (FJ2)',
  ],
};

// ===== AIRLINE SELECT COMPONENT =====
const ALL_AIRLINES_FLAT = Object.entries(AIRLINES).flatMap(([region, list]) =>
  list.map(name => ({ name, region }))
);

function AirlineSelect({ value, onChange }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [custom, setCustom]   = useState(() => value?.startsWith('อื่นๆ:') ? value.slice(4) : '');
  const ref                   = useRef(null);

  const isOther = value === 'อื่นๆ' || value?.startsWith('อื่นๆ:');
  const displayValue = isOther ? (custom ? `อื่นๆ: ${custom}` : 'อื่นๆ (ระบุเอง)') : (value || '');

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? ALL_AIRLINES_FLAT.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_AIRLINES_FLAT;

  const grouped = query.trim()
    ? { 'ผลการค้นหา': filtered.map(a => a.name) }
    : Object.fromEntries(Object.entries(AIRLINES).map(([r, list]) => [r, list]));

  const select = (val) => {
    onChange(val);
    if (val !== 'อื่นๆ') setCustom('');
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button type="button" onClick={() => setOpen(p => !p)}
        className={`${inp} text-left flex items-center justify-between`}
        style={{ cursor: 'pointer' }}>
        <span className={displayValue ? 'text-slate-800' : 'text-slate-400'}>
          {displayValue || '-- เลือกสายการบิน --'}
        </span>
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', marginTop: 4, overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="🔍 ค้นหาสายการบิน..."
              className={inp}
              style={{ margin: 0 }}
            />
          </div>

          {/* List */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {Object.entries(grouped).map(([region, list]) => (
              <div key={region}>
                <div style={{ padding: '6px 12px 2px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc' }}>
                  {region}
                </div>
                {list.map(name => (
                  <button key={name} type="button" onClick={() => select(name)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 16px', fontSize: 13, color: '#334155', background: value === name ? '#f0fdfa' : 'transparent', fontWeight: value === name ? 600 : 400 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
                    onMouseLeave={e => e.currentTarget.style.background = value === name ? '#f0fdfa' : 'transparent'}>
                    {name}
                  </button>
                ))}
              </div>
            ))}
            {/* อื่นๆ */}
            <button type="button" onClick={() => select('อื่นๆ')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: '#0f766e', fontWeight: 600, borderTop: '1px solid #f1f5f9', background: isOther ? '#f0fdfa' : 'transparent' }}>
              ✏️ อื่นๆ (ระบุเอง)
            </button>
          </div>
        </div>
      )}

      {/* Custom input when "อื่นๆ" selected */}
      {isOther && (
        <input
          className={inp}
          style={{ marginTop: 8 }}
          placeholder="ระบุชื่อสายการบิน / หมายเหตุ..."
          value={custom}
          onChange={e => { setCustom(e.target.value); onChange('อื่นๆ:' + e.target.value); }}
        />
      )}
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
  const [aiParsing, setAiParsing] = useState(false);
  const [aiError, setAiError]     = useState(null);
  const [aiPending, setAiPending] = useState(false);
  const autoSaveRef               = useRef(null);

  // ── AI: อ่านไฟล์โปรแกรมทัวร์แล้วเติมข้อมูลลงฟอร์มอัตโนมัติ ──
  const applyAIParsed = (d) => {
    if (!d || typeof d !== 'object') return;
    setForm(prev => {
      const next = { ...prev };
      if (d.name && (d.name.th || d.name.en)) {
        next.name = { th: d.name.th || prev.name?.th || '', en: d.name.en || prev.name?.en || '' };
      }
      if (d.destination && (d.destination.th || d.destination.en)) {
        next.destination = { th: d.destination.th || prev.destination?.th || '', en: d.destination.en || prev.destination?.en || '' };
      }
      if (d.description && (d.description.th || d.description.en)) {
        next.description = { th: d.description.th || prev.description?.th || '', en: d.description.en || prev.description?.en || '' };
      }
      if (d.duration) next.duration = Number(d.duration) || prev.duration;
      if (d.groupSize) next.groupSize = Number(d.groupSize) || prev.groupSize;
      if (Array.isArray(d.itinerary) && d.itinerary.length) {
        next.itinerary = d.itinerary.map(day => ({
          title: day?.title || '', description: day?.description || '', meals: [], hotel: day?.hotel || '',
        }));
      }
      if (Array.isArray(d.includes) && d.includes.filter(Boolean).length) next.includes = d.includes.filter(Boolean);
      if (Array.isArray(d.excludes) && d.excludes.filter(Boolean).length) next.excludes = d.excludes.filter(Boolean);
      if (Array.isArray(d.hotels) && d.hotels.filter(Boolean).length) next.hotels = d.hotels.filter(Boolean);
      if (Array.isArray(d.departures) && d.departures.length) {
        next.departures = d.departures.map(dep => ({
          date: dep?.date || '', returnDate: dep?.returnDate || '',
          totalSeats: Number(dep?.totalSeats) || 20, bookedSeats: 0,
          price: Number(dep?.price) || 0, childPrice: Number(dep?.childPrice) || 0,
          infantPrice: Number(dep?.infantPrice) || 0, singleSupplement: Number(dep?.singleSupplement) || 0,
          promoPrice: 0,
        }));
      }
      return next;
    });
  };

  const handleAIFile = async (file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setAiError('ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 100MB)'); return; }
    setAiParsing(true);
    setAiError(null);
    try {
      // 1) อัปโหลดไฟล์ขึ้น Supabase Storage ก่อนเสมอ — เพื่อเลี่ยงข้อจำกัดขนาดคำขอ (request body)
      //    ของ Vercel Functions (~4.5MB) ทำให้รองรับไฟล์ขนาดใหญ่ได้จริง
      const { url: fileUrl, error: upErr } = await uploadFile(file, 'ai-program-uploads');
      if (upErr || !fileUrl) throw new Error('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');

      // ผู้ให้บริการ AI (Claude) มีข้อจำกัดขนาดเอกสาร/รูปภาพที่วิเคราะห์ได้โดยตรงอยู่ที่ ~28MB
      const AI_ANALYZE_LIMIT = 28 * 1024 * 1024;
      if (file.size > AI_ANALYZE_LIMIT) {
        setF(['pdfUrl'], fileUrl);
        alert('📎 อัปโหลดไฟล์เรียบร้อยแล้ว แต่ไฟล์มีขนาดใหญ่เกินกว่าที่ AI จะวิเคราะห์เนื้อหาได้โดยตรง (รองรับการวิเคราะห์ไม่เกินประมาณ 25-28MB)\n\nระบบได้แนบลิงก์ไฟล์นี้ไว้ในช่อง "ไฟล์ PDF โปรแกรมทัวร์" ให้แล้ว กรุณากรอกข้อมูลในฟอร์มด้วยตนเองครับ');
        return;
      }

      // 2) ส่ง "ลิงก์ไฟล์" (payload เล็ก) ให้เซิร์ฟเวอร์ไปดึงไฟล์มาวิเคราะห์ด้วย AI แทนการส่งไฟล์ทั้งไฟล์
      const resp = await fetch('/api/parse-tour-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, mimeType: file.type || 'application/octet-stream', fileName: file.name }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
      applyAIParsed(json?.data || {});
      // ตั้งสถานะทัวร์เป็น "ยังไม่เผยแพร่ / รอตรวจสอบ" โดยอัตโนมัติ เพื่อให้แอดมินรีวิวก่อนเปิดใช้งานจริง
      setF(['active'], false);
      setAiPending(true);
      alert('✅ AI อ่านไฟล์และกรอกข้อมูลลงฟอร์มให้แล้ว\n\n🕓 ระบบตั้งสถานะทัวร์นี้เป็น "รอตรวจสอบ" (ยังไม่เผยแพร่) ให้อัตโนมัติ — กรุณาตรวจสอบความถูกต้องของข้อมูลในทุกแท็บ แล้วค่อยติ๊กเปิดใช้งาน (Active) เมื่อพร้อมเผยแพร่จริง');
    } catch (err) {
      setAiError(err?.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAiParsing(false);
    }
  };

  // อัปโหลดรูปภาพ infographic รวม/ไม่รวม โดยตรง → AI อ่านด้วย Vision API (แม่นยำกว่า PDF)
  const handleAIIncludesImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAiError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP, ฯลฯ)'); return; }
    if (file.size > 20 * 1024 * 1024) { setAiError('รูปภาพใหญ่เกินไป (จำกัดไม่เกิน 20MB)'); return; }
    setAiParsing(true); setAiError(null);
    try {
      const { url: fileUrl, error: upErr } = await uploadFile(file, 'ai-program-uploads');
      if (upErr || !fileUrl) throw new Error('อัปโหลดรูปไม่สำเร็จ');
      const resp = await fetch('/api/parse-tour-program', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl, mimeType: file.type, fileName: file.name,
          mode: 'includes_only',
        }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'เกิดข้อผิดพลาด');
      const d = json?.data || {};
      setForm(prev => {
        const next = { ...prev };
        if (Array.isArray(d.includes) && d.includes.filter(Boolean).length) next.includes = d.includes.filter(Boolean);
        if (Array.isArray(d.excludes) && d.excludes.filter(Boolean).length) next.excludes = d.excludes.filter(Boolean);
        return next;
      });
      alert(`✅ AI อ่านรูปภาพเสร็จแล้ว\nรวม: ${(d.includes||[]).length} รายการ | ไม่รวม: ${(d.excludes||[]).length} รายการ`);
    } catch (err) {
      setAiError(err?.message || 'เกิดข้อผิดพลาดในการอ่านรูป กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAiParsing(false);
    }
  };

  const openAdd  = () => { setForm(EMPTY_TOUR); setTourTab('พื้นฐาน'); setAutoSaved(null); setAiError(null); setAiPending(false); setModal({ mode: 'add' }); };
  const openEdit = (tour) => { setForm(tour); setTourTab('พื้นฐาน'); setAutoSaved(null); setAiError(null); setAiPending(false); setModal({ mode: 'edit', tour }); };
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
  // Merge a partial patch into arr[idx] based on the LATEST state — avoids stale-closure
  // overwrites when two updates fire back-to-back (e.g. DateRangePicker calling
  // onStartChange then onEndChange synchronously).
  const patchArr = (field, idx, patch) => setForm(prev => {
    const arr = [...(prev[field] || [])];
    arr[idx] = { ...(arr[idx] || {}), ...patch };
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
              {/* AI: อัปโหลดไฟล์โปรแกรมทัวร์ ให้ช่วยกรอกฟอร์มอัตโนมัติ */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-bold text-teal-700">🤖 อัปโหลดไฟล์โปรแกรมทัวร์ ให้ AI ช่วยกรอกข้อมูลอัตโนมัติ</div>
                    <div className="text-xs text-slate-500 mt-0.5">รองรับ PDF, รูปภาพ (JPG/PNG/WebP), Word (.docx), ข้อความ (.txt/.csv) — ไฟล์ขนาดไม่เกิน 100MB (AI จะวิเคราะห์เนื้อหาให้อัตโนมัติเมื่อไฟล์ไม่เกิน ~28MB ถ้าไฟล์ใหญ่กว่านั้นจะแนบไฟล์ไว้ให้กรอกเองภายหลัง) · AI จะอ่านไฮไลท์ โปรแกรมแต่ละวัน วันเดินทาง และราคา มากรอกให้อัตโนมัติ</div>
                  </div>
                  <label className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition whitespace-nowrap ${aiParsing ? 'bg-slate-300 text-slate-500 cursor-wait' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                    {aiParsing ? '⏳ กำลังวิเคราะห์ไฟล์ด้วย AI...' : '📄 เลือกไฟล์โปรแกรมทัวร์'}
                    <input type="file" className="hidden" disabled={aiParsing}
                      accept=".pdf,.docx,.txt,.csv,image/*"
                      onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; handleAIFile(f); }} />
                  </label>
                </div>
                {aiError && <div className="text-xs text-red-600 font-semibold mt-2">⚠ {aiError}</div>}
                <div className="text-[11px] text-slate-400 mt-2">* หลังจาก AI กรอกข้อมูลให้แล้ว กรุณาตรวจสอบความถูกต้องของทุกแท็บ (ราคา / โปรแกรม / ที่พัก / รวม-ไม่รวม) ก่อนกด "เพิ่มทัวร์" หรือ "บันทึก" เสมอ</div>
              </div>

              {aiPending && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2">
                  <span className="text-lg leading-none">🕓</span>
                  <div>
                    <div className="text-sm font-bold text-amber-700">สถานะ: รอตรวจสอบ (ยังไม่เผยแพร่)</div>
                    <div className="text-xs text-amber-700/80 mt-0.5">
                      AI กรอกข้อมูลทัวร์นี้ให้อัตโนมัติ ระบบจึงปิดการเผยแพร่ (Active) ไว้ก่อนเพื่อให้คุณตรวจสอบความถูกต้อง
                      เมื่อตรวจสอบครบทุกแท็บแล้ว กรุณาติ๊กช่อง "Active (แสดงในเว็บ)" ในแท็บพื้นฐาน แล้วกดบันทึกอีกครั้งเพื่อเผยแพร่จริง
                    </div>
                  </div>
                </div>
              )}

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
                  <input className={inp} type="text" inputMode="numeric" style={{ textAlign: 'right' }} value={form.price} onChange={e => setF(['price'], Number(e.target.value.replace(/\D/g,'')) || 0)} placeholder="0" />
                </Field>
                <Field label="ระยะเวลา (วัน)">
                  <input className={inp} type="text" inputMode="numeric" style={{ textAlign: 'center' }} value={form.duration} onChange={e => setF(['duration'], Number(e.target.value.replace(/\D/g,'')) || 0)} placeholder="0" />
                </Field>
                <Field label="จำนวนคน (สูงสุด)">
                  <input className={inp} type="text" inputMode="numeric" style={{ textAlign: 'center' }} value={form.groupSize} onChange={e => setF(['groupSize'], Number(e.target.value.replace(/\D/g,'')) || 0)} placeholder="0" />
                </Field>
                <Field label="ส่วนลด (%)">
                  <input className={inp} type="text" inputMode="numeric" style={{ textAlign: 'center' }} value={form.discount || ''} onChange={e => setF(['discount'], Number(e.target.value.replace(/\D/g,'')) || 0)} placeholder="0" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="รหัสทัวร์ (Tour Code)">
                  <input className={inp} value={form.code || ''} onChange={e => setF(['code'], e.target.value)} placeholder="เช่น CANAQ0326, JPNTOK001" />
                </Field>
                <Field label="สายการบิน">
                  <AirlineSelect
                    value={form.flight?.outbound?.airline || ''}
                    onChange={val => setF(['flight','outbound','airline'], val)}
                  />
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
                  <button onClick={() => addToArr('departures', { date: '', returnDate: '', totalSeats: 20, bookedSeats: 0, price: 0, childPrice: 0, infantPrice: 0, singleSupplement: 0, promoPrice: 0 })}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3 h-3" /> เพิ่มวัน
                  </button>
                </div>
                <div className="space-y-3">
                  {(form.departures || []).map((dep, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <DateRangePicker
                          startDate={dep.date || ''}
                          endDate={dep.returnDate || ''}
                          onStartChange={val => patchArr('departures', i, { date: val })}
                          onEndChange={val => patchArr('departures', i, { returnDate: val })}
                          startLabel="วันที่ ขาไป"
                          endLabel="วันที่ ขากลับ"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1">ที่นั่งทั้งหมด</label>
                            <input className={inp} type="text" inputMode="numeric" value={dep.totalSeats ?? 20}
                              onChange={e => updateArr('departures', i, { ...dep, totalSeats: Number(e.target.value.replace(/\D/g,'')) || 0 })} placeholder="0" />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1">จองแล้ว</label>
                            <input className={inp} type="number" min={0} placeholder="0" value={dep.bookedSeats || ''}
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
                          <label className="text-xs text-slate-500 font-semibold block mb-1">ราคาเด็กทารก (฿)</label>
                          <input className={inp} type="number" min={0} placeholder="0" value={dep.infantPrice || ''}
                            onChange={e => updateArr('departures', i, { ...dep, infantPrice: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold block mb-1">พักเดี่ยว +฿</label>
                          <input className={inp} type="number" min={0} placeholder="0" value={dep.singleSupplement || ''}
                            onChange={e => updateArr('departures', i, { ...dep, singleSupplement: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 items-end">
                        <div className="col-span-3">
                          <label className="text-xs text-teal-600 font-semibold block mb-1">
                            ราคาโปรโมชั่น ผู้ใหญ่ (฿) <span className="text-slate-400 font-normal">— ถ้าใส่ จะแสดงราคาเดิมขีดทับคู่กับราคานี้</span>
                          </label>
                          <input className={inp} type="number" min={0} placeholder="ไม่ระบุ = ไม่มีโปรโมชั่น" value={dep.promoPrice || ''}
                            onChange={e => updateArr('departures', i, { ...dep, promoPrice: Number(e.target.value) })} />
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
            <div className="space-y-4">
              {/* AI อ่านรูปภาพ infographic รวม/ไม่รวม โดยตรง */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-bold text-blue-700">📸 อัปโหลดรูปส่วน "รวม/ไม่รวม" ให้ AI อ่านโดยตรง</div>
                    <div className="text-xs text-slate-500 mt-0.5">ถ้าไฟล์หลักอ่านรายการรวม/ไม่รวมไม่ครบ — อัปโหลดรูปภาพ (screenshot/JPG/PNG) ของส่วนนั้นโดยตรง จะแม่นยำกว่า</div>
                  </div>
                  <label className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition whitespace-nowrap ${aiParsing ? 'bg-slate-300 text-slate-500 cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {aiParsing ? '⏳ กำลังอ่านรูป...' : '🖼 อัปโหลดรูป รวม/ไม่รวม'}
                    <input type="file" className="hidden" disabled={aiParsing}
                      accept="image/*"
                      onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; handleAIIncludesImage(f); }} />
                  </label>
                </div>
              </div>
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

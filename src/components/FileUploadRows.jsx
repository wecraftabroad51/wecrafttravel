import { useState, useEffect, useRef } from 'react';
import { uploadPassport } from '../lib/db.js';

// ── ย่อรูปก่อนอัปโหลด (เอกสารต้องอ่านออก จึงย่อไม่แรงเกินไป) ──
function compressImage(file, maxPx = 1400, quality = 0.72) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file); // PDF → ไม่ย่อ
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg', quality);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

let RID = 0;

/**
 * แนบไฟล์ทีละแถว + ปุ่ม "เพิ่มไฟล์" (อัปโหลดขึ้น Supabase Storage ทันทีที่เลือก)
 * props: onChange(files:[{name,url}]) , lang , prefix (ตั้งชื่อไฟล์) , accent (สีปุ่ม)
 */
export default function FileUploadRows({ onChange, lang = 'th', prefix = '', accent = '#0f9d8f' }) {
  const th = lang !== 'en';
  const [rows, setRows] = useState([{ id: ++RID }]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const sig = rows.filter(r => r.url).map(r => r.url).join('|');
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(rows.filter(r => r.url).map(r => ({ name: r.name, url: r.url })));
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (id, p) => setRows(rs => rs.map(r => r.id === id ? { ...r, ...p } : r));
  const addRow = () => setRows(rs => [...rs, { id: ++RID }]);
  const removeRow = (id) => setRows(rs => {
    const next = rs.filter(r => r.id !== id);
    return next.length ? next : [{ id: ++RID }];
  });

  const pick = async (id, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { patch(id, { name: file.name, status: 'error', msg: th ? 'ไฟล์ใหญ่เกิน 15MB' : 'File too large (15MB)' }); return; }
    patch(id, { name: file.name, url: null, status: 'uploading', msg: '' });
    try {
      const compressed = await compressImage(file);
      const res = await uploadPassport(compressed, prefix || 'upload');
      if (res.error) throw new Error(res.error);
      patch(id, { name: res.name, url: res.url, status: 'done' });
    } catch (e) {
      patch(id, { status: 'error', msg: th ? 'อัปโหลดไม่สำเร็จ ลองใหม่' : 'Upload failed' });
    }
  };

  const box = { display: 'flex', alignItems: 'center', gap: 8, padding: 8, marginTop: 8, border: '1.5px solid #e6e9ee', borderRadius: 10, background: '#fafbfc' };
  const pickBtn = { whiteSpace: 'nowrap', border: `1.5px solid ${accent}33`, background: `${accent}14`, color: accent, borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' };

  return (
    <div>
      {rows.map(r => (
        <div key={r.id} style={box}>
          <label style={pickBtn}>
            📎 {th ? 'เลือกไฟล์' : 'Choose'}
            <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files && e.target.files[0]; if (f) pick(r.id, f); e.target.value = ''; }} />
          </label>
          <span style={{ flex: 1, fontSize: 13, color: '#5b6572', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.name || (th ? 'ยังไม่ได้เลือกไฟล์' : 'No file chosen')}
          </span>
          <span style={{ fontSize: 12, whiteSpace: 'nowrap', color: r.status === 'done' ? '#16a34a' : r.status === 'error' ? '#dc2626' : '#94a3b8' }}>
            {r.status === 'uploading' ? '⏳' : r.status === 'done' ? '✅' : r.status === 'error' ? `⚠ ${r.msg || ''}` : ''}
          </span>
          <button type="button" onClick={() => removeRow(r.id)} title={th ? 'ลบ' : 'Remove'}
            style={{ border: 0, background: '#f0f3f5', color: '#b3261e', width: 30, height: 30, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={addRow}
        style={{ marginTop: 8, border: `1.5px solid ${accent}33`, background: `${accent}0d`, color: accent, borderRadius: 10, padding: '10px 14px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
        ＋ {th ? 'เพิ่มไฟล์' : 'Add file'}
      </button>
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>
        {th ? 'แนบทีละไฟล์ · รองรับ JPG / PNG / PDF (สูงสุด 15MB/ไฟล์)' : 'Add files one at a time · JPG / PNG / PDF (max 15MB each)'}
      </div>
    </div>
  );
}

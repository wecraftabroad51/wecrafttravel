// ── รหัสเอเจนท์ WeCraft ────────────────────────────────────────────
// สร้างจาก id ของทัวร์แบบคงที่ (deterministic) — รหัสเดิมเสมอ ไม่เปลี่ยน
// จุดประสงค์: ลูกค้าเห็นรหัสนี้แทนรหัสของซัพ → เช็คไม่ได้ว่ามาจากซัพไหน
// ทัวร์ของเราเอง (id ไม่ขึ้นต้น sup_) คงรหัสเดิมไว้ เพราะเป็นรหัสของเราอยู่แล้ว
export function agentCode(tour) {
  if (!tour) return '';
  const id = String(tour.id || '');
  if (!id.startsWith('sup_')) return tour.code || '';
  // FNV-1a 32-bit hash → base36 (คงที่ ข้ามเครื่อง/ข้ามครั้ง)
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const iso = String(tour.country || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  return 'WC' + iso + h.toString(36).toUpperCase().padStart(6, '0').slice(-5);
}

const normCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// ค้นหาด้วยรหัสเอเจนท์ (ตัดขีด/เว้นวรรค ไม่สนพิมพ์เล็กใหญ่)
export function agentCodeMatch(tour, q) {
  const Q = normCode(q);
  if (Q.length < 3) return false;
  const wc = normCode(agentCode(tour));
  return wc === Q || (Q.length >= 4 && wc.includes(Q));
}

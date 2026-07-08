// ── Supplier registry ─────────────────────────────────────────────
// เพิ่มซัพพลายเออร์ใหม่ = เพิ่ม 1 object ตรงนี้ (ต้องเป็น API ที่ใช้ระบบ
// เดียวกัน — โครงสร้าง /v1/programtours แบบ ProBooking/WonderGroup)
//
// ⚠️ host ต้องตรงกับ whitelist ใน api/suppliers.js ด้วย (กัน SSRF)

export const SUPPLIERS = [
  { id: 'probooking',  name: 'ProBooking',      enabled: true },
  { id: 'wondergroup', name: 'WonderGroupTour', enabled: true },
  { id: 'gs25tour',    name: 'GS25Tour',        enabled: true },
];

export const ENABLED_SUPPLIERS = SUPPLIERS.filter(s => s.enabled);

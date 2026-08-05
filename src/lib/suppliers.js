// ── Supplier registry ─────────────────────────────────────────────
// เพิ่มซัพพลายเออร์ใหม่ = เพิ่ม 1 object ตรงนี้ (ต้องเป็น API ที่ใช้ระบบ
// เดียวกัน — โครงสร้าง /v1/programtours แบบ ProBooking/WonderGroup)
//
// ⚠️ host ต้องตรงกับ whitelist ใน api/suppliers.js ด้วย (กัน SSRF)

// format = โครงสร้างข้อมูล API (มี normalizer แยกใน supplierUtils.js)
export const SUPPLIERS = [
  { id: 'probooking',  name: 'ProBooking',      enabled: true, format: 'probooking' },
  { id: 'wondergroup', name: 'WonderGroupTour', enabled: true, format: 'probooking' },
  { id: 'gs25tour',    name: 'GS25Tour',        enabled: true, format: 'probooking' },
  { id: 'checkingroup',name: 'Check In Group',  enabled: true, format: 'probooking' },
  { id: 'realjourney', name: 'Real Journey',    enabled: true, format: 'probooking' },
  { id: 'tourfactory', name: 'Tour Factory',    enabled: true, format: 'probooking' },
  { id: 'rarex',       name: 'RareX',           enabled: true, format: 'probooking' },
  { id: 'itravels',    name: 'iTravels Center', enabled: true, format: 'itravels' },
  { id: 'unique',      name: 'Unique Inter',    enabled: true, format: 'unique' },
  { id: 'zego',        name: 'Zego',            enabled: true, format: 'zego' },
  { id: 'ttn',         name: 'TTN Tour',        enabled: true, format: 'ttn' },
  { id: 'ttnplus',     name: 'TTN Plus',        enabled: true, format: 'ttnplus' },
  { id: 'best',        name: 'BEST International', enabled: true, format: 'best' },
  { id: 'superb',      name: 'Superb Holidayz', enabled: true, format: 'superb' },
  { id: 'flyde',       name: 'FLY de WORLD',    enabled: true, format: 'flyde' },
  // ปิดชั่วคราว: ซัพยกเลิกโดเมน API (api-formosa.ht1freshdigital.com → ENOTFOUND)
  // ถ้าได้ URL ใหม่จากซัพ แก้ host ใน api/suppliers.js แล้วเปลี่ยนเป็น enabled: true ได้เลย
  { id: 'formosa',     name: 'Formosa Journey', enabled: false, format: 'formosa' },
];

export const ENABLED_SUPPLIERS = SUPPLIERS.filter(s => s.enabled);

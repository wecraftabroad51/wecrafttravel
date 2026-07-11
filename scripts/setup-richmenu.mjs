// ── สร้าง LINE Rich Menu (รันครั้งเดียว) ──────────────────────────
// วิธีใช้:
//   1. ตั้ง env: LINE_CHANNEL_TOKEN=<Channel Access Token ของ OA>
//   2. วางรูปเมนู (2500x1686, ≤1MB, PNG/JPEG) แล้วชี้ path
//   3. รัน:  node scripts/setup-richmenu.mjs <path-to-image>
//
// สคริปต์จะ: สร้างเมนู → อัปโหลดรูป → ตั้งเป็นเมนูเริ่มต้นของทุกคน
// ลบเมนูเก่าทั้งหมดก่อน (กันซ้ำ)

import fs from 'node:fs';

const TOKEN = process.env.LINE_CHANNEL_TOKEN;
const IMAGE = process.argv[2];
const SITE  = 'https://wecraft-travel.com';

if (!TOKEN) { console.error('❌ ต้องตั้ง env LINE_CHANNEL_TOKEN ก่อน'); process.exit(1); }
if (!IMAGE || !fs.existsSync(IMAGE)) { console.error('❌ ไม่พบไฟล์รูป — ใช้: node scripts/setup-richmenu.mjs <image>'); process.exit(1); }

const H = { Authorization: `Bearer ${TOKEN}` };

// ── ผังโซนกด (อิงรูป 2500x1686: banner บน + 3 ปุ่มล่าง) ──────────
// * ปรับ y ของเส้นแบ่ง (SPLIT) ให้ตรงกับรูปหมาจริงได้ที่นี่
const SPLIT = 800;                       // เส้นแบ่ง banner / ปุ่ม (แนวนอน)
const COL   = Math.round(2500 / 3);      // ความกว้างแต่ละปุ่ม
const richmenu = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: 'WeCraft Main Menu',
  chatBarText: 'เมนู ☰',
  areas: [
    // banner บน → เปิดเว็บหน้าแรก
    { bounds: { x: 0, y: 0, width: 2500, height: SPLIT }, action: { type: 'uri', uri: `${SITE}/` } },
    // ล่างซ้าย → จองตั๋วเครื่องบิน
    { bounds: { x: 0,        y: SPLIT, width: COL, height: 1686 - SPLIT }, action: { type: 'uri', uri: `${SITE}/ticket-booking` } },
    // ล่างกลาง → ขอราคาเหมา
    { bounds: { x: COL,      y: SPLIT, width: COL, height: 1686 - SPLIT }, action: { type: 'uri', uri: `${SITE}/group-quote` } },
    // ล่างขวา → จองจอยทัวร์ (รายการทัวร์)
    { bounds: { x: COL * 2,  y: SPLIT, width: 2500 - COL * 2, height: 1686 - SPLIT }, action: { type: 'uri', uri: `${SITE}/tours` } },
  ],
};

const api = async (url, opts) => {
  const res = await fetch(url, opts);
  const txt = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${txt}`);
  return txt ? JSON.parse(txt) : {};
};

(async () => {
  try {
    // 0) ลบเมนูเก่า
    const { richmenus = [] } = await api('https://api.line.me/v2/bot/richmenu/list', { headers: H });
    for (const m of richmenus) {
      await api(`https://api.line.me/v2/bot/richmenu/${m.richMenuId}`, { method: 'DELETE', headers: H });
      console.log('🗑  ลบเมนูเก่า:', m.richMenuId);
    }

    // 1) สร้างเมนู
    const created = await api('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify(richmenu),
    });
    const id = created.richMenuId;
    console.log('✅ สร้างเมนู:', id);

    // 2) อัปโหลดรูป
    const buf = fs.readFileSync(IMAGE);
    const ext = IMAGE.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    if (buf.length > 1024 * 1024) console.warn(`⚠️  รูป ${(buf.length/1024/1024).toFixed(2)}MB เกิน 1MB — LINE อาจปฏิเสธ`);
    await api(`https://api-data.line.me/v2/bot/richmenu/${id}/content`, {
      method: 'POST', headers: { ...H, 'Content-Type': ext }, body: buf,
    });
    console.log('✅ อัปโหลดรูปสำเร็จ');

    // 3) ตั้งเป็นเมนูเริ่มต้นของทุกคน
    await api(`https://api.line.me/v2/bot/user/all/richmenu/${id}`, { method: 'POST', headers: H });
    console.log('✅ ตั้งเป็นเมนูเริ่มต้นแล้ว — เปิด LINE OA ดูได้เลย 🎉');
  } catch (e) {
    console.error('❌ ผิดพลาด:', e.message);
    process.exit(1);
  }
})();

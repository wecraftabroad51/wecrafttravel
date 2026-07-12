-- ══════════════════════════════════════════════════════════════
-- WeCraft Travel — เพิ่มคอลัมน์จัดการรีวิว (ซ่อน/แสดง + ตอบกลับ)
-- รันใน Supabase → SQL Editor → New query → วาง → Run
-- ══════════════════════════════════════════════════════════════

alter table public.reviews add column if not exists hidden boolean not null default false;
alter table public.reviews add column if not exists reply  text;

-- (ถ้า RLS เปิดอยู่ และแอดมินอัปเดตผ่าน anon key อยู่แล้ว ไม่ต้องเพิ่ม policy)

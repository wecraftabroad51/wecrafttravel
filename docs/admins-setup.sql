-- ══════════════════════════════════════════════════════════════
-- WeCraft Travel — ตาราง admins (allowlist ผู้ดูแลระบบ)
-- รันใน Supabase → SQL Editor → New query → วางทั้งหมด → Run
-- ══════════════════════════════════════════════════════════════

create table if not exists public.admins (
  email      text primary key,
  role       text not null default 'admin',
  added_by   text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- ลบ policy เดิม (ถ้ามี) กันซ้ำ
drop policy if exists "admins_read_own_or_super" on public.admins;
drop policy if exists "admins_super_manage"     on public.admins;

-- อ่าน: admin เห็นแถวของตัวเอง / super admin เห็นทั้งหมด
create policy "admins_read_own_or_super" on public.admins
  for select to authenticated
  using (
    email = lower(auth.jwt() ->> 'email')
    or lower(auth.jwt() ->> 'email') = 'wecraftabroad51@gmail.com'
  );

-- เพิ่ม/ลบ/แก้: เฉพาะ super admin
create policy "admins_super_manage" on public.admins
  for all to authenticated
  using      (lower(auth.jwt() ->> 'email') = 'wecraftabroad51@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'wecraftabroad51@gmail.com');

-- ⚠️ ถ้าเปลี่ยนอีเมล Super Admin ต้องแก้ 'wecraftabroad51@gmail.com'
--    ทั้ง 3 จุดด้านบน + ตั้ง env VITE_SUPER_ADMIN_EMAIL ให้ตรงกัน

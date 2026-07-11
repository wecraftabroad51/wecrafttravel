-- ══════════════════════════════════════════════════════════════
-- WeCraft Travel — ตาราง line_sessions (state การจองใน LINE แบบ wizard)
-- เก็บชั่วคราวระหว่างถามทีละข้อ · ลบทันทีเมื่อจองเสร็จ/ยกเลิก
-- รันใน Supabase → SQL Editor → New query → วาง → Run
-- (ถ้าเคยสร้างตารางเวอร์ชันเก่าไว้ สคริปต์นี้ drop แล้วสร้างใหม่ให้เลย)
-- ══════════════════════════════════════════════════════════════

drop table if exists public.line_sessions;

create table public.line_sessions (
  user_id    text primary key,
  state      jsonb,
  created_at timestamptz not null default now()
);

alter table public.line_sessions enable row level security;

drop policy if exists "line_sessions_anon" on public.line_sessions;
create policy "line_sessions_anon" on public.line_sessions
  for all to anon using (true) with check (true);

-- ══════════════════════════════════════════════════════════════
-- WeCraft Travel — ตาราง line_sessions (จำว่าลูกค้ากำลังจองทัวร์ไหนใน LINE)
-- เก็บแค่ tour_id / tour_name ชั่วคราว · ไม่เก็บข้อมูลส่วนตัว
-- รันใน Supabase → SQL Editor → New query → วาง → Run
-- ══════════════════════════════════════════════════════════════

create table if not exists public.line_sessions (
  user_id      text primary key,
  tour_id      text,
  tour_name    text,
  tour_country text,
  created_at   timestamptz not null default now()
);

alter table public.line_sessions enable row level security;

drop policy if exists "line_sessions_anon" on public.line_sessions;
create policy "line_sessions_anon" on public.line_sessions
  for all to anon using (true) with check (true);

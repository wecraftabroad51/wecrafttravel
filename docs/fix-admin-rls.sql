-- ══════════════════════════════════════════════════════════════════
-- WeCraft Travel — แก้หลังบ้านอัปโหลด/บันทึกไม่ได้ (ฉบับแยก 2 ส่วน)
-- สาเหตุ: RLS อนุญาตเฉพาะ role "anon" → แอดมิน (authenticated) โดนบล็อก
-- ══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- ส่วนที่ 1: ตาราง + คอลัมน์รีวิว
-- รันใน SQL Editor ได้เลย (ผ่านแน่นอน)
-- ─────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'tours','articles','promotions','reviews','faqs',
    'messages','bookings','site_settings','chat_sessions'
  ]
  loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('drop policy if exists %I on public.%I', 'wecraft_authenticated_' || t, t);
      execute format(
        'create policy %I on public.%I for all to authenticated using (true) with check (true)',
        'wecraft_authenticated_' || t, t
      );
    end if;
  end loop;
end $$;

alter table public.reviews add column if not exists hidden boolean not null default false;
alter table public.reviews add column if not exists reply  text;

-- ─────────────────────────────────────────
-- ส่วนที่ 2: STORAGE — ลองรันแยกต่างหาก
-- ถ้าขึ้น error "must be owner of table objects"
-- → ต้องสร้างผ่านหน้าเว็บแทน: Storage → เลือก bucket → Policies →
--   New policy → เลือก role "authenticated" + ติ๊กทุก operation
--   (ทำกับทั้ง 3 bucket: tour-images, tour-files, passports)
-- ─────────────────────────────────────────
drop policy if exists "wecraft_authenticated_storage" on storage.objects;
create policy "wecraft_authenticated_storage" on storage.objects
  for all to authenticated
  using      (bucket_id in ('tour-images','tour-files','passports'))
  with check (bucket_id in ('tour-images','tour-files','passports'));

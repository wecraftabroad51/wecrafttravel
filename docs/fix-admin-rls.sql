-- ══════════════════════════════════════════════════════════════════
-- WeCraft Travel — แก้หลังบ้านอัปโหลด/บันทึกไม่ได้
-- สาเหตุ: RLS อนุญาตเฉพาะ role "anon" → แอดมินที่ล็อกอิน Google
--         เป็น role "authenticated" เลยโดนบล็อกทุกการเขียน
-- วิธีใช้: Supabase → SQL Editor → New query → วางทั้งหมด → Run
-- (รันซ้ำได้ ไม่พังของเดิม — นโยบายเป็นแบบ permissive เพิ่มสิทธิ์เท่านั้น)
-- ══════════════════════════════════════════════════════════════════

-- 1) STORAGE: ให้แอดมินที่ล็อกอินใช้ทุก bucket ของเว็บได้ (อัปโหลด/อ่าน/ลบ)
drop policy if exists "wecraft_authenticated_storage" on storage.objects;
create policy "wecraft_authenticated_storage" on storage.objects
  for all to authenticated
  using      (bucket_id in ('tour-images','tour-files','passports'))
  with check (bucket_id in ('tour-images','tour-files','passports'));

-- 2) TABLES: ให้แอดมินที่ล็อกอินเขียนทุกตารางที่หลังบ้านใช้
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

-- 3) แถม: คอลัมน์จัดการรีวิว (ซ่อน/ตอบกลับ) ที่ยังไม่ได้รัน
alter table public.reviews add column if not exists hidden boolean not null default false;
alter table public.reviews add column if not exists reply  text;

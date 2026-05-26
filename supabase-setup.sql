-- ============================================================
--  WeCraft Travel — Supabase Schema
--  วิธีใช้: Copy ทั้งหมด → วางใน Supabase SQL Editor → Run
-- ============================================================

-- ── TOURS ─────────────────────────────────────────────────────
create table if not exists tours (
  id             uuid primary key default gen_random_uuid(),
  name           jsonb not null default '{"th":"","en":""}',
  destination    jsonb not null default '{"th":"","en":""}',
  description    jsonb not null default '{"th":"","en":""}',
  image          text default '',
  gallery        jsonb default '[]',
  continent      text default '',
  country        text default '',
  tour_type      text default 'international',
  season         jsonb default '{"th":"","en":""}',
  duration       int default 1,
  group_size     int default 20,
  price          numeric default 0,
  child_price    numeric default 0,
  infant_price   numeric default 0,
  featured       boolean default false,
  featured_order int default 0,
  active         boolean default true,
  flight         jsonb default '{}',
  hotels         jsonb default '[]',
  itinerary      jsonb default '[]',
  includes       jsonb default '[]',
  excludes       jsonb default '[]',
  price_tiers    jsonb default '[]',
  departures     jsonb default '[]',
  pdf_url        text default '',
  pdf_label      jsonb default '{"th":"ดาวน์โหลดโปรแกรม","en":"Download Program"}',
  pdf_updated    text default '',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table tours enable row level security;
drop policy if exists "allow_all_tours" on tours;
create policy "allow_all_tours" on tours for all using (true) with check (true);

-- ── ARTICLES ──────────────────────────────────────────────────
create table if not exists articles (
  id          uuid primary key default gen_random_uuid(),
  title       jsonb not null default '{"th":"","en":""}',
  author      text default '',
  date        text default '',
  image       text default '',
  category    text default '',
  excerpt     jsonb default '{"th":"","en":""}',
  body        jsonb default '{"th":"","en":""}',
  read_time   int default 5,
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table articles enable row level security;
drop policy if exists "allow_all_articles" on articles;
create policy "allow_all_articles" on articles for all using (true) with check (true);

-- ── PROMOTIONS ────────────────────────────────────────────────
create table if not exists promotions (
  id          uuid primary key default gen_random_uuid(),
  title       jsonb not null default '{"th":"","en":""}',
  description jsonb default '{"th":"","en":""}',
  tour_id     text default '',
  discount    int default 0,
  code        text default '',
  end_date    text default '',
  expires_at  text default '',
  image       text default '',
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table promotions enable row level security;
drop policy if exists "allow_all_promotions" on promotions;
create policy "allow_all_promotions" on promotions for all using (true) with check (true);

-- ── FAQS ──────────────────────────────────────────────────────
create table if not exists faqs (
  id          uuid primary key default gen_random_uuid(),
  category    text default 'general',
  question    jsonb not null default '{"th":"","en":""}',
  answer      jsonb not null default '{"th":"","en":""}',
  active      boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

alter table faqs enable row level security;
drop policy if exists "allow_all_faqs" on faqs;
create policy "allow_all_faqs" on faqs for all using (true) with check (true);

-- ── REVIEWS ───────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  tour_id     text default '',
  name        text not null default '',
  rating      int default 5,
  text        jsonb default '{"th":"","en":""}',
  tier        text default '',
  approved    boolean default false,
  date        text default '',
  created_at  timestamptz default now()
);

alter table reviews enable row level security;
drop policy if exists "allow_all_reviews" on reviews;
create policy "allow_all_reviews" on reviews for all using (true) with check (true);

-- ── BOOKINGS ──────────────────────────────────────────────────
create table if not exists bookings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  email        text default '',
  phone        text default '',
  tour_id      text default '',
  tour_name    jsonb default '{"th":"","en":""}',
  tier         text default '',
  travelers    int default 1,
  departure_id text default '',
  total_price  numeric default 0,
  status       text default 'pending',
  date         text default '',
  created_at   timestamptz default now()
);

alter table bookings enable row level security;
drop policy if exists "allow_all_bookings" on bookings;
create policy "allow_all_bookings" on bookings for all using (true) with check (true);

-- ── MESSAGES ──────────────────────────────────────────────────
create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  email         text default '',
  phone         text default '',
  tour_interest text default '',
  message       text default '',
  read          boolean default false,
  date          text default '',
  created_at    timestamptz default now()
);

alter table messages enable row level security;
drop policy if exists "allow_all_messages" on messages;
create policy "allow_all_messages" on messages for all using (true) with check (true);

-- ── CHAT SESSIONS ─────────────────────────────────────────────
create table if not exists chat_sessions (
  id            text primary key,
  visitor_name  text default '',
  visitor_email text default '',
  status        text default 'active',
  unread        int default 0,
  messages      jsonb default '[]',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table chat_sessions enable row level security;
drop policy if exists "allow_all_chat_sessions" on chat_sessions;
create policy "allow_all_chat_sessions" on chat_sessions for all using (true) with check (true);

-- ── SITE SETTINGS ─────────────────────────────────────────────
create table if not exists site_settings (
  id      int primary key default 1,
  contact jsonb default '{}',
  social  jsonb default '[]',
  popup   jsonb default '{}'
);

alter table site_settings enable row level security;
drop policy if exists "allow_all_site_settings" on site_settings;
create policy "allow_all_site_settings" on site_settings for all using (true) with check (true);

-- สร้าง row settings เริ่มต้น
insert into site_settings (id) values (1) on conflict (id) do nothing;

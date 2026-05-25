-- ============================================================
--  Wanderlust Tours — Supabase Schema
--  Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── TOURS ────────────────────────────────────────────────────
create table if not exists tours (
  id            uuid primary key default uuid_generate_v4(),
  name          jsonb  not null,          -- { th, en }
  destination   jsonb  not null,
  description   jsonb  not null,
  image         text   not null,
  continent     text   not null,
  duration      int    not null,
  group_size    int    not null default 20,
  price         int    not null,
  featured      boolean not null default false,
  active        boolean not null default true,
  flight        jsonb  not null default '{}',
  hotels        jsonb  not null default '[]',
  itinerary     jsonb  not null default '[]',
  includes      jsonb  not null default '[]',
  excludes      jsonb  not null default '[]',
  price_tiers   jsonb  not null default '[]',
  departures    jsonb  not null default '[]',
  gallery       jsonb  not null default '[]',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── ARTICLES ─────────────────────────────────────────────────
create table if not exists articles (
  id          uuid primary key default uuid_generate_v4(),
  title       jsonb  not null,
  excerpt     jsonb  not null,
  content     jsonb  not null,
  image       text   not null,
  category    jsonb  not null,
  author      text   not null default 'Admin',
  read_time   int    not null default 5,
  published   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── PROMOTIONS ───────────────────────────────────────────────
create table if not exists promotions (
  id          uuid primary key default uuid_generate_v4(),
  title       jsonb  not null,
  description jsonb  not null,
  image       text   not null,
  badge       text,
  discount    int    not null default 0,
  code        text,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── FAQS ─────────────────────────────────────────────────────
create table if not exists faqs (
  id        uuid primary key default uuid_generate_v4(),
  question  jsonb  not null,
  answer    jsonb  not null,
  category  text   not null default 'general',
  active    boolean not null default true,
  sort_order int   not null default 0,
  created_at timestamptz default now()
);

-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists reviews (
  id        uuid primary key default uuid_generate_v4(),
  tour_id   uuid references tours(id) on delete set null,
  name      text    not null,
  avatar    text,
  rating    int     not null check (rating between 1 and 5),
  comment   jsonb   not null,
  approved  boolean not null default false,
  created_at timestamptz default now()
);

-- ── BOOKINGS ─────────────────────────────────────────────────
create table if not exists bookings (
  id          uuid primary key default uuid_generate_v4(),
  tour_id     uuid references tours(id) on delete set null,
  tour_name   jsonb,
  customer    jsonb  not null,   -- { name, email, phone }
  departure   text,
  travelers   int    not null default 1,
  tier        text,
  total       int    not null default 0,
  status      text   not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── MESSAGES (Contact form) ───────────────────────────────────
create table if not exists messages (
  id        uuid primary key default uuid_generate_v4(),
  name      text  not null,
  email     text  not null,
  phone     text,
  subject   text,
  body      text  not null,
  read      boolean not null default false,
  replied   boolean not null default false,
  created_at timestamptz default now()
);

-- ── CHAT SESSIONS ────────────────────────────────────────────
create table if not exists chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  visitor     jsonb not null,   -- { name, email, phone }
  messages    jsonb not null default '[]',
  status      text  not null default 'open' check (status in ('open','closed')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── SITE SETTINGS ────────────────────────────────────────────
create table if not exists site_settings (
  id       int primary key default 1,  -- single row
  contact  jsonb not null default '{}',
  social   jsonb not null default '[]',
  popup    jsonb not null default '{}'
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_updated_at_tours
  before update on tours
  for each row execute function handle_updated_at();

create or replace trigger set_updated_at_articles
  before update on articles
  for each row execute function handle_updated_at();

create or replace trigger set_updated_at_promotions
  before update on promotions
  for each row execute function handle_updated_at();

create or replace trigger set_updated_at_bookings
  before update on bookings
  for each row execute function handle_updated_at();

create or replace trigger set_updated_at_chat
  before update on chat_sessions
  for each row execute function handle_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table tours         enable row level security;
alter table articles      enable row level security;
alter table promotions    enable row level security;
alter table faqs          enable row level security;
alter table reviews       enable row level security;
alter table bookings      enable row level security;
alter table messages      enable row level security;
alter table chat_sessions enable row level security;
alter table site_settings enable row level security;

-- Public READ (anon can read published content)
create policy "Public read tours"      on tours         for select using (active = true);
create policy "Public read articles"   on articles      for select using (published = true);
create policy "Public read promos"     on promotions    for select using (active = true);
create policy "Public read faqs"       on faqs          for select using (active = true);
create policy "Public read reviews"    on reviews       for select using (approved = true);
create policy "Public read settings"   on site_settings for select using (true);

-- Public INSERT (visitors can submit)
create policy "Public insert reviews"  on reviews       for insert with check (true);
create policy "Public insert bookings" on bookings      for insert with check (true);
create policy "Public insert messages" on messages      for insert with check (true);
create policy "Public insert chat"     on chat_sessions for insert with check (true);

-- Service role (Admin) has full access — handled via service_role key in AdminPanel
-- For now we use anon key with broad policies; in production use Supabase Auth

-- Allow anon full access (simplify for initial setup — tighten later with Auth)
create policy "Anon full tours"         on tours         for all using (true) with check (true);
create policy "Anon full articles"      on articles      for all using (true) with check (true);
create policy "Anon full promotions"    on promotions    for all using (true) with check (true);
create policy "Anon full faqs"          on faqs          for all using (true) with check (true);
create policy "Anon full reviews"       on reviews       for all using (true) with check (true);
create policy "Anon full bookings"      on bookings      for all using (true) with check (true);
create policy "Anon full messages"      on messages      for all using (true) with check (true);
create policy "Anon full chat"          on chat_sessions for all using (true) with check (true);
create policy "Anon full settings"      on site_settings for all using (true) with check (true);

-- ── DEFAULT SITE SETTINGS ────────────────────────────────────
insert into site_settings (id, contact, social, popup)
values (1,
  '{"address":{"th":"123 ถนนสุขุมวิท กรุงเทพฯ 10110","en":"123 Sukhumvit Road, Bangkok 10110"},"phone":"02-123-4567","email":"info@wanderlust.co.th","line":"@wanderlust"}',
  '[
    {"platform":"facebook","url":"https://facebook.com","color":"#1877F2","enabled":true},
    {"platform":"instagram","url":"https://instagram.com","color":"#E1306C","enabled":true},
    {"platform":"youtube","url":"https://youtube.com","color":"#FF0000","enabled":false},
    {"platform":"line","url":"https://line.me","color":"#00B900","enabled":true}
  ]',
  '{"enabled":true,"delay":1500,"title":{"th":"🎉 โปรโมชั่นพิเศษ!","en":"🎉 Special Offer!"},"body":{"th":"จองทัวร์วันนี้ รับส่วนลดสูงสุด 15%","en":"Book today and get up to 15% off"},"cta":{"th":"ดูโปรโมชั่น","en":"View Offers"}}'
)
on conflict (id) do nothing;

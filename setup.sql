-- Ways Pod v8 — Supabase SQL Editor → Run

truncate table products restart identity cascade;

create table if not exists products (
  id text primary key, name text not null, brand text default '',
  cat text default '', price numeric default 0, unit text default '',
  sku text default '', emoji text default '📦', photo text default '',
  created_at timestamptz default now()
);
create table if not exists orders (
  id text primary key, name text, phone text,
  delivery_type text default 'sdek', delivery_addr text,
  items jsonb, total numeric default 0,
  visitor_id text, session_id text,
  created_at timestamptz default now()
);
create table if not exists users (
  phone text primary key, name text, visitor_id text,
  created_at timestamptz default now()
);
create table if not exists visitors (
  id text primary key, last_seen timestamptz default now(),
  created_at timestamptz default now()
);
create table if not exists settings (
  id int primary key default 1,
  site_name text default 'Ways Pod',
  site_desc text default 'Прямые поставки от производителей.',
  logo_text text default 'WP',
  accent_color text default '#2563eb',
  markup int default 0,
  markup_prev int default 0,
  manager_name text default 'Александр',
  manager_link text default 'https://t.me/wayspod_manager',
  tg_token text default '',
  tg_chat_id text default '',
  about_text text default 'Ways Pod — оптовый поставщик вейп-продукции.'
);
insert into settings (id) values (1) on conflict (id) do nothing;
create table if not exists push_history (
  id uuid primary key default gen_random_uuid(),
  text text not null, created_at timestamptz default now()
);

alter table settings add column if not exists markup_prev int default 0;
alter table orders add column if not exists visitor_id text;
alter table users add column if not exists visitor_id text;
alter table products add column if not exists photo text default '';
alter table orders add column if not exists delivery_type text default 'sdek';
alter table orders add column if not exists delivery_addr text;
alter table orders add column if not exists session_id text;
alter table settings add column if not exists manager_link text default 'https://t.me/wayspod_manager';
alter table settings add column if not exists about_text text default 'Ways Pod';

alter table products     enable row level security;
alter table orders       enable row level security;
alter table users        enable row level security;
alter table settings     enable row level security;
alter table push_history enable row level security;
alter table visitors     enable row level security;

drop policy if exists "pp" on products;     create policy "pp" on products     for all using (true) with check (true);
drop policy if exists "po" on orders;       create policy "po" on orders       for all using (true) with check (true);
drop policy if exists "pu" on users;        create policy "pu" on users        for all using (true) with check (true);
drop policy if exists "ps" on settings;     create policy "ps" on settings     for all using (true) with check (true);
drop policy if exists "ph" on push_history; create policy "ph" on push_history for all using (true) with check (true);
drop policy if exists "pv" on visitors;     create policy "pv" on visitors     for all using (true) with check (true);

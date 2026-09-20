-- OROTRONIX Supabase foundation
create extension if not exists pgcrypto;

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'OROTRONIX',
  whatsapp text not null default '+212656566366',
  phone text not null default '+212656566366',
  address text not null default 'Kasba, Rue 21, N°10, Mohammedia 28800, Maroc',
  hours text not null default 'Lundi–Dimanche 10:00–22:00',
  banner text,
  updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text, image_url text,
  sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, brand text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null default 0, old_price numeric(12,2),
  image_url text, short_description text, description text,
  highlights jsonb not null default '[]'::jsonb,
  in_stock boolean not null default true, featured boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.repair_services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text,
  price_from numeric(12,2) not null default 0, duration text,
  active boolean not null default true, sort_order integer not null default 0
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null, customer_name text not null, phone text not null,
  address text, city text, items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  status text not null default 'pending_whatsapp'
    check (status in ('pending_whatsapp','confirmed','processing','shipped','completed','cancelled')),
  notes text, created_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.repair_services enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "public read repairs" on public.repair_services;
create policy "public read repairs" on public.repair_services for select using (active = true);

drop policy if exists "admin settings" on public.store_settings;
create policy "admin settings" on public.store_settings for all to authenticated using (true) with check (true);
drop policy if exists "admin categories" on public.categories;
create policy "admin categories" on public.categories for all to authenticated using (true) with check (true);
drop policy if exists "admin products" on public.products;
create policy "admin products" on public.products for all to authenticated using (true) with check (true);
drop policy if exists "admin repairs" on public.repair_services;
create policy "admin repairs" on public.repair_services for all to authenticated using (true) with check (true);
drop policy if exists "admin orders" on public.orders;
create policy "admin orders" on public.orders for all to authenticated using (true) with check (true);

insert into public.store_settings (store_name, whatsapp, phone)
select 'OROTRONIX', '+212656566366', '+212656566366'
where not exists (select 1 from public.store_settings);

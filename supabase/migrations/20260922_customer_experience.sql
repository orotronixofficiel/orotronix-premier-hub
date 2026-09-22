-- OROTRONIX customer experience: profiles, addresses, favorites and notification preferences
-- Safe to run after the existing auth/order/security migrations.

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  avatar_url text,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  loyalty_tier text not null default 'Bronze',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Domicile',
  full_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.customer_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  order_updates boolean not null default true,
  promotions boolean not null default false,
  security_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx on public.customer_addresses(user_id);
create index if not exists customer_favorites_user_id_idx on public.customer_favorites(user_id);
create index if not exists customer_profiles_phone_idx on public.customer_profiles(phone);

alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_favorites enable row level security;
alter table public.customer_notification_preferences enable row level security;

drop policy if exists "customers manage own profile" on public.customer_profiles;
create policy "customers manage own profile"
on public.customer_profiles for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "customers manage own addresses" on public.customer_addresses;
create policy "customers manage own addresses"
on public.customer_addresses for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "customers manage own favorites" on public.customer_favorites;
create policy "customers manage own favorites"
on public.customer_favorites for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "customers manage own notification preferences" on public.customer_notification_preferences;
create policy "customers manage own notification preferences"
on public.customer_notification_preferences for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customer_profiles (user_id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '')
  )
  on conflict (user_id) do nothing;

  insert into public.customer_notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer on auth.users;
create trigger on_auth_user_created_customer
after insert on auth.users
for each row execute function public.handle_new_customer();

insert into public.customer_profiles (user_id, full_name, phone)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'phone', '')), '')
from auth.users u
on conflict (user_id) do nothing;

insert into public.customer_notification_preferences (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

create or replace function public.admin_list_customers()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  full_name text,
  phone text,
  city text,
  order_count bigint,
  total_spent numeric,
  last_order_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    p.full_name,
    p.phone,
    p.city,
    count(o.id)::bigint as order_count,
    coalesce(sum(case when o.status <> 'cancelled' then o.total else 0 end), 0)::numeric as total_spent,
    max(o.created_at) as last_order_at
  from auth.users u
  left join public.customer_profiles p on p.user_id = u.id
  left join public.orders o on o.user_id = u.id
  where public.is_admin()
  group by u.id, u.email, u.created_at, u.last_sign_in_at, p.full_name, p.phone, p.city
  order by u.created_at desc;
$$;

revoke execute on function public.admin_list_customers() from public, anon;
grant execute on function public.admin_list_customers() to authenticated;

create or replace function public.admin_customer_summary(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé';
  end if;

  return jsonb_build_object(
    'profile', (select to_jsonb(p) from public.customer_profiles p where p.user_id = p_user_id),
    'orders', coalesce((
      select jsonb_agg(to_jsonb(o) order by o.created_at desc)
      from public.orders o where o.user_id = p_user_id
    ), '[]'::jsonb),
    'favorites_count', (select count(*) from public.customer_favorites f where f.user_id = p_user_id)
  );
end;
$$;

revoke execute on function public.admin_customer_summary(uuid) from public, anon;
grant execute on function public.admin_customer_summary(uuid) to authenticated;

-- Only the authenticated owner may change their own default address state.
create or replace function public.set_default_customer_address(p_address_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.customer_addresses
  set is_default = false, updated_at = now()
  where user_id = auth.uid();

  update public.customer_addresses
  set is_default = true, updated_at = now()
  where id = p_address_id and user_id = auth.uid();

  if not found then
    raise exception 'Adresse introuvable';
  end if;
end;
$$;

revoke execute on function public.set_default_customer_address(uuid) from public, anon;
grant execute on function public.set_default_customer_address(uuid) to authenticated;

-- Keep only one default address per customer.
create or replace function public.normalize_default_customer_address()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_default then
    update public.customer_addresses
    set is_default = false, updated_at = now()
    where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists customer_addresses_default_trigger on public.customer_addresses;
create trigger customer_addresses_default_trigger
before insert or update of is_default on public.customer_addresses
for each row execute function public.normalize_default_customer_address();

-- Updated-at helpers.
create or replace function public.touch_customer_profile()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_profiles_touch on public.customer_profiles;
create trigger customer_profiles_touch before update on public.customer_profiles
for each row execute function public.touch_customer_profile();

drop trigger if exists customer_addresses_touch on public.customer_addresses;
create trigger customer_addresses_touch before update on public.customer_addresses
for each row execute function public.touch_customer_profile();

drop trigger if exists customer_notifications_touch on public.customer_notification_preferences;
create trigger customer_notifications_touch before update on public.customer_notification_preferences
for each row execute function public.touch_customer_profile();

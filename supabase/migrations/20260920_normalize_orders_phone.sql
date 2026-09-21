-- Normalize the production orders phone column.
-- The application schema uses public.orders.phone. Older/manual Supabase
-- deployments may still have customer_phone, which causes NOT NULL failures.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_phone'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'phone'
  ) then
    alter table public.orders rename column customer_phone to phone;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_phone'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'phone'
  ) then
    update public.orders
    set phone = coalesce(nullif(phone, ''), customer_phone)
    where phone is null or phone = '';

    alter table public.orders alter column customer_phone drop not null;
  end if;
end
$$;

alter table public.orders alter column phone set not null;

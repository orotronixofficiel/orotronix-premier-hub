alter table public.orders
  add column if not exists user_id uuid references auth.users(id);

create index if not exists orders_user_id_idx on public.orders(user_id);

create or replace function public.set_order_user_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_user_id on public.orders;
create trigger orders_set_user_id
before insert on public.orders
for each row execute function public.set_order_user_id();

drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.admin_list_customers()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select u.id, u.email, u.created_at, u.last_sign_in_at
  from auth.users u
  where public.is_admin()
  order by u.created_at desc;
$$;

revoke execute on function public.admin_list_customers() from public;
revoke execute on function public.admin_list_customers() from anon;
grant execute on function public.admin_list_customers() to authenticated;
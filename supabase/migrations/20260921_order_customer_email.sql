alter table public.orders
  add column if not exists email text;

create index if not exists orders_email_idx
  on public.orders (email);
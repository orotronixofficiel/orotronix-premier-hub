-- OROTRONIX: product display order
alter table public.products
  add column if not exists sort_order integer not null default 0;

alter table public.products
  add constraint products_sort_order_nonnegative
  check (sort_order >= 0);

-- Preserve a sensible order for existing products.
with ranked as (
  select id, row_number() over (order by created_at desc, id) - 1 as position
  from public.products
)
update public.products p
set sort_order = ranked.position
from ranked
where p.id = ranked.id;

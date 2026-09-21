-- OROTRONIX: product stock quantities
alter table public.products
  add column if not exists stock_quantity integer not null default 0;

alter table public.products
  add column if not exists low_stock_threshold integer not null default 2;

alter table public.products
  add constraint products_stock_quantity_nonnegative
  check (stock_quantity >= 0);

alter table public.products
  add constraint products_low_stock_threshold_nonnegative
  check (low_stock_threshold >= 0);

-- Keep the existing availability flag consistent with the quantity.
update public.products
set stock_quantity = case when in_stock then greatest(stock_quantity, 1) else 0 end;

update public.products
set in_stock = stock_quantity > 0;

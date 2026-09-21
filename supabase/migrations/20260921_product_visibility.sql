-- OROTRONIX: product visibility
alter table public.products
  add column if not exists visible boolean not null default true;

-- Existing products remain visible after migration.
update public.products set visible = true where visible is null;

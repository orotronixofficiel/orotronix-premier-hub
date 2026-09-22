-- OROTRONIX security hardening
-- Phase 1: database-side order integrity, ownership isolation and least-privilege execution.

-- Public catalog must never expose products hidden by the admin.
drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products
for select
to anon, authenticated
using (visible = true);

-- Customers may only create orders for themselves. The RPC below is the preferred
-- creation path and direct table INSERT is disabled afterwards.
drop policy if exists "public create orders" on public.orders;

-- Keep customer order reads isolated to the authenticated owner/admin.
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
on public.orders
for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

-- Secure order creation. Prices, item names and shipping are calculated from the
-- current database catalog instead of trusting browser-supplied totals.
create or replace function public.create_order(
  p_reference text,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_items jsonb,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_slug text;
  v_qty integer;
  v_product public.products%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_snapshot jsonb := '[]'::jsonb;
  v_order_id uuid;
begin
  if p_reference is null or length(trim(p_reference)) < 8 or length(trim(p_reference)) > 80 then
    raise exception 'Référence de commande invalide';
  end if;

  if p_customer_name is null or length(trim(p_customer_name)) < 3 or length(trim(p_customer_name)) > 120 then
    raise exception 'Nom client invalide';
  end if;

  if p_phone is null or length(trim(p_phone)) < 9 or length(trim(p_phone)) > 20 then
    raise exception 'Numéro de téléphone invalide';
  end if;

  if p_city is null or length(trim(p_city)) < 2 or length(trim(p_city)) > 80 then
    raise exception 'Ville invalide';
  end if;

  if p_address is null or length(trim(p_address)) < 8 or length(trim(p_address)) > 300 then
    raise exception 'Adresse invalide';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Panier invalide';
  end if;

  for v_slug, v_qty in
    select nullif(trim(x.value->>'slug'), '') as slug,
           sum((x.value->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as x(value)
    group by nullif(trim(x.value->>'slug'), '')
  loop
    if v_slug is null or v_qty is null or v_qty < 1 or v_qty > 100 then
      raise exception 'Article du panier invalide';
    end if;

    select * into v_product
    from public.products
    where slug = v_slug
      and visible = true
    for update;

    if not found then
      raise exception 'Produit indisponible: %', v_slug;
    end if;

    if coalesce(v_product.stock_quantity, 0) < v_qty then
      raise exception 'Stock insuffisant pour % (disponible: %, demandé: %)',
        v_product.name, coalesce(v_product.stock_quantity, 0), v_qty;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_snapshot := v_snapshot || jsonb_build_array(
      jsonb_build_object(
        'slug', v_product.slug,
        'name', v_product.name,
        'price', v_product.price,
        'image', coalesce(v_product.image_url, ''),
        'quantity', v_qty
      )
    );
  end loop;

  v_shipping := case when v_subtotal >= 800 then 0 else 40 end;
  v_total := v_subtotal + v_shipping;

  insert into public.orders (
    reference, user_id, customer_name, email, phone, address, city,
    items, total, status, notes
  )
  values (
    trim(p_reference), v_user_id, trim(p_customer_name), nullif(trim(p_email), ''),
    trim(p_phone), trim(p_address), trim(p_city), v_snapshot, v_total,
    'pending_whatsapp', nullif(trim(p_notes), '')
  )
  returning id into v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'reference', trim(p_reference),
    'subtotal', v_subtotal,
    'shipping', v_shipping,
    'total', v_total,
    'status', 'pending_whatsapp'
  );
end;
$$;

revoke execute on function public.create_order(text,text,text,text,text,text,jsonb,text) from public;
grant execute on function public.create_order(text,text,text,text,text,text,jsonb,text) to anon, authenticated;

-- Repair requests still use the orders table for now, but their ownership is
-- assigned server-side and callers cannot choose another user's user_id.
create or replace function public.create_repair_request(
  p_reference text,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_brand text,
  p_model text,
  p_problem_type text,
  p_problem_description text,
  p_notes text,
  p_pickup boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_user_id uuid := auth.uid();
begin
  if p_reference is null or length(trim(p_reference)) < 8 or length(trim(p_reference)) > 80 then
    raise exception 'Référence de réparation invalide';
  end if;
  if p_customer_name is null or length(trim(p_customer_name)) < 3 or length(trim(p_customer_name)) > 120 then
    raise exception 'Nom client invalide';
  end if;
  if p_phone is null or length(trim(p_phone)) < 9 or length(trim(p_phone)) > 20 then
    raise exception 'Numéro de téléphone invalide';
  end if;
  if p_city is null or length(trim(p_city)) < 2 or length(trim(p_city)) > 80 then
    raise exception 'Ville invalide';
  end if;
  if p_address is null or length(trim(p_address)) < 8 or length(trim(p_address)) > 300 then
    raise exception 'Adresse invalide';
  end if;
  if coalesce(length(trim(p_brand)),0) > 80 or coalesce(length(trim(p_model)),0) > 120 then
    raise exception 'Informations appareil invalides';
  end if;
  if coalesce(length(trim(p_problem_description)),0) > 2000 then
    raise exception 'Description trop longue';
  end if;

  insert into public.orders (
    reference, user_id, customer_name, phone, address, city, items,
    total, status, notes
  )
  values (
    trim(p_reference), v_user_id, trim(p_customer_name), trim(p_phone),
    trim(p_address), trim(p_city),
    jsonb_build_array(jsonb_build_object(
      'type','repair',
      'brand',trim(coalesce(p_brand,'')),
      'model',trim(coalesce(p_model,'')),
      'problemType',trim(coalesce(p_problem_type,'')),
      'problemDescription',trim(coalesce(p_problem_description,'')),
      'pickup',coalesce(p_pickup,false)
    )),
    0, 'pending_whatsapp', nullif(trim(p_notes),'')
  )
  returning id into v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'reference', trim(p_reference),
    'status', 'pending_whatsapp'
  );
end;
$$;

revoke execute on function public.create_repair_request(text,text,text,text,text,text,text,text,text,text,boolean) from public;
grant execute on function public.create_repair_request(text,text,text,text,text,text,text,text,text,text,boolean) to anon, authenticated;

-- Trigger/helper functions are internal implementation details.
revoke execute on function public.set_order_user_id() from public, anon, authenticated;

-- is_admin is used by RLS and trusted functions, not as a public API endpoint.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Make the admin/customer helper explicit about who can call it.
revoke execute on function public.admin_list_customers() from public, anon;
grant execute on function public.admin_list_customers() to authenticated;

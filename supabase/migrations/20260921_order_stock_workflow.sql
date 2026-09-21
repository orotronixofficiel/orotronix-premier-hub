alter table public.orders
  add column if not exists stock_applied boolean not null default false;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_slug text;
  v_qty integer;
  v_product public.products%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Accès administrateur refusé';
  end if;

  if p_status not in ('pending_whatsapp','confirmed','processing','shipped','completed','cancelled') then
    raise exception 'Statut de commande invalide';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Commande introuvable';
  end if;

  if v_order.status = p_status then
    return jsonb_build_object('status', p_status, 'stock_applied', v_order.stock_applied);
  end if;

  if p_status = 'confirmed' and not v_order.stock_applied then
    for v_item in select * from jsonb_array_elements(coalesce(v_order.items,'[]'::jsonb))
    loop
      v_slug := nullif(v_item->>'slug','');
      v_qty := greatest(1, coalesce((v_item->>'quantity')::integer,1));
      if v_slug is null then
        continue;
      end if;

      select * into v_product
      from public.products
      where slug = v_slug
      for update;

      if not found then
        raise exception 'Produit introuvable: %', v_slug;
      end if;

      if coalesce(v_product.stock_quantity,0) < v_qty then
        raise exception 'Stock insuffisant pour % (disponible: %, demandé: %)', v_product.name, coalesce(v_product.stock_quantity,0), v_qty;
      end if;

      update public.products
      set stock_quantity = stock_quantity - v_qty,
          in_stock = (stock_quantity - v_qty) > 0
      where id = v_product.id;
    end loop;

    update public.orders
    set status = p_status, stock_applied = true
    where id = p_order_id;
  elsif p_status = 'cancelled' and v_order.stock_applied then
    for v_item in select * from jsonb_array_elements(coalesce(v_order.items,'[]'::jsonb))
    loop
      v_slug := nullif(v_item->>'slug','');
      v_qty := greatest(1, coalesce((v_item->>'quantity')::integer,1));
      if v_slug is null then
        continue;
      end if;

      update public.products
      set stock_quantity = stock_quantity + v_qty,
          in_stock = true
      where slug = v_slug;
    end loop;

    update public.orders
    set status = p_status, stock_applied = false
    where id = p_order_id;
  else
    update public.orders
    set status = p_status
    where id = p_order_id;
  end if;

  select * into v_order from public.orders where id = p_order_id;
  return jsonb_build_object('status', v_order.status, 'stock_applied', v_order.stock_applied);
end;
$$;

revoke execute on function public.admin_update_order_status(uuid,text) from public;
revoke execute on function public.admin_update_order_status(uuid,text) from anon;
grant execute on function public.admin_update_order_status(uuid,text) to authenticated;
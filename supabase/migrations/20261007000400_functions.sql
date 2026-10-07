-- Cartly · 4/5 · Checkout and admin functions

-- Places an order for the signed-in user.
--
--   items:   [{ "product_id": "<uuid>", "quantity": 2 }, ...]
--   shipping: { full_name, address, city, postal_code, country }
--
-- The client only says WHAT and HOW MANY. Prices, shipping and totals are
-- computed here from the database, product rows are locked (FOR UPDATE) to
-- check stock, and stock is decremented in the same transaction, so two
-- customers can never buy the last unit twice.
create or replace function public.place_order(
  items jsonb,
  shipping jsonb,
  payment_last4 text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order uuid;
  v_subtotal integer := 0;
  v_shipping integer;
  v_line record;
  v_product public.products%rowtype;
  -- Free shipping from $50.00, otherwise $4.99.
  c_free_shipping_from constant integer := 5000;
  c_shipping_fee constant integer := 499;
begin
  if v_user is null then
    raise exception 'Sign in to place an order' using errcode = '28000';
  end if;

  if jsonb_typeof(items) <> 'array'
     or jsonb_array_length(items) not between 1 and 50 then
    raise exception 'Your cart is empty' using errcode = '22023';
  end if;

  if coalesce(trim(shipping ->> 'full_name'), '') = ''
     or coalesce(trim(shipping ->> 'address'), '') = ''
     or coalesce(trim(shipping ->> 'city'), '') = ''
     or coalesce(trim(shipping ->> 'postal_code'), '') = ''
     or coalesce(trim(shipping ->> 'country'), '') = '' then
    raise exception 'Shipping address is incomplete' using errcode = '22023';
  end if;

  if payment_last4 !~ '^[0-9]{4}$' then
    raise exception 'Invalid payment details' using errcode = '22023';
  end if;

  -- 1. Validate every line and lock the products (duplicates are merged).
  for v_line in
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(items) as e
    group by 1
    order by 1 -- consistent lock order avoids deadlocks
  loop
    if v_line.quantity is null or v_line.quantity not between 1 and 99 then
      raise exception 'Invalid quantity' using errcode = '22023';
    end if;

    select * into v_product
    from public.products p
    where p.id = v_line.product_id and p.active
    for update;

    if not found then
      raise exception 'A product in your cart is no longer available'
        using errcode = 'P0002';
    end if;

    if v_product.stock < v_line.quantity then
      raise exception 'Only % left of "%"', v_product.stock, v_product.name
        using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + v_product.price_cents * v_line.quantity;
  end loop;

  v_shipping := case
    when v_subtotal >= c_free_shipping_from then 0
    else c_shipping_fee
  end;

  insert into public.orders (
    user_id, subtotal_cents, shipping_cents, total_cents, shipping, payment_last4
  )
  values (
    v_user,
    v_subtotal,
    v_shipping,
    v_subtotal + v_shipping,
    jsonb_build_object(
      'full_name', trim(shipping ->> 'full_name'),
      'address', trim(shipping ->> 'address'),
      'city', trim(shipping ->> 'city'),
      'postal_code', trim(shipping ->> 'postal_code'),
      'country', trim(shipping ->> 'country')
    ),
    payment_last4
  )
  returning id into v_order;

  -- 2. Snapshot the lines and take the stock (rows are already locked).
  insert into public.order_items (
    order_id, product_id, product_name, product_image, unit_price_cents, quantity
  )
  select v_order, p.id, p.name, p.images[1], p.price_cents, l.quantity
  from (
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(items) as e
    group by 1
  ) as l
  join public.products p on p.id = l.product_id;

  update public.products p
  set stock = p.stock - l.quantity
  from (
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(items) as e
    group by 1
  ) as l
  where p.id = l.product_id;

  return v_order;
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;

-- Dashboard numbers for admins. Runs with the caller's rights (RLS applies),
-- so a customer calling it would only see totals of their own orders.
create or replace function public.admin_stats()
returns table (
  revenue_cents bigint,
  orders_count bigint,
  customers_count bigint,
  low_stock_count bigint
)
language sql
stable
set search_path = ''
as $$
  select
    coalesce(sum(o.total_cents) filter (where o.status <> 'cancelled'), 0),
    count(o.id),
    count(distinct o.user_id),
    (select count(*) from public.products p where p.active and p.stock <= 5)
  from public.orders o;
$$;

grant execute on function public.admin_stats() to authenticated;

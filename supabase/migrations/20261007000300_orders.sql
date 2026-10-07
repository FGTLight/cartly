-- Cartly · 3/5 · Orders
--
-- Orders can only be created through the place_order() function (next
-- migration), which computes prices on the server. There is deliberately no
-- INSERT policy for customers.

create type public.order_status as enum ('paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'paid',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents = subtotal_cents + shipping_cents),
  -- { full_name, address, city, postal_code, country }
  shipping jsonb not null,
  -- Simulated payment: only the last 4 digits are kept, never a full number.
  payment_last4 text not null check (payment_last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

-- Snapshot of each line at purchase time: later price or name changes do
-- not alter past orders.
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 99)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create index order_items_order_idx on public.order_items (order_id);

-- Row Level Security ---------------------------------------------------------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Customers read their orders; admins read all"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "Admins update order status"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Admins may only move the status forward; totals are immutable.
revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;

create policy "Order items follow their order"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

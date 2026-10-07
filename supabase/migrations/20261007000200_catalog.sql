-- Cartly · 2/5 · Catalog: categories and products
--
-- Prices are stored in cents (integers) to avoid floating point errors.

create extension if not exists pg_trgm with schema extensions;

create table public.categories (
  id smallint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  brand text,
  category_id smallint references public.categories (id) on delete set null,
  price_cents integer not null check (price_cents >= 0),
  -- Original price, shown struck through when the product is on sale.
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents > price_cents),
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Store catalog. Inactive products are hidden from customers.';

create index products_category_idx on public.products (category_id);
create index products_active_created_idx on public.products (active, created_at desc);
create index products_price_idx on public.products (price_cents);
-- Fast case-insensitive search with ILIKE '%term%'.
create index products_name_trgm_idx on public.products
  using gin (name extensions.gin_trgm_ops);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Row Level Security ---------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Active products are public; admins see all"
  on public.products for select
  to anon, authenticated
  using (active or (select public.is_admin()));

create policy "Admins create products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

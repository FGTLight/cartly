# Cartly

A full-stack e-commerce store: product catalog with search and filters, persistent cart, accounts, simulated checkout, order history and an admin panel for products and orders.

Built with **React 19 + TypeScript + Vite** on the front end and **Supabase** (Postgres, Auth, Storage) on the back end.

> Demo store: payments are simulated and no card data is stored. Use the test card `4242 4242 4242 4242`.

## Features

**Shopping**
- Catalog with name search (trigram-indexed), category filter, price range, sorting and pagination, all done in Postgres and kept in the URL (shareable, back-button friendly)
- Product pages with image gallery, stock status, discounts and related products
- Cart drawer and cart page, persisted in `localStorage`, with stock limits and a free-shipping progress bar
- Checkout with validated shipping and card forms (Luhn check, expiry, CVC) and a simulated payment gateway, including a declined-card test case
- Order history and order detail with status tracking

**Admin** (`/admin`, admins only)
- Dashboard: revenue, orders, customers, low-stock products, recent orders
- Products: create, edit, hide/show, delete; image upload to Supabase Storage
- Orders: filter by status and update it (paid → shipped → delivered / cancelled)

**Quality**
- Light, dark and system themes; responsive layout; accessible forms, dialogs and keyboard navigation
- Admin, checkout and account pages are lazy-loaded; vendor code is split into cacheable chunks
- 65 unit and component tests (Vitest + Testing Library); CI runs lint, typecheck, tests and build, then deploys to GitHub Pages

## Security model

The browser only ever holds the **publishable key**. Every rule lives in the database:

| Concern | Enforced by |
| --- | --- |
| Customers see only their own orders | Row Level Security on `orders` / `order_items` |
| Only admins manage products, images and order status | RLS + `is_admin()` helper; Storage policies |
| Users can't make themselves admin | Column grant: `profiles` only allows updating `full_name` |
| Prices can't be tampered with | `place_order()` reads prices from `products`; the client sends only ids and quantities |
| No overselling | `place_order()` locks product rows (`FOR UPDATE`, in a fixed order to avoid deadlocks) and decrements stock in the same transaction |
| No card data stored | Only the last 4 digits reach the database |

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS v4, lucide-react |
| Routing | React Router (declarative mode) |
| Server state | TanStack Query |
| Client state | Zustand (cart, theme), persisted |
| Forms | React Hook Form + Zod |
| Back end | Supabase: Postgres + RLS, Auth, Storage, RPC functions |
| Tooling | Vite, Vitest, Testing Library, oxlint, GitHub Actions, GitHub Pages |

## Project structure

```
src/
  components/      layout (header, drawer host, theme) and UI primitives
  features/
    products/      catalog, product page, filters in the URL
    cart/          Zustand store, pricing, drawer, cart page
    auth/          session context, guards, sign in / sign up
    checkout/      form schema, simulated payment, checkout page
    orders/        order history and details
    admin/         dashboard, product CRUD, order management
  lib/             Supabase client, money, errors, theme
supabase/
  migrations/      schema, RLS, functions, storage (run in order)
  seed.sql         55 demo products in 8 categories
  setup.sql        migrations + seed in one file (generated)
```

Each feature owns its `api.ts` (Supabase queries), `hooks.ts` (TanStack Query), components and pages.

## Getting started

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/setup.sql`](supabase/setup.sql) and click **Run**.
   (Or with the CLI: `supabase link` then `supabase db push`, and run `seed.sql`.)
3. Optional, for instant sign-up while testing: **Authentication → Sign In / Providers → Email**, turn off **Confirm email**.

### 2. Run the app

```bash
npm install
cp .env.example .env.local   # then fill in your project URL and publishable key
npm run dev
```

The values are in **Project Settings → API Keys** (publishable key) and **Project Settings → Data API** (project URL).

### 3. Make yourself an admin

Sign up in the app, then run in the SQL Editor:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

Sign out and back in; the **Admin** link appears in the header.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Typecheck and production build (`dist/`, with `404.html` SPA fallback) |
| `npm run preview` | Serve the production build |
| `npm test` | Run the test suite once (`npm run test:watch` to watch) |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:setup` | Rebuild `supabase/setup.sql` from the migrations and seed |

## Deployment (GitHub Pages)

1. In the repository, **Settings → Secrets and variables → Actions**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
2. **Settings → Pages → Source: GitHub Actions**.
3. Push to `main`. The workflow builds with `VITE_BASE=/<repo>/` and deploys.
4. In Supabase, **Authentication → URL Configuration**, set the Site URL to `https://<user>.github.io/<repo>/`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Maoshu Store is a Turbo monorepo with two apps:
- `apps/backend` — Medusa.js v2 headless commerce backend (Node.js, TypeScript)
- `apps/storefront` — Next.js 15 storefront with React 19 and Tailwind CSS

## Commands

### Root (runs both apps via Turbo)
```bash
npm run dev          # Start both apps concurrently
npm run build        # Build all apps
npm run lint         # Lint all apps
npm run test         # Run all tests
```

### Backend only (port 9000 + admin at /app)
```bash
npm run backend:dev           # Start Medusa dev server
npm run backend:seed          # Seed initial data (regions, products, inventory)
```

### Storefront only (port 8000)
```bash
npm run storefront:dev        # Start Next.js with Turbopack
```

### Backend database
```bash
# Run from apps/backend
npx medusa db:migrate         # Apply migrations
npx medusa db:generate <mod>  # Generate migration for a module
```

### Backend tests (run from apps/backend)
```bash
npm run test:unit                   # Unit tests: src/**/__tests__/**/*.unit.spec.[jt]s
npm run test:integration:http       # HTTP integration: integration-tests/http/*.spec.[jt]s
npm run test:integration:modules    # Module integration: src/modules/*/__tests__/**
```

## Architecture

### Backend (Medusa.js v2)

Medusa uses a **modular architecture** with dependency injection. Key conventions:

- **API Routes** (`src/api/`): File-based routing. `src/api/store/products/route.ts` maps to `GET /store/products`. Access DI container via `req.scope`. Store routes under `src/api/store/`, admin routes under `src/api/admin/`.
- **Modules** (`src/modules/`): Custom domain logic. Each module has models, services, and optionally workflows. Register in `medusa-config.ts`.
- **Workflows** (`src/workflows/`): Multi-step orchestration for complex operations (order creation, inventory setup). Called from API routes or seed scripts.
- **Subscribers** (`src/subscribers/`): Event-driven listeners for domain events.
- **Jobs** (`src/jobs/`): Async background tasks.
- **Links** (`src/links/`): Declare relationships between modules from different packages.
- **Admin extensions** (`src/admin/`): React components injected into the admin dashboard.

Config is in `medusa-config.ts` — loads env vars and registers CORS, database, plugins, and modules.

### Storefront (Next.js 15 App Router)

- **Routes** live under `src/app/[countryCode]/` — every page is region-aware by default.
  - `(main)/` — product browsing, account, collections, categories
  - `(checkout)/` — multi-step checkout flow
- **Modules** (`src/modules/`) group UI components by domain: `account`, `cart`, `checkout`, `products`, `common`, etc.
- **Data fetching** (`src/lib/data/`) — server-side functions that call the Medusa backend via `@medusajs/js-sdk`. These are called from Server Components.
- **SDK client** is initialized in `src/lib/config.ts` using `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- **Middleware** (`src/middleware.ts`) detects the user's country (via Cloudflare/Vercel headers or URL prefix) and sets the region. Falls back to `NEXT_PUBLIC_DEFAULT_REGION` (currently `vn`).
- **Path aliases**: `@lib/*` → `src/lib/*`, `@modules/*` → `src/modules/*`.

### Frontend–Backend Connection

The storefront talks to Medusa's REST API. The middleware caches region data (1-hour TTL) from `/store/regions` and injects a locale header on every request. There is no GraphQL layer — all data fetching uses the Medusa JS SDK or direct fetch calls.

## Environment

Both apps use a three-file env split. Files are loaded by precedence (highest wins): `.env.{NODE_ENV}` overrides `.env`.

### Backend (`apps/backend/`)

| File | Committed | Loaded when |
|---|---|---|
| `.env` | no | always — shared vars (CORS, JWT, onboarding) |
| `.env.development` | no | `medusa develop` (`NODE_ENV=development`) |
| `.env.production` | no | `medusa start` (`NODE_ENV=production`) |
| `.env.template` | yes | reference only |

**Important:** Medusa's `loadEnv` only natively handles `staging`, `production`, and `test`. `development` is handled by a manual dotenv load at the top of `medusa-config.ts` — do not remove it.

```
# .env (shared)
STORE_CORS / ADMIN_CORS / AUTH_CORS
JWT_SECRET / COOKIE_SECRET
MEDUSA_ADMIN_ONBOARDING_*

# .env.development
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/medusa-maoshu-v1
REDIS_URL=redis://localhost:6379

# .env.production
DATABASE_URL=postgresql://...supabase.co.../postgres
S3_ENDPOINT / S3_REGION / S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_FILE_URL
```

**Storage:** The Supabase file module is only loaded when `S3_ENDPOINT` is set. In development it is absent, so Medusa falls back to local file storage automatically.

**Migrations on deploy:** `apps/backend/package.json` `start` script runs `medusa db:migrate && medusa start` — migrations are applied automatically on every production deployment.

### Storefront (`apps/storefront/`)

Next.js natively supports the env split — no code changes needed.

| File | Committed | Loaded when |
|---|---|---|
| `.env` | yes | always — `NEXT_PUBLIC_DEFAULT_REGION=vn` |
| `.env.development` | no | `next dev` |
| `.env.production` | no | `next build` / `next start` |
| `.env.local` | no | kept empty — do not add vars here, it overrides everything |

```
# .env.development
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=https://localhost:8000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...   # local dev key

# .env.production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=<production-backend-url>
NEXT_PUBLIC_BASE_URL=<production-storefront-url>
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<production-publishable-key>
MEDUSA_CLOUD_S3_HOSTNAME=<supabase-project-ref>.supabase.co
NEXT_PUBLIC_STRIPE_KEY=<production-stripe-key>
```

## Root Category Routes

The backend has a dedicated custom route layer for anything that depends on the active root category. All such routes live under `apps/backend/src/api/store/root-categories/` and share a common utility layer.

### Utilities (`src/api/store/root-categories/utils.ts`)

Two reusable functions that every sub-route builds on:

- `getRootCategory(id, scope)` — fetches a product category by ID via `query.graph`, returning `{ id, name, handle, metadata }`.
- `resolveColorGroup(colorGroupId, scope)` — fetches the color group and replaces any stored system color IDs (`syscol_...`) with their hex values before returning.

### Sub-routes

| Route | File | Purpose |
|---|---|---|
| `GET /store/root-categories/:id` | `[id]/route.ts` | Returns `{ color_group }` — hex-resolved color group; storefront generates CSS vars locally |

### Adding a new sub-route

Use the `/add-root-category-route` skill (`.claude/skills/add-root-category-route.md`) for the full pattern.

In short:
1. Create `apps/backend/src/api/store/root-categories/[id]/<resource>/route.ts` — call `getRootCategory()`, read a metadata key, fetch and return the resolved data
2. Add a resolver to `utils.ts` if the fetch involves multiple chained DB calls or will be reused
3. Add a data fetcher in `apps/storefront/src/lib/data/<resource>.ts`
4. Add the fetch to the layout `Promise.all` alongside `getCategoryColors` — the storefront should never need a second round-trip

### Storefront side

The storefront makes **one fetch**: `getRootCategoryData(categoryId)` in `src/lib/data/root-category.ts`, called inside the layout's `Promise.all` alongside categories/customer/cart. The backend resolves all DB references (e.g. system color IDs → hex); lightweight derivation like CSS var generation runs on the storefront during SSR.

- Type: `RootCategoryData` — add new fields here as the backend route grows
- Fetches `GET /store/root-categories/:id` → `{ color_group }` with hex values resolved
- `buildCssVars(color_group)` in `src/lib/util/color-scale.ts` generates the CSS variable string during SSR

## Root Category — Storefront Config

The storefront is locked to a single root category set at deployment time via an env var. There is no user-facing category switcher.

### Env var

```
ROOT_CATEGORY_ID=pcat_01...   # server-side only, no NEXT_PUBLIC_ prefix
```

Add to `apps/storefront/.env.development` and `apps/storefront/.env.production`. Each deployment/domain gets its own value pointing to the correct root category.

### How it flows

1. `middleware.ts` checks `process.env.ROOT_CATEGORY_ID` on every request — if unset, redirects all routes to `/setup` (no loop: `/setup` itself is bypassed)
2. Server components read `process.env.ROOT_CATEGORY_ID` directly — no cookies, no localStorage
3. Client components that need the ID receive it as a `rootCategoryId` prop from their server parent — never read `process.env` client-side

### Files that read ROOT_CATEGORY_ID

| File | Usage |
|---|---|
| `src/middleware.ts` | Guard — redirects to `/setup` if missing |
| `src/app/[countryCode]/(main)/layout.tsx` | Color group fetch + footer data |
| `src/app/[countryCode]/(main)/page.tsx` | Scopes product grid and new arrivals |
| `src/app/[countryCode]/(main)/new-arrivals/page.tsx` | Scopes paginated products |
| `src/app/[countryCode]/(main)/categories/[...category]/page.tsx` | Validates category belongs to root |
| `src/modules/layout/templates/nav/index.tsx` | Active root for SubNav; passes to SideMenu and SearchBar |

### Setup page

`src/app/setup/page.tsx` — shown when `ROOT_CATEGORY_ID` is not set. Displays a 5-step guide and links to the admin panel (`NEXT_PUBLIC_MEDUSA_BACKEND_URL/app`). No layout, no region prefix — it's a standalone page outside the normal route tree.

### Deleted (no longer exist)

- `select-category` page — user cannot switch categories from the storefront
- `category-guard` component — redirect-to-select guard is gone
- `category-dropdown` component — no switcher in the nav

## Design System

### Color Theming

The storefront uses a CSS-variable-based design token system defined in `src/styles/globals.css` and mapped to Tailwind classes in `tailwind.config.js`.

**Semantic tokens** (each has `DEFAULT`, `hover`, `light`, `fg` shades):
`primary`, `secondary`, `inverse`, `info`, `warning`, `success`, `danger`

Usage: `bg-primary`, `text-primary-fg`, `bg-danger/50`, etc.

**Category-based theme switching:**

The active root category is stored in `localStorage` (key: `selectedCategoryId`) and mirrored to the `selectedCategoryId` cookie. The main layout (`src/app/[countryCode]/(main)/layout.tsx`) reads this cookie, fetches the matching root category from the backend, resolves its handle, and sets `data-theme` on the top-level wrapper div — scoping the theme to the entire page including Nav and Footer.

**Theme resolution rule (in `src/lib/util/theme.ts`):**
- If the root category handle is `"pet"` (or any handle mapped to `"pet"` in `HANDLE_TO_THEME`) → apply `data-theme="pet"` → orange primary, amber secondary
- Otherwise (including grocery or any unmapped handle) → apply `data-theme="grocery"` → blue primary, green secondary
- If no category is selected yet → no `data-theme` attribute → falls back to `:root` defaults (orange/pet palette)

**To add a new theme:** add a `[data-theme="name"]` block to `globals.css` overriding `--color-primary*` and `--color-secondary*`, then add the handle mapping to `HANDLE_TO_THEME` in `src/lib/util/theme.ts`.

## File Uploads

**All file uploads — including any custom API routes — must go through Medusa's file module service.** Never write files directly to the filesystem (`fs.writeFileSync`, `fs.createWriteStream`, etc.). The file module is configured to use the custom Supabase Storage provider (`src/modules/supabase-file`) and is the only sanctioned upload path.

### Upload route (`POST /admin/media`)

**Do NOT use `POST /admin/uploads`** — that path is Medusa's built-in multipart upload endpoint for product images. Our custom JSON-based upload lives at `/admin/media` (`src/api/admin/media/route.ts`).

The shared upload endpoint accepts:

```typescript
{
  filename: string   // original filename (used for extension/MIME detection)
  data: string       // base64-encoded file content
  folder?: string    // storage path prefix, e.g. "category/cat_123/logo_image"
  oldUrl?: string    // full URL of the file being replaced — backend deletes it first
}
```

Returns `{ url: string }` — the Supabase Storage public URL.

### Folder convention

All callers must pass a `folder` that encodes `{entity}/{id}/{field}`:

| Caller | Folder pattern |
|--------|----------------|
| Category images widget | `category/{id}/{field}` (e.g. `category/pcat_01/logo_image`) |
| Collection images widget | `collection/{id}/{field}` |
| Content thumbnails | `content/{id}/thumbnail` (new items: `content/thumbnail`) |
| Business info logo | `business-info/logo` |

### Replacing files

Always pass `oldUrl` when a file already exists for that slot. The backend extracts the storage key from the URL and calls `fileService.deleteFiles([key])` before uploading the new file, so old files are cleaned up automatically.

### Direct use of the file service

In a custom API route that doesn't go through `/admin/uploads`:

```typescript
import { Modules } from "@medusajs/framework/utils"

const fileService = req.scope.resolve(Modules.FILE)
const [uploaded] = await fileService.createFiles([
  { filename: "folder/myfile.jpg", mimeType, content: base64String, access: "public" },
])
res.json({ url: uploaded.url })

// To delete: fileService.deleteFiles([storageKey])
// The storage key equals uploaded.id (returned by createFiles) or is derived from
// the URL by stripping the S3_FILE_URL base prefix.
```

- `content` must be a base64-encoded string.
- `access: "public"` for media visible to customers; `"private"` for internal files.
- The returned `url` is the Supabase Storage public URL — store this in the database, not a local path.
- The static-serving route `GET /uploads/[filename]` exists only as a fallback for files uploaded before the Supabase migration. Do not rely on it for new uploads.

### Provider notes

The file provider is `src/modules/supabase-file` (NOT `@medusajs/file-s3`). The custom provider is required because Supabase Storage does not support S3 ACL headers, which `@medusajs/file-s3` hardcodes. The custom provider also preserves folder structure in storage keys.

## Scheduled Job Functions

The backend has a database-driven cron job system. Admins manage jobs from the UI at `/scheduled-jobs`. Jobs reference **pre-defined functions** by key — adding a new function is a 3-step code change with no DB migration.

To add a new function, use the `/add-cron-function` skill (`.claude/skills/add-cron-function.md`).

### Product Stats module

`PRODUCT_STATS_MODULE` (`src/modules/product-stats/`) tracks per-product stats in the `product_stat` table. All fields are integers with `DEFAULT 0` — always present, never null.

| Field | Updated by | Reset by |
|---|---|---|
| `weekly_selling_amount` | `order.completed` subscriber | product-trending-reset cron |
| `weekly_view_amount` | storefront view API (future) | product-trending-reset cron |
| `total_sell_amount` | `order.completed` subscriber | never |
| `total_view_amount` | storefront view API (future) | never |

Service has a `getOrCreate(productId)` method — call this instead of `retrieveProductStat` to ensure the record always exists.

**Auto-generated service method pluralization:** Medusa pluralizes the model name when generating CRUD methods, and it uses real English pluralization (not a naive `+ "s"`). A model ending in `y` becomes `ies`. So `ProductStatHistory` generates `listProductStatHistories` / `createProductStatHistories` / `updateProductStatHistories` — **not** `...Historys`. Likewise `ProductStat` → `...ProductStats`. Use the correct plural to avoid TS2551 build errors.

## Key Notes

- **Data fetching cache**: Use `cache: "no-store"` (not `next: { revalidate: N }`) in `sdk.client.fetch` calls for admin-managed content (business info, CMS pages, etc.) so changes appear immediately without a revalidation delay.
- **No Prisma** — Medusa uses its own data layer. Define models with `@medusajs/framework/utils` utilities and manage schema via `medusa db:generate / db:migrate`.
- **Payments**: Stripe and PayPal are pre-configured in the seed script. Manual payment is always available.
- **Currencies**: VND, KRW, and other no-decimal currencies are handled in `src/lib/util/prices.ts` — the `noDivisionCurrencies` list skips dividing by 100.
- **Seed script** (`src/migration-scripts/initial-data-seed.ts`) creates 7 regions (including Vietnam), 4 product categories, and 4 products with 32 variants. Run once after first migration.
- **Storefront runs on port 8000**, backend on **port 9000**, admin dashboard at `http://localhost:9000/app`.

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

**Backend** (`apps/backend/.env`):
```
DATABASE_URL=postgres://...
REDIS_URL=redis://localhost:6379
JWT_SECRET / COOKIE_SECRET
STORE_CORS / ADMIN_CORS / AUTH_CORS
```

**Storefront** (`apps/storefront/.env.local`):
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=vn
NEXT_PUBLIC_STRIPE_KEY=       # optional, Stripe payments
MEDUSA_CLOUD_S3_HOSTNAME=     # optional, S3 image hosting
```

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

## Key Notes

- **Data fetching cache**: Use `cache: "no-store"` (not `next: { revalidate: N }`) in `sdk.client.fetch` calls for admin-managed content (business info, CMS pages, etc.) so changes appear immediately without a revalidation delay.
- **No Prisma** — Medusa uses its own data layer. Define models with `@medusajs/framework/utils` utilities and manage schema via `medusa db:generate / db:migrate`.
- **Payments**: Stripe and PayPal are pre-configured in the seed script. Manual payment is always available.
- **Currencies**: VND, KRW, and other no-decimal currencies are handled in `src/lib/util/prices.ts` — the `noDivisionCurrencies` list skips dividing by 100.
- **Seed script** (`src/migration-scripts/initial-data-seed.ts`) creates 7 regions (including Vietnam), 4 product categories, and 4 products with 32 variants. Run once after first migration.
- **Storefront runs on port 8000**, backend on **port 9000**, admin dashboard at `http://localhost:9000/app`.

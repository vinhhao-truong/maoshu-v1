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

## Key Notes

- **No Prisma** — Medusa uses its own data layer. Define models with `@medusajs/framework/utils` utilities and manage schema via `medusa db:generate / db:migrate`.
- **Payments**: Stripe and PayPal are pre-configured in the seed script. Manual payment is always available.
- **Currencies**: VND, KRW, and other no-decimal currencies are handled in `src/lib/util/prices.ts` — the `noDivisionCurrencies` list skips dividing by 100.
- **Seed script** (`src/migration-scripts/initial-data-seed.ts`) creates 7 regions (including Vietnam), 4 product categories, and 4 products with 32 variants. Run once after first migration.
- **Storefront runs on port 8000**, backend on **port 9000**, admin dashboard at `http://localhost:9000/app`.

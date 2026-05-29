# Skill: Add a Pre-defined Cron Function

When asked to add a new cron function to the scheduled jobs system, follow these exact steps.

## Context

The backend has a database-driven cron job system at `apps/backend/src/`. Admins pick a function from a dropdown in the Scheduled Jobs admin page. Adding a new function requires changes to exactly 3 files — no DB migration, no new routes.

Key paths:
- Functions live in `apps/backend/src/modules/scheduled-job/functions/`
- Registry: `apps/backend/src/modules/scheduled-job/functions/index.ts`
- Admin UI dropdown: `apps/backend/src/admin/routes/scheduled-jobs/page.tsx`
- System job definitions: `apps/backend/src/modules/scheduled-job/system-jobs.ts`
- Job runner (do NOT modify directly): `apps/backend/src/jobs/scheduled-job-runner.ts`

**Two kinds of jobs:**
- **System jobs** — defined in code, auto-seeded into the DB by the runner, protected from deletion in the UI (purple "System" badge). Use these for jobs that should always exist.
- **Manual jobs** — created by admins through the UI (grey "Manual" badge). Use the 3-step process below to make a function available for admins to schedule.

## Step 1 — Write the function file

Create `apps/backend/src/modules/scheduled-job/functions/{kebab-name}.ts`:

```ts
import { MedusaContainer } from "@medusajs/framework/types"

export async function camelCaseName(container: MedusaContainer): Promise<void> {
  const logger = container.resolve("logger") as any
  // ... do work ...
  logger.info("[kebab-name] done")
}
```

**Resolving services inside the function:**
- Cross-module data (orders, products, etc.): resolve `"query"` and use `query.graph({ entity, fields, filters, pagination })`
- Product stats (weekly/total sell & view amounts): `container.resolve(PRODUCT_STATS_MODULE)` from `"../../product-stats"` — use `statsService.getOrCreate(productId)` for safe access
- Product service: `container.resolve(Modules.PRODUCT)` from `@medusajs/framework/utils`
- Logger: `container.resolve("logger")`

**Rules:**
- Never import from `src/jobs/` — functions must stay in `src/modules/scheduled-job/functions/`
- Use `query.graph` for cross-module joins, not raw module service relation calls
- Always log completion with `logger.info`

## Step 2 — Register in the function registry

Edit `apps/backend/src/modules/scheduled-job/functions/index.ts`:

```ts
import { camelCaseName } from "./kebab-name"   // add import

export const FUNCTION_REGISTRY = {
  // existing entries...
  "kebab-name": camelCaseName,                  // add entry
}

export const FUNCTION_LABELS = {
  // existing entries...
  "kebab-name": "Human Readable Label",         // add entry
}
```

## Step 3 — Add to the admin UI dropdown

Edit `apps/backend/src/admin/routes/scheduled-jobs/page.tsx`, find `FUNCTION_OPTIONS` and add one entry:

```ts
const FUNCTION_OPTIONS = [
  // existing entries...
  { key: "kebab-name", label: "Human Readable Label" },
]
```

The label here must match `FUNCTION_LABELS` exactly.

## Done (manual job)

The job runner dispatches by key automatically — no other changes needed. The admin can now create a scheduled job that selects the new function from the dropdown.

---

## To make a function a system job (auto-seeded, protected)

After completing Steps 1–3 above, add one entry to `apps/backend/src/modules/scheduled-job/system-jobs.ts`:

```ts
export const SYSTEM_JOBS = [
  // existing entries...
  {
    function_key: "kebab-name",
    label: "Human Readable Label",
    schedule_type: "recurring" as const,
    cron_expression: "0 0 * * 0",  // Vietnam time (Asia/Ho_Chi_Minh, UTC+7) — write schedules in VN local time
    enabled: true,
    is_system: true,
  },
]
```

The runner seeds missing system jobs on every tick — no migration or manual DB insert needed. The job will appear in the admin with a purple "System" badge and no Delete button. It can still be edited (schedule, enabled toggle) by admins.

## Existing functions for reference

| Key | File | What it does |
|---|---|---|
| `product-weekly-reset` | `product-weekly-reset.ts` | Snapshots then resets `weekly_selling_amount` + `weekly_view_amount` to 0 |
| `product-monthly-reset` | `product-monthly-reset.ts` | Snapshots then resets `monthly_selling_amount` + `monthly_view_amount` to 0 |
| `product-annual-reset` | `product-annual-reset.ts` | Snapshots then resets `annual_selling_amount` + `annual_view_amount` to 0 |

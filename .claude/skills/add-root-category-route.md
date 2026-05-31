# Skill: Add a Root Category Route

When asked to add new data that depends on the active root category, follow these steps.

## Context

The backend owns **all processing logic**. The storefront only fetches and renders — no data transformation on the client side.

Pattern for each concern:
```
GET /store/root-categories/:id/<concern>
  → backend: getRootCategory → read metadata → resolve data → return processed result
  → storefront: fetch once, use directly
```

Key files:
```
apps/backend/src/api/store/root-categories/
  utils.ts                        ← getRootCategory() + all resolver functions + color math
  [id]/
    color-system/route.ts         ← returns { css_vars: string | null }  (ready to inject)
    <new-concern>/route.ts        ← new routes go here

apps/storefront/src/lib/data/root-category.ts   ← RootCategoryData type + getRootCategoryData()
apps/storefront/src/app/[countryCode]/(main)/layout.tsx  ← calls getRootCategoryData() in Promise.all
```

---

## Step 1 — Write the resolver in `utils.ts`

Add to `apps/backend/src/api/store/root-categories/utils.ts`:

```ts
// Resolves <resource>Id → processed result ready for the storefront to use directly
export async function resolve<Resource>(
  id: string,
  scope: Record<string, unknown>
): Promise<<ReturnType> | null> {
  const service = (scope as any).resolve(<MODULE_KEY>)
  const item = await service.retrieve<ModelName>(id)
  if (!item) return null
  // Do all processing here — resolve IDs, transform data, generate derived values, etc.
  // The storefront should receive a result it can use as-is.
  return processedResult
}
```

**Rule:** All transformation logic — ID resolution, derivation, formatting — goes here. The route file should be thin.

---

## Step 2 — Create the route

Create `apps/backend/src/api/store/root-categories/[id]/<concern>/route.ts`:

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRootCategory, resolve<Resource> } from "../../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const category = await getRootCategory(req.params.id, req.scope)
  if (!category) return res.json({ <field>: null })

  const resourceId = category.metadata?.<metadata_key> as string | undefined
  if (!resourceId) return res.json({ <field>: null })

  const <field> = await resolve<Resource>(resourceId, req.scope)
  res.json({ <field> })
}
```

---

## Step 3 — Add the field to `RootCategoryData`

Edit `apps/storefront/src/lib/data/root-category.ts`:

```ts
export type RootCategoryData = {
  css_vars: string | null
  <field>: <FieldType> | null   // add the new field
}
```

`getRootCategoryData()` currently fetches `/color-system`. If you are adding an **additional** concern, either:
- **Extend the existing fetch**: combine both concerns into one endpoint (preferred — keeps one round-trip)
- **Add a separate fetch**: only if the concern is truly independent and not always needed

---

## Step 4 — Use in the layout

The layout already calls `getRootCategoryData()`. Read the new field directly:

```ts
// layout.tsx — no new fetch
const <field> = rootCategoryData?.<field> ?? null
```

Pass it as a prop to whichever component needs it.

---

## Rules

- **Backend processes, storefront renders.** No transformation logic in the storefront — if data needs formatting, do it in the resolver.
- **One fetch per page load.** Never add a second `sdk.client.fetch` for root category data.
- **Always return null gracefully.** Missing metadata key or missing record → `null`, never throw or 404.
- **Never read `process.env.ROOT_CATEGORY_ID` in a client component.** Flows from server layout as props.

---

## Existing routes for reference

| Route | Resolver | Metadata key | What it returns |
|---|---|---|---|
| `GET /store/root-categories/:id/color-system` | `resolveColorSystem` | `color_group_id` | `{ css_vars }` — complete CSS variable declarations, ready to inject into `<style>` |

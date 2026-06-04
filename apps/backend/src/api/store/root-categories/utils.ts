import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { COLOR_GROUP_MODULE } from "../../../modules/color-group"
import { SYSTEM_COLOR_MODULE } from "../../../modules/system-color"
import ColorGroupModuleService from "../../../modules/color-group/service"
import SystemColorModuleService from "../../../modules/system-color/service"

const COLOR_FIELDS = [
  "primary", "secondary", "inverse", "neutral",
  "success", "warning", "danger", "info",
] as const

export type RootCategoryData = {
  id: string
  name: string
  handle: string
  metadata: Record<string, unknown> | null
}

export async function getRootCategory(
  id: string,
  scope: Record<string, unknown>
): Promise<RootCategoryData | null> {
  const query = (scope as any).resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    filters: { id },
    fields: ["id", "name", "handle", "metadata"],
  })
  return (data[0] as RootCategoryData) ?? null
}

// Resolves a color group ID → hex-resolved color group object.
// System color IDs (syscol_...) are replaced with their hex values.
export async function resolveColorGroup(
  colorGroupId: string,
  scope: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const colorGroupService: ColorGroupModuleService = (scope as any).resolve(COLOR_GROUP_MODULE)
  const group = await colorGroupService.retrieveColorGroup(colorGroupId)
  if (!group) return null

  const resolved = { ...(group as unknown as Record<string, unknown>) }

  const ids = COLOR_FIELDS
    .map((f) => resolved[f])
    .filter((v): v is string => typeof v === "string" && v.startsWith("syscol"))

  if (ids.length > 0) {
    const systemColorService: SystemColorModuleService = (scope as any).resolve(SYSTEM_COLOR_MODULE)
    const systemColors = await systemColorService.listSystemColors({ id: ids })
    const hexById: Record<string, string> = Object.fromEntries(
      systemColors.map((c) => [c.id, c.hex])
    )
    for (const field of COLOR_FIELDS) {
      const val = resolved[field]
      if (typeof val === "string" && hexById[val]) resolved[field] = hexById[val]
    }
  }

  return resolved
}

// ── Home grid ──────────────────────────────────────────────────────────────
// One route resolves the whole homepage grid: newest products in the root tree
// plus the featured collections (each with its products), all scoped to the
// root category. Cards render thumbnail + title only, so no region/pricing.

const MAX_PRODUCTS_PER_COLLECTION = 4
const NEW_ARRIVALS_LIMIT = 6

export type HomeGridProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  images: { url: string }[]
}

export type FeaturedCollection = {
  id: string
  title: string
  handle: string
  products: HomeGridProduct[]
}

export type HomeGridData = {
  new_arrivals: HomeGridProduct[]
  featured_collections: FeaturedCollection[]
}

function toSummary(p: Record<string, any>): HomeGridProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    thumbnail: p.thumbnail ?? null,
    images: (p.images ?? [])
      .map((img: { url?: string }) => ({ url: img?.url ?? "" }))
      .filter((img: { url: string }) => img.url),
  }
}

// Root category + 2 levels of descendants (mirrors the storefront tree logic).
export async function getRootCategoryTreeIds(
  rootId: string,
  scope: Record<string, unknown>
): Promise<string[]> {
  const query = (scope as any).resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    filters: { id: rootId },
    fields: ["id", "category_children.id", "category_children.category_children.id"],
  })
  const root = data[0] as any
  if (!root) return []

  const ids = [root.id]
  for (const child of root.category_children ?? []) {
    ids.push(child.id)
    for (const grand of child.category_children ?? []) {
      ids.push(grand.id)
    }
  }
  return ids
}

const PRODUCT_FIELDS = [
  "id", "handle", "title", "thumbnail", "images.url", "created_at", "collection_id",
]

export async function resolveHomeGrid(
  rootId: string,
  scope: Record<string, unknown>
): Promise<HomeGridData> {
  const query = (scope as any).resolve(ContainerRegistrationKeys.QUERY)
  const treeIds = await getRootCategoryTreeIds(rootId, scope)

  if (treeIds.length === 0) {
    return { new_arrivals: [], featured_collections: [] }
  }

  // 1. New arrivals — newest published products within the root tree.
  // The product module service has no `category_id` filter, so we filter on
  // the `categories` relation via query.graph.
  const { data: newArrivalsRaw } = await query.graph({
    entity: "product",
    filters: { status: "published", categories: { id: treeIds } },
    fields: PRODUCT_FIELDS,
    pagination: { take: NEW_ARRIVALS_LIMIT, order: { created_at: "DESC" } },
  })
  const new_arrivals = newArrivalsRaw.map(toSummary)

  // 2. Featured collections (metadata.featured truthy), in creation order.
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "title", "handle", "metadata"],
    pagination: { take: 1000, order: { created_at: "ASC" } },
  })
  const featured = collections.filter((c: any) => {
    const f = c.metadata?.featured
    return f === true || f === "true"
  })
  if (featured.length === 0) {
    return { new_arrivals, featured_collections: [] }
  }

  // 3. Products for all featured collections at once, scoped to the root tree.
  const featuredIds = featured.map((c: any) => c.id)
  const { data: collProductsRaw } = await query.graph({
    entity: "product",
    filters: {
      status: "published",
      categories: { id: treeIds },
      collection_id: featuredIds,
    },
    fields: PRODUCT_FIELDS,
    pagination: { take: 1000, order: { created_at: "DESC" } },
  })

  // Group by collection, capped per collection.
  const byCollection = new Map<string, HomeGridProduct[]>()
  for (const p of collProductsRaw) {
    const cid = p.collection_id
    if (!cid) continue
    const list = byCollection.get(cid) ?? []
    if (list.length < MAX_PRODUCTS_PER_COLLECTION) {
      list.push(toSummary(p))
      byCollection.set(cid, list)
    }
  }

  // Drop featured collections with no in-tree products.
  const featured_collections: FeaturedCollection[] = featured
    .map((c: any) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      products: byCollection.get(c.id) ?? [],
    }))
    .filter((c: FeaturedCollection) => c.products.length > 0)

  return { new_arrivals, featured_collections }
}

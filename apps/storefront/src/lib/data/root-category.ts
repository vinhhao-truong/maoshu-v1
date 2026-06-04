import { sdk } from "@lib/config"
import { ColorGroup } from "@lib/util/color-scale"

export type RootCategoryData = {
  color_group: ColorGroup | null
  // add new fields here as the backend route grows
}

export async function getRootCategoryData(
  categoryId: string
): Promise<RootCategoryData | null> {
  return sdk.client
    .fetch<RootCategoryData>(`/store/root-categories/${categoryId}`, {
      cache: "no-store",
    })
    .catch(() => null)
}

// Homepage grid — resolved entirely by the backend in one round-trip:
// newest products in the root tree + featured collections (each with products).
// Cards render thumbnail + title only, so no region/pricing is needed.
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

export async function getRootCategoryHomeGrid(
  categoryId: string
): Promise<HomeGridData | null> {
  return sdk.client
    .fetch<HomeGridData>(`/store/root-categories/${categoryId}/home-grid`, {
      cache: "no-store",
    })
    .catch(() => null)
}

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

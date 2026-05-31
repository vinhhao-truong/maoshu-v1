import { sdk } from "@lib/config"
import { ColorGroup } from "@lib/util/color-scale"

export async function getCategoryColors(
  categoryId: string
): Promise<ColorGroup | null> {
  return sdk.client
    .fetch<{ color_group: ColorGroup | null }>(
      `/store/root-categories/${categoryId}/colors`,
      { cache: "no-store" }
    )
    .then(({ color_group }) => color_group)
    .catch(() => null)
}

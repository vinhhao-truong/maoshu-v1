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

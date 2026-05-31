import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRootCategory, resolveColorGroup } from "../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const category = await getRootCategory(req.params.id, req.scope)
  if (!category) {
    return res.json({ color_group: null })
  }

  const colorGroupId = category.metadata?.color_group_id as string | undefined

  // All resolvers run in parallel — add new ones here as the storefront grows
  const [color_group] = await Promise.all([
    colorGroupId ? resolveColorGroup(colorGroupId, req.scope) : null,
  ])

  res.json({ color_group })
}

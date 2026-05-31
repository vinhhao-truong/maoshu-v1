import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRootCategory, resolveColorGroup } from "../../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const category = await getRootCategory(req.params.id, req.scope)
  if (!category) return res.json({ color_group: null })

  const colorGroupId = category.metadata?.color_group_id as string | undefined
  if (!colorGroupId) return res.json({ color_group: null })

  const color_group = await resolveColorGroup(colorGroupId, req.scope)
  res.json({ color_group })
}

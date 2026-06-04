import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRootCategory, resolveHomeGrid } from "../../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const category = await getRootCategory(req.params.id, req.scope)
  if (!category) {
    return res.json({ new_arrivals: [], featured_collections: [] })
  }

  const grid = await resolveHomeGrid(category.id, req.scope)
  res.json(grid)
}

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VARIANT_COST_MODULE } from "../../../../modules/variant-cost"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)
  const variantId = req.params.id

  const [record] = await variantCostService.listVariantCosts({ variant_id: variantId })
  res.json({ cost: record?.cost ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cost } = req.body as { cost: number | null }
  const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)
  const variantId = req.params.id

  const [existing] = await variantCostService.listVariantCosts({ variant_id: variantId })
  if (existing) {
    await variantCostService.updateVariantCosts([{ id: existing.id, cost }])
  } else if (cost != null) {
    await variantCostService.createVariantCosts({ variant_id: variantId, cost })
  }

  res.json({ success: true })
}

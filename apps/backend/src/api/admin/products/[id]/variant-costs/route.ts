import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VARIANT_COST_MODULE } from "../../../../../modules/variant-cost"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)

  const { data } = await query.graph({
    entity: "product",
    filters: { id: req.params.id },
    fields: ["id", "variants.id", "variants.title", "variants.sku"],
  })

  const product = data[0]
  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const variants = (product as any).variants ?? []
  const variantIds: string[] = variants.map((v: any) => v.id)

  const costs =
    variantIds.length > 0
      ? await variantCostService.listVariantCosts({ variant_id: variantIds })
      : []

  res.json({ variants, costs })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { costs } = req.body as {
    costs: { variant_id: string; cost: number | null }[]
  }

  const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)

  for (const { variant_id, cost } of costs ?? []) {
    const [existing] = await variantCostService.listVariantCosts({ variant_id })
    if (existing) {
      await variantCostService.updateVariantCosts(existing.id, { cost })
    } else if (cost != null) {
      await variantCostService.createVariantCosts({ variant_id, cost })
    }
  }

  res.json({ success: true })
}

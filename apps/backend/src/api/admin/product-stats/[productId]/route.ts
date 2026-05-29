import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_STATS_MODULE } from "../../../../modules/product-stats"
import ProductStatsModuleService from "../../../../modules/product-stats/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ProductStatsModuleService = req.scope.resolve(PRODUCT_STATS_MODULE)
  const stat = await service.getOrCreate(req.params.productId)
  res.json({ stat })
}

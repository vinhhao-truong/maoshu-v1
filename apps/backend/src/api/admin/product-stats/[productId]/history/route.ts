import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_STATS_MODULE } from "../../../../../modules/product-stats"
import ProductStatsModuleService from "../../../../../modules/product-stats/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ProductStatsModuleService = req.scope.resolve(PRODUCT_STATS_MODULE)
  const limit = Number(req.query.limit) || 52
  const resetType = req.query.reset_type as string | undefined

  const filters: Record<string, any> = { product_id: req.params.productId }
  if (resetType) filters.reset_type = resetType

  const history = await service.listProductStatHistorys(
    filters,
    { skip: 0, take: limit, order: { period_end: "DESC" } }
  )
  res.json({ history })
}

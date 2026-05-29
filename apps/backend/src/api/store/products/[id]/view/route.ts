import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_STATS_MODULE } from "../../../../../modules/product-stats"
import ProductStatsModuleService from "../../../../../modules/product-stats/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ProductStatsModuleService = req.scope.resolve(PRODUCT_STATS_MODULE)
  const stat = await service.getOrCreate(req.params.id)
  await service.updateProductStats([{
    id: stat.id,
    weekly_view_amount: (stat.weekly_view_amount ?? 0) + 1,
    monthly_view_amount: (stat.monthly_view_amount ?? 0) + 1,
    annual_view_amount: (stat.annual_view_amount ?? 0) + 1,
    total_view_amount: (stat.total_view_amount ?? 0) + 1,
  }])
  res.json({ success: true })
}

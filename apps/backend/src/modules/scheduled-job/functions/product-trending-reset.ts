import { MedusaContainer } from "@medusajs/framework/types"
import { PRODUCT_STATS_MODULE } from "../../product-stats"
import ProductStatsModuleService from "../../product-stats/service"

export async function productTrendingReset(container: MedusaContainer): Promise<void> {
  const statsService: ProductStatsModuleService = container.resolve(PRODUCT_STATS_MODULE)
  const logger = container.resolve("logger") as any

  const stats = await statsService.listProductStats(
    {},
    { skip: 0, take: 10000 }
  )

  const toReset = stats.filter(
    (s) => (s.weekly_selling_amount ?? 0) !== 0 || (s.weekly_view_amount ?? 0) !== 0
  )

  if (toReset.length === 0) {
    logger.info("[product-trending-reset] Nothing to reset")
    return
  }

  await statsService.updateProductStats(
    toReset.map((s) => ({
      id: s.id,
      weekly_selling_amount: 0,
      weekly_view_amount: 0,
    }))
  )

  logger.info(`[product-trending-reset] Reset weekly stats for ${toReset.length} products`)
}

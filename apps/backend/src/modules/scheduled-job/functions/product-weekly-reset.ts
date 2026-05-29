import { MedusaContainer } from "@medusajs/framework/types"
import { PRODUCT_STATS_MODULE } from "../../product-stats"
import ProductStatsModuleService from "../../product-stats/service"

export async function productWeeklyReset(container: MedusaContainer): Promise<void> {
  const statsService: ProductStatsModuleService = container.resolve(PRODUCT_STATS_MODULE)
  const logger = container.resolve("logger") as any

  const stats = await statsService.listProductStats({}, { skip: 0, take: 10000 })
  const toReset = stats.filter(
    (s) => (s.weekly_selling_amount ?? 0) !== 0 || (s.weekly_view_amount ?? 0) !== 0
  )

  if (toReset.length === 0) {
    logger.info("[product-weekly-reset] Nothing to reset")
    return
  }

  const periodEnd = new Date()

  await statsService.createProductStatHistorys(
    toReset.map((s) => ({
      product_id: s.product_id,
      reset_type: "weekly",
      selling_amount: s.weekly_selling_amount ?? 0,
      view_amount: s.weekly_view_amount ?? 0,
      period_end: periodEnd,
    }))
  )

  await statsService.updateProductStats(
    toReset.map((s) => ({ id: s.id, weekly_selling_amount: 0, weekly_view_amount: 0 }))
  )

  logger.info(`[product-weekly-reset] Snapshotted and reset ${toReset.length} products`)
}

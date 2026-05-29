import { type SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { PRODUCT_STATS_MODULE } from "../modules/product-stats"
import ProductStatsModuleService from "../modules/product-stats/service"

export default async function orderCompletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const query = container.resolve("query") as any
  const statsService: ProductStatsModuleService = container.resolve(PRODUCT_STATS_MODULE)
  const logger = container.resolve("logger") as any

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: ["id", "items.product_id", "items.quantity"],
  })

  const order = orders?.[0]
  if (!order) return

  // Aggregate quantities per product_id (handles multiple variants of the same product)
  const productQuantities = new Map<string, number>()
  for (const item of order.items ?? []) {
    if (!item.product_id) continue
    productQuantities.set(
      item.product_id,
      (productQuantities.get(item.product_id) ?? 0) + (item.quantity ?? 0)
    )
  }

  for (const [productId, qty] of productQuantities) {
    try {
      const stat = await statsService.getOrCreate(productId)
      await statsService.updateProductStats([{
        id: stat.id,
        weekly_selling_amount: (stat.weekly_selling_amount ?? 0) + qty,
        monthly_selling_amount: (stat.monthly_selling_amount ?? 0) + qty,
        annual_selling_amount: (stat.annual_selling_amount ?? 0) + qty,
        total_sell_amount: (stat.total_sell_amount ?? 0) + qty,
      }])
    } catch (e: any) {
      logger.warn(`[order-completed] Failed to update stats for product ${productId}: ${e?.message}`)
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}

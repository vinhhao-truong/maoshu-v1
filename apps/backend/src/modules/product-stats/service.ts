import { MedusaService } from "@medusajs/framework/utils"
import ProductStat from "./models/product-stat"
import ProductStatHistory from "./models/product-stat-history"

class ProductStatsModuleService extends MedusaService({ ProductStat, ProductStatHistory }) {
  async getOrCreate(productId: string) {
    const [existing] = await this.listProductStats({ product_id: productId })
    if (existing) return existing
    return this.createProductStats({ product_id: productId })
  }
}

export default ProductStatsModuleService

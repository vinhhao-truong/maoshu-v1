import { MedusaService } from "@medusajs/framework/utils"
import ProductStat from "./models/product-stat"

class ProductStatsModuleService extends MedusaService({ ProductStat }) {
  async getOrCreate(productId: string) {
    const [existing] = await this.listProductStats({ product_id: productId })
    if (existing) return existing
    return this.createProductStats({ product_id: productId })
  }
}

export default ProductStatsModuleService

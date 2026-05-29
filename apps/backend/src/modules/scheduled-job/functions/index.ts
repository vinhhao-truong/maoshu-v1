import { MedusaContainer } from "@medusajs/framework/types"
import { productTrendingReset } from "./product-trending-reset"

export const FUNCTION_REGISTRY: Record<string, (container: MedusaContainer) => Promise<void>> = {
  "product-trending-reset": productTrendingReset,
}

export const FUNCTION_LABELS: Record<string, string> = {
  "product-trending-reset": "Product Trending Reset",
}

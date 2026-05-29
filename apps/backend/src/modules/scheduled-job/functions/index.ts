import { MedusaContainer } from "@medusajs/framework/types"
import { productWeeklyReset } from "./product-weekly-reset"
import { productMonthlyReset } from "./product-monthly-reset"
import { productAnnualReset } from "./product-annual-reset"

export const FUNCTION_REGISTRY: Record<string, (container: MedusaContainer) => Promise<void>> = {
  "product-weekly-reset": productWeeklyReset,
  "product-monthly-reset": productMonthlyReset,
  "product-annual-reset": productAnnualReset,
}

export const FUNCTION_LABELS: Record<string, string> = {
  "product-weekly-reset": "Product Weekly Reset",
  "product-monthly-reset": "Product Monthly Reset",
  "product-annual-reset": "Product Annual Reset",
}

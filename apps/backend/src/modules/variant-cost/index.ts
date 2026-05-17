import { Module } from "@medusajs/framework/utils"
import VariantCostModuleService from "./service"

export const VARIANT_COST_MODULE = "variantCostModule"

export default Module(VARIANT_COST_MODULE, {
  service: VariantCostModuleService,
})

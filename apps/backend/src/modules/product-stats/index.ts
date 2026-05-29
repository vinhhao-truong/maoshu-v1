import { Module } from "@medusajs/framework/utils"
import ProductStatsModuleService from "./service"

export const PRODUCT_STATS_MODULE = "productStatsModule"

export default Module(PRODUCT_STATS_MODULE, {
  service: ProductStatsModuleService,
})

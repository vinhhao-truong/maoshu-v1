import { Module } from "@medusajs/framework/utils"
import BusinessInfoModuleService from "./service"

export const BUSINESS_INFO_MODULE = "businessInfoModule"

export default Module(BUSINESS_INFO_MODULE, {
  service: BusinessInfoModuleService,
})

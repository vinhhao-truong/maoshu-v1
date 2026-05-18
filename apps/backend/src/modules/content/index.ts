import { Module } from "@medusajs/framework/utils"
import ContentModuleService from "./service"

export const CONTENT_MODULE = "contentModule"

export default Module(CONTENT_MODULE, {
  service: ContentModuleService,
})

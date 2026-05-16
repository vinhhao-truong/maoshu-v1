import { Module } from "@medusajs/framework/utils"
import ColorGroupModuleService from "./service"

export const COLOR_GROUP_MODULE = "colorGroupModule"

export default Module(COLOR_GROUP_MODULE, {
  service: ColorGroupModuleService,
})

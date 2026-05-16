import { Module } from "@medusajs/framework/utils"
import SystemColorModuleService from "./service"

export const SYSTEM_COLOR_MODULE = "systemColorModule"

export default Module(SYSTEM_COLOR_MODULE, {
  service: SystemColorModuleService,
})

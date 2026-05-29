import { Module } from "@medusajs/framework/utils"
import ScheduledJobModuleService from "./service"

export const SCHEDULED_JOB_MODULE = "scheduledJobModule"

export default Module(SCHEDULED_JOB_MODULE, {
  service: ScheduledJobModuleService,
})

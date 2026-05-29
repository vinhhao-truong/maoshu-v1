import { MedusaService } from "@medusajs/framework/utils"
import ScheduledJob from "./models/scheduled-job"
import ScheduledJobLog from "./models/scheduled-job-log"

class ScheduledJobModuleService extends MedusaService({ ScheduledJob, ScheduledJobLog }) {}

export default ScheduledJobModuleService

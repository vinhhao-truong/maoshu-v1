import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHEDULED_JOB_MODULE } from "../../../../../modules/scheduled-job"
import ScheduledJobModuleService from "../../../../../modules/scheduled-job/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  const limit = Number(req.query.limit) || 20
  const logs = await service.listScheduledJobLogs(
    { job_id: req.params.id },
    { skip: 0, take: limit, order: { ran_at: "DESC" } }
  )
  res.json({ logs })
}

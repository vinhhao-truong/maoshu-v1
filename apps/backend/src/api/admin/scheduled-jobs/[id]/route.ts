import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHEDULED_JOB_MODULE } from "../../../../modules/scheduled-job"
import ScheduledJobModuleService from "../../../../modules/scheduled-job/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  const body = req.body as {
    function_key?: string
    label?: string
    schedule_type?: "once" | "recurring"
    cron_expression?: string
    run_at?: string | null
    enabled?: boolean
  }

  const [job] = await service.updateScheduledJobs([{
    id: req.params.id,
    ...body,
    run_at: body.run_at !== undefined
      ? (body.run_at ? new Date(body.run_at) : null)
      : undefined,
  }])
  res.json({ job })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  await service.deleteScheduledJobs([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}

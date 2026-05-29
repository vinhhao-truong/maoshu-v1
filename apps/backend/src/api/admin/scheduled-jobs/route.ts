import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHEDULED_JOB_MODULE } from "../../../modules/scheduled-job"
import ScheduledJobModuleService from "../../../modules/scheduled-job/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  const [jobs, count] = await service.listAndCountScheduledJobs(
    {},
    { skip: 0, take: 200, order: { created_at: "DESC" } }
  )
  res.json({ jobs, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  const body = req.body as {
    function_key: string
    label?: string
    schedule_type: "once" | "recurring"
    cron_expression?: string
    run_at?: string
    enabled?: boolean
  }

  if (!body.function_key || !body.schedule_type) {
    return res.status(400).json({ message: "function_key and schedule_type are required" })
  }
  if (body.schedule_type === "recurring" && !body.cron_expression) {
    return res.status(400).json({ message: "cron_expression is required for recurring jobs" })
  }
  if (body.schedule_type === "once" && !body.run_at) {
    return res.status(400).json({ message: "run_at is required for once jobs" })
  }

  const job = await service.createScheduledJobs({
    function_key: body.function_key,
    label: body.label,
    schedule_type: body.schedule_type,
    cron_expression: body.cron_expression,
    run_at: body.run_at ? new Date(body.run_at) : undefined,
    enabled: body.enabled ?? true,
  })
  res.status(201).json({ job })
}

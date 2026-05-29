import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHEDULED_JOB_MODULE } from "../../../../../modules/scheduled-job"
import ScheduledJobModuleService from "../../../../../modules/scheduled-job/service"
import { FUNCTION_REGISTRY } from "../../../../../modules/scheduled-job/functions"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ScheduledJobModuleService = req.scope.resolve(SCHEDULED_JOB_MODULE)
  const job = await service.retrieveScheduledJob(req.params.id)

  const fn = FUNCTION_REGISTRY[job.function_key]
  if (!fn) {
    return res.status(400).json({ message: `Unknown function key: ${job.function_key}` })
  }

  const ranAt = new Date()
  try {
    await fn(req.scope)
    const [updated] = await service.updateScheduledJobs([{
      id: job.id,
      last_run_at: ranAt,
      last_run_status: "success",
    }])
    await service.createScheduledJobLogs([{
      job_id: job.id,
      ran_at: ranAt,
      status: "success",
      error_message: null,
    }])
    res.json({ job: updated })
  } catch (e: any) {
    await service.updateScheduledJobs([{
      id: job.id,
      last_run_at: ranAt,
      last_run_status: "failed",
    }])
    await service.createScheduledJobLogs([{
      job_id: job.id,
      ran_at: ranAt,
      status: "failed",
      error_message: e?.message ?? "Unknown error",
    }])
    res.status(500).json({ message: e?.message ?? "Job execution failed" })
  }
}

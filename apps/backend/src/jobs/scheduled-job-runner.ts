import { MedusaContainer } from "@medusajs/framework/types"
import { parseExpression } from "cron-parser"
import { SCHEDULED_JOB_MODULE } from "../modules/scheduled-job"
import ScheduledJobModuleService from "../modules/scheduled-job/service"
import { FUNCTION_REGISTRY } from "../modules/scheduled-job/functions"
import { SYSTEM_JOBS } from "../modules/scheduled-job/system-jobs"

async function seedSystemJobs(service: ScheduledJobModuleService) {
  const validKeys = new Set(SYSTEM_JOBS.map((j) => j.function_key))

  // Remove system jobs whose function_key is no longer registered (handles renames)
  const allSystemJobs = await service.listScheduledJobs({ is_system: true })
  const orphaned = allSystemJobs.filter((j) => !validKeys.has(j.function_key))
  if (orphaned.length > 0) {
    await service.deleteScheduledJobs(orphaned.map((j) => j.id))
  }

  // Create any missing system jobs
  for (const spec of SYSTEM_JOBS) {
    const existing = await service.listScheduledJobs({
      function_key: spec.function_key,
      is_system: true,
    })
    if (existing.length === 0) {
      await service.createScheduledJobs(spec)
    }
  }
}

export default async function scheduledJobRunner(container: MedusaContainer) {
  const service: ScheduledJobModuleService = container.resolve(SCHEDULED_JOB_MODULE)
  const logger = container.resolve("logger") as any

  await seedSystemJobs(service)

  const [jobs] = await service.listAndCountScheduledJobs(
    { enabled: true },
    { skip: 0, take: 500 }
  )

  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

  for (const job of jobs) {
    let shouldRun = false

    if (job.schedule_type === "recurring" && job.cron_expression) {
      try {
        const interval = parseExpression(job.cron_expression, { currentDate: now, tz: "Asia/Ho_Chi_Minh" })
        const prev = interval.prev().toDate()
        shouldRun = prev >= oneMinuteAgo && prev <= now
      } catch {
        logger.warn(`[scheduled-job-runner] Invalid cron for job ${job.id}: ${job.cron_expression}`)
        continue
      }
    } else if (job.schedule_type === "once" && job.run_at) {
      shouldRun = new Date(job.run_at) <= now && job.last_run_at === null
    }

    if (!shouldRun) continue

    const fn = FUNCTION_REGISTRY[job.function_key]
    if (!fn) {
      logger.warn(`[scheduled-job-runner] Unknown function key: ${job.function_key}`)
      continue
    }

    const ranAt = new Date()
    try {
      await fn(container)
      await service.updateScheduledJobs([{ id: job.id, last_run_at: ranAt, last_run_status: "success" }])
      await service.createScheduledJobLogs([{ job_id: job.id, ran_at: ranAt, status: "success", error_message: null }])
      logger.info(`[scheduled-job-runner] Job ${job.id} (${job.function_key}) succeeded`)
    } catch (e: any) {
      await service.updateScheduledJobs([{ id: job.id, last_run_at: ranAt, last_run_status: "failed" }])
      await service.createScheduledJobLogs([{ job_id: job.id, ran_at: ranAt, status: "failed", error_message: e?.message ?? "Unknown error" }])
      logger.error(`[scheduled-job-runner] Job ${job.id} (${job.function_key}) failed: ${e?.message}`)
    }
  }
}

export const config = {
  name: "scheduled-job-runner",
  schedule: "* * * * *",
}

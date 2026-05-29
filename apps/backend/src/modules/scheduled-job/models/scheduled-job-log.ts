import { model } from "@medusajs/framework/utils"

const ScheduledJobLog = model.define("scheduled_job_log", {
  id: model.id({ prefix: "schl" }).primaryKey(),
  job_id: model.text(),
  ran_at: model.dateTime(),
  status: model.text(),
  error_message: model.text().nullable(),
})

export default ScheduledJobLog

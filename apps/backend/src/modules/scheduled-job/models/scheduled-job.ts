import { model } from "@medusajs/framework/utils"

const ScheduledJob = model.define("scheduled_job", {
  id: model.id({ prefix: "schj" }).primaryKey(),
  function_key: model.text(),
  label: model.text().nullable(),
  schedule_type: model.text().default("recurring"),
  cron_expression: model.text().nullable(),
  run_at: model.dateTime().nullable(),
  enabled: model.boolean().default(true),
  last_run_at: model.dateTime().nullable(),
  last_run_status: model.text().nullable(),
})

export default ScheduledJob

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type ScheduledJob = {
  id: string
  function_key: string
  label: string | null
  schedule_type: "once" | "recurring"
  cron_expression: string | null
  run_at: string | null
  enabled: boolean
  last_run_at: string | null
  last_run_status: "success" | "failed" | null
  is_system: boolean
  created_at: string
}

type ScheduledJobLog = {
  id: string
  job_id: string
  ran_at: string
  status: "success" | "failed"
  error_message: string | null
}

type CronPreset = "daily" | "weekly" | "monthly" | "custom"

type JobForm = {
  function_key: string
  label: string
  schedule_type: "once" | "recurring"
  // cron builder
  cron_preset: CronPreset
  cron_hour: string
  cron_minute: string
  cron_weekdays: string[]   // "0"=Sun "1"=Mon … "6"=Sat
  cron_month_day: string    // "1"–"31"
  cron_custom: string       // raw expression for "custom"
  // once
  run_at: string
  enabled: boolean
}

const FUNCTION_OPTIONS = [
  { key: "product-weekly-reset",  label: "Product Weekly Reset" },
  { key: "product-monthly-reset", label: "Product Monthly Reset" },
  { key: "product-annual-reset",  label: "Product Annual Reset" },
]

const WEEKDAYS = [
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
  { value: "0", label: "Sun" },
]

const HOURS = Array.from({ length: 24 }, (_, i) => String(i))
const MINUTES = ["0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1))

const BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return ""
  return iso.slice(0, 16)
}

function pad(n: string) {
  return n.padStart(2, "0")
}

function buildCronExpression(form: JobForm): string {
  const m = form.cron_minute || "0"
  const h = form.cron_hour || "0"
  switch (form.cron_preset) {
    case "daily":   return `${m} ${h} * * *`
    case "weekly":  return `${m} ${h} * * ${form.cron_weekdays.length ? form.cron_weekdays.join(",") : "*"}`
    case "monthly": return `${m} ${h} ${form.cron_month_day || "1"} * *`
    case "custom":  return form.cron_custom.trim()
  }
}

function parseCronToForm(expr: string): Pick<JobForm, "cron_preset" | "cron_hour" | "cron_minute" | "cron_weekdays" | "cron_month_day" | "cron_custom"> {
  const blank = { cron_preset: "daily" as CronPreset, cron_hour: "9", cron_minute: "0", cron_weekdays: [], cron_month_day: "1", cron_custom: "" }
  if (!expr) return blank
  const parts = expr.split(" ")
  if (parts.length !== 5) return { ...blank, cron_preset: "custom", cron_custom: expr }
  const [minute, hour, dom, month, dow] = parts
  if (dom === "*" && month === "*" && dow === "*")
    return { cron_preset: "daily", cron_hour: hour, cron_minute: minute, cron_weekdays: [], cron_month_day: "1", cron_custom: expr }
  if (dom === "*" && month === "*" && dow !== "*")
    return { cron_preset: "weekly", cron_hour: hour, cron_minute: minute, cron_weekdays: dow.split(","), cron_month_day: "1", cron_custom: expr }
  if (dom !== "*" && month === "*" && dow === "*")
    return { cron_preset: "monthly", cron_hour: hour, cron_minute: minute, cron_weekdays: [], cron_month_day: dom, cron_custom: expr }
  return { cron_preset: "custom", cron_hour: hour, cron_minute: minute, cron_weekdays: [], cron_month_day: "1", cron_custom: expr }
}

const emptyForm = (): JobForm => ({
  function_key: "",
  label: "",
  schedule_type: "recurring",
  cron_preset: "daily",
  cron_hour: "9",
  cron_minute: "0",
  cron_weekdays: [],
  cron_month_day: "1",
  cron_custom: "",
  run_at: "",
  enabled: true,
})

function CronBuilder({ form, setForm }: { form: JobForm; setForm: React.Dispatch<React.SetStateAction<JobForm>> }) {
  const { t } = useTranslation()

  const setField = (key: keyof JobForm) => (val: any) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleWeekday = (val: string) =>
    setForm((f) => ({
      ...f,
      cron_weekdays: f.cron_weekdays.includes(val)
        ? f.cron_weekdays.filter((d) => d !== val)
        : [...f.cron_weekdays, val],
    }))

  const preview = buildCronExpression(form)

  return (
    <div className="flex flex-col gap-y-4">
      {/* Preset selector */}
      <div className="flex flex-col gap-y-2">
        <Label>{t("scheduledJobs.form.frequency")}</Label>
        <div className="flex gap-x-2 flex-wrap">
          {(["daily", "weekly", "monthly", "custom"] as CronPreset[]).map((p) => (
            <Button
              key={p}
              size="small"
              variant={form.cron_preset === p ? "primary" : "secondary"}
              onClick={() => setField("cron_preset")(p)}
            >
              {t(`scheduledJobs.form.presets.${p}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Time picker — shown for daily / weekly / monthly */}
      {form.cron_preset !== "custom" && (
        <div className="flex flex-col gap-y-2">
          <Label>{t("scheduledJobs.form.time")}</Label>
          <div className="flex items-center gap-x-2">
            <Select value={form.cron_hour} onValueChange={setField("cron_hour")}>
              <Select.Trigger className="w-24">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {HOURS.map((h) => (
                  <Select.Item key={h} value={h}>{pad(h)}h</Select.Item>
                ))}
              </Select.Content>
            </Select>
            <span className="text-ui-fg-subtle font-medium">:</span>
            <Select value={form.cron_minute} onValueChange={setField("cron_minute")}>
              <Select.Trigger className="w-24">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {MINUTES.map((m) => (
                  <Select.Item key={m} value={m}>{pad(m)}m</Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
      )}

      {/* Weekly: day-of-week picker */}
      {form.cron_preset === "weekly" && (
        <div className="flex flex-col gap-y-2">
          <Label>{t("scheduledJobs.form.daysOfWeek")}</Label>
          <div className="flex gap-x-1 flex-wrap gap-y-1">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                className={[
                  "h-8 w-10 rounded text-sm font-medium transition-colors border",
                  form.cron_weekdays.includes(d.value)
                    ? "bg-ui-button-inverted text-ui-fg-on-color border-ui-button-inverted"
                    : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:bg-ui-bg-base-hover",
                ].join(" ")}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly: day-of-month picker */}
      {form.cron_preset === "monthly" && (
        <div className="flex flex-col gap-y-2">
          <Label>{t("scheduledJobs.form.dayOfMonth")}</Label>
          <Select value={form.cron_month_day} onValueChange={setField("cron_month_day")}>
            <Select.Trigger className="w-32">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {MONTH_DAYS.map((d) => (
                <Select.Item key={d} value={d}>
                  {t("scheduledJobs.form.dayOrdinal", { day: d })}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )}

      {/* Custom: raw expression */}
      {form.cron_preset === "custom" && (
        <div className="flex flex-col gap-y-2">
          <Label>{t("scheduledJobs.form.cronExpression")}</Label>
          <Input
            value={form.cron_custom}
            onChange={(e) => setField("cron_custom")(e.target.value)}
            placeholder="0 9 * * 1-5"
          />
          <Text size="small" className="text-ui-fg-subtle">
            {t("scheduledJobs.form.cronHint")}
          </Text>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="rounded-md bg-ui-bg-subtle border border-ui-border-base px-3 py-2">
          <Text size="small" className="text-ui-fg-muted">
            {t("scheduledJobs.form.preview")}{" "}
            <span className="font-mono text-ui-fg-base">{preview}</span>
          </Text>
        </div>
      )}
    </div>
  )
}

function JobFormModal({
  job,
  onClose,
  onSaved,
}: {
  job: ScheduledJob | null
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<JobForm>(() => {
    if (!job) return emptyForm()
    const cronParsed = parseCronToForm(job.cron_expression ?? "")
    return {
      function_key: job.function_key,
      label: job.label ?? "",
      schedule_type: job.schedule_type,
      ...cronParsed,
      run_at: toDatetimeLocal(job.run_at),
      enabled: job.enabled,
    }
  })
  const [saving, setSaving] = useState(false)

  const set = (key: keyof JobForm) => (val: any) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.function_key) {
      toast.error(t("scheduledJobs.toast.validationError"))
      return
    }
    if (form.schedule_type === "recurring") {
      if (form.cron_preset === "weekly" && form.cron_weekdays.length === 0) {
        toast.error(t("scheduledJobs.toast.noWeekdays"))
        return
      }
      if (form.cron_preset === "custom" && !form.cron_custom.trim()) {
        toast.error(t("scheduledJobs.toast.validationError"))
        return
      }
    }
    if (form.schedule_type === "once" && !form.run_at) {
      toast.error(t("scheduledJobs.toast.validationError"))
      return
    }

    setSaving(true)
    try {
      const payload = {
        function_key: form.function_key,
        label: form.label.trim() || null,
        schedule_type: form.schedule_type,
        cron_expression: form.schedule_type === "recurring" ? buildCronExpression(form) : null,
        run_at: form.schedule_type === "once" ? new Date(form.run_at).toISOString() : null,
        enabled: form.enabled,
      }

      if (job) {
        await adminFetch(`/admin/scheduled-jobs/${job.id}`, { method: "POST", body: JSON.stringify(payload) })
        toast.success(t("scheduledJobs.toast.updated"))
      } else {
        await adminFetch("/admin/scheduled-jobs", { method: "POST", body: JSON.stringify(payload) })
        toast.success(t("scheduledJobs.toast.created"))
      }
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? t("scheduledJobs.toast.saveError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal open onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button onClick={handleSubmit} isLoading={saving}>
            {t("common.save")}
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center overflow-y-auto py-10">
          <div className="flex w-full max-w-lg flex-col gap-y-6">
            <Heading>{job ? t("scheduledJobs.editTitle") : t("scheduledJobs.newTitle")}</Heading>

            <div className="flex flex-col gap-y-2">
              <Label>{t("scheduledJobs.form.function")}</Label>
              <Select value={form.function_key} onValueChange={set("function_key")}>
                <Select.Trigger>
                  <Select.Value placeholder={t("scheduledJobs.form.functionPlaceholder")} />
                </Select.Trigger>
                <Select.Content>
                  {FUNCTION_OPTIONS.map((opt) => (
                    <Select.Item key={opt.key} value={opt.key}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("scheduledJobs.form.label")}</Label>
              <Input
                value={form.label}
                onChange={(e) => set("label")(e.target.value)}
                placeholder={t("scheduledJobs.form.labelPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("scheduledJobs.form.scheduleType")}</Label>
              <div className="flex gap-x-2">
                <Button
                  size="small"
                  variant={form.schedule_type === "recurring" ? "primary" : "secondary"}
                  onClick={() => set("schedule_type")("recurring")}
                >
                  {t("scheduledJobs.form.recurring")}
                </Button>
                <Button
                  size="small"
                  variant={form.schedule_type === "once" ? "primary" : "secondary"}
                  onClick={() => set("schedule_type")("once")}
                >
                  {t("scheduledJobs.form.once")}
                </Button>
              </div>
            </div>

            {form.schedule_type === "recurring" && (
              <CronBuilder form={form} setForm={setForm} />
            )}

            {form.schedule_type === "once" && (
              <div className="flex flex-col gap-y-2">
                <Label>{t("scheduledJobs.form.runAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.run_at}
                  onChange={(e) => set("run_at")(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>{t("scheduledJobs.form.enabled")}</Label>
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => set("enabled")(v)}
              />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

function LogPanel({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<ScheduledJobLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetch(`/admin/scheduled-jobs/${jobId}/logs?limit=10`)
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => toast.error(t("scheduledJobs.toast.loadError")))
      .finally(() => setLoading(false))
  }, [jobId])

  return (
    <div className="border-t bg-ui-bg-subtle px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <Text weight="plus" size="small">{t("scheduledJobs.logs.title")}</Text>
        <button onClick={onClose} className="text-ui-fg-muted hover:text-ui-fg-base text-sm">✕</button>
      </div>
      {loading ? (
        <Text size="small" className="text-ui-fg-muted">{t("common.loading")}</Text>
      ) : logs.length === 0 ? (
        <Text size="small" className="text-ui-fg-muted">{t("scheduledJobs.logs.empty")}</Text>
      ) : (
        <div className="flex flex-col gap-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-x-3 text-sm">
              <Badge
                color={log.status === "success" ? "green" : "red"}
                size="2xsmall"
                className="mt-0.5 shrink-0"
              >
                {t(`scheduledJobs.runStatuses.${log.status}`)}
              </Badge>
              <span className="text-ui-fg-subtle shrink-0">{formatDate(log.ran_at)}</span>
              {log.error_message && (
                <span className="text-ui-fg-muted truncate">{log.error_message}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ScheduledJobsPage = () => {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<ScheduledJob | null | "new">(null)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  const loadJobs = () => {
    setLoading(true)
    adminFetch("/admin/scheduled-jobs")
      .then((d) => {
        const all: ScheduledJob[] = d.jobs ?? []
        all.sort((a, b) => (b.is_system ? 1 : 0) - (a.is_system ? 1 : 0))
        setJobs(all)
      })
      .catch(() => toast.error(t("scheduledJobs.toast.loadError")))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadJobs() }, [])

  const handleDelete = async (job: ScheduledJob) => {
    const label = job.label || FUNCTION_OPTIONS.find((o) => o.key === job.function_key)?.label || job.function_key
    if (!confirm(t("scheduledJobs.deleteConfirm", { label }))) return
    try {
      await adminFetch(`/admin/scheduled-jobs/${job.id}`, { method: "DELETE" })
      toast.success(t("scheduledJobs.toast.deleted"))
      loadJobs()
    } catch {
      toast.error(t("scheduledJobs.toast.deleteError"))
    }
  }

  const handleRunNow = async (job: ScheduledJob) => {
    setRunningId(job.id)
    try {
      await adminFetch(`/admin/scheduled-jobs/${job.id}/run`, { method: "POST" })
      toast.success(t("scheduledJobs.toast.runSuccess"))
      loadJobs()
    } catch (e: any) {
      toast.error(e?.message ?? t("scheduledJobs.toast.runError"))
    } finally {
      setRunningId(null)
    }
  }

  const getFunctionLabel = (key: string) =>
    FUNCTION_OPTIONS.find((o) => o.key === key)?.label ?? key

  const getScheduleDisplay = (job: ScheduledJob) => {
    if (job.schedule_type === "recurring") return job.cron_expression ?? "—"
    return formatDate(job.run_at)
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>{t("scheduledJobs.title")}</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          {t("scheduledJobs.add")}
        </Button>
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("common.loading")}</p>
      ) : jobs.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("scheduledJobs.empty")}</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("scheduledJobs.table.function")}</Table.HeaderCell>
              <Table.HeaderCell>{t("scheduledJobs.table.schedule")}</Table.HeaderCell>
              <Table.HeaderCell>{t("scheduledJobs.table.type")}</Table.HeaderCell>
              <Table.HeaderCell>{t("scheduledJobs.table.enabled")}</Table.HeaderCell>
              <Table.HeaderCell>{t("scheduledJobs.table.lastRun")}</Table.HeaderCell>
              <Table.HeaderCell>{t("scheduledJobs.table.status")}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {jobs.map((job) => (
              <>
                <Table.Row
                  key={job.id}
                  className="cursor-pointer"
                  onClick={() => setExpandedLogId(expandedLogId === job.id ? null : job.id)}
                >
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Text weight="plus">{getFunctionLabel(job.function_key)}</Text>
                      {job.label && (
                        <Text size="small" className="text-ui-fg-subtle">{job.label}</Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-sm text-ui-fg-subtle">
                      {getScheduleDisplay(job)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-x-1">
                      <Badge color={job.is_system ? "purple" : "grey"} size="2xsmall">
                        {t(job.is_system ? "scheduledJobs.jobTypes.system" : "scheduledJobs.jobTypes.manual")}
                      </Badge>
                      <Badge color={job.schedule_type === "recurring" ? "blue" : "orange"} size="2xsmall">
                        {t(`scheduledJobs.types.${job.schedule_type}`)}
                      </Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Checkbox checked={job.enabled} disabled />
                  </Table.Cell>
                  <Table.Cell className="text-ui-fg-subtle">
                    {formatDate(job.last_run_at)}
                  </Table.Cell>
                  <Table.Cell>
                    {job.last_run_status ? (
                      <Badge
                        color={job.last_run_status === "success" ? "green" : "red"}
                        size="2xsmall"
                      >
                        {t(`scheduledJobs.runStatuses.${job.last_run_status}`)}
                      </Badge>
                    ) : (
                      <span className="text-ui-fg-muted text-sm">
                        {t("scheduledJobs.runStatuses.never")}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-x-2">
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={runningId === job.id}
                        onClick={() => handleRunNow(job)}
                      >
                        {t("scheduledJobs.runNow")}
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => setEditTarget(job)}
                      >
                        {t("common.edit")}
                      </Button>
                      {!job.is_system && (
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleDelete(job)}
                        >
                          {t("common.delete")}
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
                {expandedLogId === job.id && (
                  <Table.Row key={`${job.id}-logs`}>
                    <Table.Cell colSpan={7} className="p-0">
                      <LogPanel
                        jobId={job.id}
                        onClose={() => setExpandedLogId(null)}
                      />
                    </Table.Cell>
                  </Table.Row>
                )}
              </>
            ))}
          </Table.Body>
        </Table>
      )}

      {editTarget !== null && (
        <JobFormModal
          job={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadJobs}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Scheduled Jobs",
})

export default ScheduledJobsPage

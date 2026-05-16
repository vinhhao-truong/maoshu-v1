import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Table,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type SystemColor = { id: string; name: string; hex: string }

type ColorGroup = {
  id: string
  name: string
  primary: string | null
  secondary: string | null
  inverse: string | null
  neutral: string | null
  success: string | null
  warning: string | null
  danger: string | null
  info: string | null
}

const COLOR_ROLES = [
  "primary",
  "secondary",
  "inverse",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
] as const
type ColorRole = (typeof COLOR_ROLES)[number]

const ROLE_LABELS: Record<ColorRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
  inverse: "Inverse",
  neutral: "Neutral",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
}

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

type GroupForm = { name: string } & Record<ColorRole, string>

const emptyForm = (): GroupForm => ({
  name: "",
  primary: "",
  secondary: "",
  inverse: "",
  neutral: "",
  success: "",
  warning: "",
  danger: "",
  info: "",
})

function ColorSwatch({ colorId, colorById }: { colorId: string | null; colorById: Record<string, SystemColor> }) {
  if (!colorId || !colorById[colorId]) return <span className="text-ui-fg-muted">—</span>
  const color = colorById[colorId]
  return (
    <div className="flex items-center gap-x-2">
      <div
        className="h-4 w-4 shrink-0 rounded-sm border border-ui-border-base"
        style={{ backgroundColor: color.hex }}
      />
      <span className="txt-small text-ui-fg-subtle">{color.name}</span>
    </div>
  )
}

function GroupFormModal({
  group,
  systemColors,
  onClose,
  onSaved,
}: {
  group: ColorGroup | null
  systemColors: SystemColor[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<GroupForm>(
    group
      ? {
          name: group.name,
          primary: group.primary ?? "",
          secondary: group.secondary ?? "",
          inverse: group.inverse ?? "",
          neutral: group.neutral ?? "",
          success: group.success ?? "",
          warning: group.warning ?? "",
          danger: group.danger ?? "",
          info: group.info ?? "",
        }
      : emptyForm()
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        ...Object.fromEntries(
          COLOR_ROLES.map((r) => [r, form[r] || null])
        ),
      }
      if (group) {
        await adminFetch(`/admin/color-groups/${group.id}`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Color group updated")
      } else {
        await adminFetch("/admin/color-groups", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Color group created")
      }
      onSaved()
      onClose()
    } catch {
      toast.error("Failed to save color group")
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal open onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button onClick={handleSubmit} isLoading={saving}>
            Save
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-10">
          <div className="flex w-full max-w-lg flex-col gap-y-6">
            <Heading>{group ? "Edit Color Group" : "New Color Group"}</Heading>

            <div className="flex flex-col gap-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Default Theme"
              />
            </div>

            {COLOR_ROLES.map((role) => (
              <div key={role} className="flex flex-col gap-y-2">
                <Label>{ROLE_LABELS[role]}</Label>
                <Select
                  value={form[role] || "__none__"}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, [role]: val === "__none__" ? "" : val }))
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="None" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="__none__">None</Select.Item>
                    {systemColors.map((c) => (
                      <Select.Item key={c.id} value={c.id}>
                        <div className="flex items-center gap-x-2">
                          <div
                            className="h-3 w-3 shrink-0 rounded-sm border border-ui-border-base"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                          <span className="font-mono text-ui-fg-muted">
                            {c.hex}
                          </span>
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            ))}
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const ColorGroupsPage = () => {
  const [groups, setGroups] = useState<ColorGroup[]>([])
  const [systemColors, setSystemColors] = useState<SystemColor[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<ColorGroup | null | "new">(null)

  const colorById: Record<string, SystemColor> = Object.fromEntries(
    systemColors.map((c) => [c.id, c])
  )

  const load = () => {
    setLoading(true)
    Promise.all([
      adminFetch("/admin/color-groups"),
      adminFetch("/admin/system-colors"),
    ])
      .then(([groupsData, colorsData]) => {
        setGroups(groupsData.color_groups ?? [])
        setSystemColors(colorsData.system_colors ?? [])
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (group: ColorGroup) => {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return
    try {
      await adminFetch(`/admin/color-groups/${group.id}`, { method: "DELETE" })
      toast.success("Color group deleted")
      load()
    } catch {
      toast.error("Failed to delete color group")
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>Color Groups</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          Add Group
        </Button>
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">
          No color groups yet. Click "Add Group" to get started.
        </p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              {COLOR_ROLES.map((r) => (
                <Table.HeaderCell key={r}>{ROLE_LABELS[r]}</Table.HeaderCell>
              ))}
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groups.map((group) => (
              <Table.Row key={group.id}>
                <Table.Cell className="font-medium">{group.name}</Table.Cell>
                {COLOR_ROLES.map((r) => (
                  <Table.Cell key={r}>
                    <ColorSwatch colorId={group[r]} colorById={colorById} />
                  </Table.Cell>
                ))}
                <Table.Cell>
                  <div className="flex justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditTarget(group)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(group)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {editTarget !== null && (
        <GroupFormModal
          group={editTarget === "new" ? null : editTarget}
          systemColors={systemColors}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Color Groups",
})

export default ColorGroupsPage

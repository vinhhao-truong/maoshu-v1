import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Table,
  toast,
} from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type SystemColor = {
  id: string
  name: string
  hex: string
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

type ColorForm = { name: string; hex: string }

const emptyForm = (): ColorForm => ({ name: "", hex: "#000000" })

function ColorFormModal({
  color,
  onClose,
  onSaved,
}: {
  color: SystemColor | null
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ColorForm>(
    color ? { name: color.name, hex: color.hex } : emptyForm()
  )
  const [saving, setSaving] = useState(false)
  const pickerRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.hex.trim()) {
      toast.error(t("systemColors.toast.validationError"))
      return
    }
    setSaving(true)
    try {
      if (color) {
        await adminFetch(`/admin/system-colors/${color.id}`, {
          method: "POST",
          body: JSON.stringify(form),
        })
        toast.success(t("systemColors.toast.updated"))
      } else {
        await adminFetch("/admin/system-colors", {
          method: "POST",
          body: JSON.stringify(form),
        })
        toast.success(t("systemColors.toast.created"))
      }
      onSaved()
      onClose()
    } catch {
      toast.error(t("systemColors.toast.saveError"))
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
        <FocusModal.Body className="flex flex-col items-center py-10">
          <div className="flex w-full max-w-lg flex-col gap-y-6">
            <Heading>{color ? t("systemColors.editTitle") : t("systemColors.newTitle")}</Heading>

            <div className="flex flex-col gap-y-2">
              <Label>{t("common.name")} *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Ocean Blue"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("systemColors.hex")} *</Label>
              <div className="flex items-center gap-x-3">
                <button
                  type="button"
                  className="h-10 w-10 shrink-0 rounded-md border border-ui-border-base shadow-sm"
                  style={{ backgroundColor: form.hex }}
                  onClick={() => pickerRef.current?.click()}
                />
                <input
                  ref={pickerRef}
                  type="color"
                  className="sr-only"
                  value={form.hex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hex: e.target.value }))
                  }
                />
                <Input
                  value={form.hex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hex: e.target.value }))
                  }
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const SystemColorsPage = () => {
  const { t } = useTranslation()
  const [colors, setColors] = useState<SystemColor[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<SystemColor | null | "new">(null)

  const load = () => {
    setLoading(true)
    adminFetch("/admin/system-colors")
      .then((d) => setColors(d.system_colors ?? []))
      .catch(() => toast.error(t("systemColors.toast.loadError")))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (color: SystemColor) => {
    if (!confirm(t("systemColors.deleteConfirm", { name: color.name }))) return
    try {
      await adminFetch(`/admin/system-colors/${color.id}`, { method: "DELETE" })
      toast.success(t("systemColors.toast.deleted"))
      load()
    } catch {
      toast.error(t("systemColors.toast.deleteError"))
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>{t("systemColors.title")}</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          {t("systemColors.add")}
        </Button>
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("common.loading")}</p>
      ) : colors.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("systemColors.empty")}</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("systemColors.color")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.name")}</Table.HeaderCell>
              <Table.HeaderCell>{t("systemColors.hex")}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {colors.map((color) => (
              <Table.Row key={color.id}>
                <Table.Cell>
                  <div
                    className="h-6 w-6 rounded-md border border-ui-border-base shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                </Table.Cell>
                <Table.Cell>{color.name}</Table.Cell>
                <Table.Cell className="font-mono text-ui-fg-subtle">
                  {color.hex}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditTarget(color)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(color)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {editTarget !== null && (
        <ColorFormModal
          color={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "System Colors",
})

export default SystemColorsPage

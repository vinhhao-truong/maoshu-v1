import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Select, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ColorGroup = { id: string; name: string }

type CategoryData = {
  id: string
  metadata: Record<string, any> | null
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

const CategoryColorGroupWidget = ({ data }: { data: CategoryData }) => {
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([])
  const [selected, setSelected] = useState<string>("__none__")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch("/admin/color-groups")
      .then((d) => {
        setColorGroups(d.color_groups ?? [])
        const current = data.metadata?.color_group_id
        setSelected(current ?? "__none__")
      })
      .catch(() => toast.error("Failed to load color groups"))
      .finally(() => setLoading(false))
  }, [data.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const newMetadata = {
        ...(data.metadata ?? {}),
        color_group_id: selected === "__none__" ? null : selected,
      }
      await adminFetch(`/admin/product-categories/${data.id}`, {
        method: "POST",
        body: JSON.stringify({ metadata: newMetadata }),
      })
      toast.success("Color group saved")
    } catch {
      toast.error("Failed to save color group")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-3 font-medium uppercase tracking-wider">
        Color Group
      </p>
      {loading ? (
        <p className="txt-small text-ui-fg-muted">Loading…</p>
      ) : (
        <>
          <Select value={selected} onValueChange={setSelected}>
            <Select.Trigger>
              <Select.Value placeholder="Select a color group…" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__none__">None</Select.Item>
              {colorGroups.map((g) => (
                <Select.Item key={g.id} value={g.id}>
                  {g.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button
            className="mt-3 w-full"
            size="small"
            variant="secondary"
            onClick={handleSave}
            isLoading={saving}
          >
            Save
          </Button>
        </>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.side.before",
})

export default CategoryColorGroupWidget

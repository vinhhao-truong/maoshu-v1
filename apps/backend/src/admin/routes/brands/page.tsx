import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Checkbox,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Brand = {
  id: string
  name: string
  handle: string
  description: string | null
  logo_url: string | null
  is_active: boolean
}

type BrandForm = {
  name: string
  handle: string
  description: string
  logo_url: string
  is_active: boolean
}

const BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const emptyForm = (): BrandForm => ({
  name: "",
  handle: "",
  description: "",
  logo_url: "",
  is_active: true,
})

function BrandFormModal({
  brand,
  onClose,
  onSaved,
}: {
  brand: Brand | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<BrandForm>(
    brand
      ? {
          name: brand.name,
          handle: brand.handle,
          description: brand.description ?? "",
          logo_url: brand.logo_url ?? "",
          is_active: brand.is_active,
        }
      : emptyForm()
  )
  const [saving, setSaving] = useState(false)

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      handle: brand ? f.handle : slugify(name),
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.handle.trim()) {
      toast.error("Name and handle are required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        handle: form.handle.trim(),
        description: form.description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        is_active: form.is_active,
      }
      if (brand) {
        await adminFetch(`/admin/brands/${brand.id}`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Brand updated")
      } else {
        await adminFetch("/admin/brands", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Brand created")
      }
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save brand")
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
            <Heading>{brand ? "Edit Brand" : "New Brand"}</Heading>

            <div className="flex flex-col gap-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Nike"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Handle *</Label>
              <Input
                value={form.handle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, handle: e.target.value }))
                }
                placeholder="e.g. nike"
              />
              <Text size="small" className="text-ui-fg-subtle">
                Used in URLs. Auto-generated from name.
              </Text>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Logo URL</Label>
              <Input
                value={form.logo_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, logo_url: e.target.value }))
                }
                placeholder="https://…"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Brand | null | "new">(null)

  const loadBrands = () => {
    setLoading(true)
    adminFetch("/admin/brands")
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => toast.error("Failed to load brands"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) return
    try {
      await adminFetch(`/admin/brands/${brand.id}`, { method: "DELETE" })
      toast.success("Brand deleted")
      loadBrands()
    } catch {
      toast.error("Failed to delete brand")
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>Brands</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          Add Brand
        </Button>
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">Loading…</p>
      ) : brands.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">
          No brands yet. Click "Add Brand" to get started.
        </p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Active</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {brands.map((brand) => (
              <Table.Row key={brand.id}>
                <Table.Cell>{brand.name}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {brand.handle}
                </Table.Cell>
                <Table.Cell>
                  <Checkbox checked={brand.is_active} disabled />
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditTarget(brand)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(brand)}
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
        <BrandFormModal
          brand={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadBrands}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsPage

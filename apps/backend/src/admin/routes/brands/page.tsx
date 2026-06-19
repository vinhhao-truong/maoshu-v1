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
import { useTranslation } from "react-i18next"

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

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
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
  const { t } = useTranslation()
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
      toast.error(t("brands.toast.validationError"))
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
        toast.success(t("brands.toast.updated"))
      } else {
        await adminFetch("/admin/brands", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success(t("brands.toast.created"))
      }
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? t("brands.toast.saveError"))
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
            <Heading>{brand ? t("brands.editTitle") : t("brands.newTitle")}</Heading>

            <div className="flex flex-col gap-y-2">
              <Label>{t("common.name")} *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t("brands.namePlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("common.handle")} *</Label>
              <Input
                value={form.handle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, handle: e.target.value }))
                }
                placeholder={t("brands.handlePlaceholder")}
              />
              <Text size="small" className="text-ui-fg-subtle">
                {t("brands.handleHint")}
              </Text>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("brands.description")}</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder={t("brands.descriptionPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>{t("brands.logoUrl")}</Label>
              <Input
                value={form.logo_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, logo_url: e.target.value }))
                }
                placeholder="https://…"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("common.active")}</Label>
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
  const { t } = useTranslation()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Brand | null | "new">(null)

  const loadBrands = () => {
    setLoading(true)
    adminFetch("/admin/brands")
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => toast.error(t("brands.toast.loadError")))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const handleDelete = async (brand: Brand) => {
    if (!confirm(t("brands.deleteConfirm", { name: brand.name }))) return
    try {
      await adminFetch(`/admin/brands/${brand.id}`, { method: "DELETE" })
      toast.success(t("brands.toast.deleted"))
      loadBrands()
    } catch {
      toast.error(t("brands.toast.deleteError"))
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>{t("brands.title")}</Heading>
        <Button size="small" onClick={() => setEditTarget("new")}>
          {t("brands.add")}
        </Button>
      </div>

      {loading ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("common.loading")}</p>
      ) : brands.length === 0 ? (
        <p className="px-6 py-4 text-ui-fg-muted">{t("brands.empty")}</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("common.name")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.handle")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.active")}</Table.HeaderCell>
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
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(brand)}
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

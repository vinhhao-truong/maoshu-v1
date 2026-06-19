import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Select, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type Brand = {
  id: string
  name: string
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

const ProductBrandWidget = ({ data }: { data: { id: string } }) => {
  const { t } = useTranslation()
  const productId = data.id
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentBrandId, setCurrentBrandId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminFetch("/admin/brands"),
      adminFetch(`/admin/products/${productId}/brand`),
    ])
      .then(([brandsData, brandData]) => {
        setBrands(brandsData.brands ?? [])
        setCurrentBrandId(brandData.brand?.id ?? "__none__")
      })
      .catch(() => toast.error(t("productBrand.toast.loadError")))
      .finally(() => setLoading(false))
  }, [productId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminFetch(`/admin/products/${productId}/brand`, {
        method: "POST",
        body: JSON.stringify({
          brand_id: currentBrandId === "__none__" ? null : currentBrandId,
        }),
      })
      toast.success(t("productBrand.toast.updated"))
    } catch {
      toast.error(t("productBrand.toast.updateError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-3 font-medium uppercase tracking-wider">
        {t("productBrand.title")}
      </p>
      {loading ? (
        <p className="text-ui-fg-muted txt-small">{t("common.loading")}</p>
      ) : (
        <>
          <Select value={currentBrandId} onValueChange={setCurrentBrandId}>
            <Select.Trigger>
              <Select.Value placeholder={t("productBrand.selectPlaceholder")} />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__none__">{t("common.none")}</Select.Item>
              {brands
                .filter((b) => b.is_active)
                .map((b) => (
                  <Select.Item key={b.id} value={b.id}>
                    {b.name}
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
            {t("common.save")}
          </Button>
        </>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductBrandWidget

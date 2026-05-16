import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Select, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Brand = {
  id: string
  name: string
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

const ProductBrandWidget = ({ data }: { data: { id: string } }) => {
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
      .catch(() => toast.error("Failed to load brand data"))
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
      toast.success("Brand updated")
    } catch {
      toast.error("Failed to update brand")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-3 font-medium uppercase tracking-wider">
        Brand
      </p>
      {loading ? (
        <p className="text-ui-fg-muted txt-small">Loading…</p>
      ) : (
        <>
          <Select value={currentBrandId} onValueChange={setCurrentBrandId}>
            <Select.Trigger>
              <Select.Value placeholder="Select a brand…" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__none__">None</Select.Item>
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
            Save
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

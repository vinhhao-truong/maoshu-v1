import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Input, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

type Variant = { id: string; title: string; sku: string | null }

const ProductVariantCostWidget = ({ data }: { data: { id: string } }) => {
  const { t } = useTranslation()
  const productId = data.id
  const [variants, setVariants] = useState<Variant[]>([])
  const [costs, setCosts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch(`/admin/products/${productId}/variant-costs`)
      .then(({ variants, costs: rawCosts }) => {
        setVariants(variants ?? [])
        const costMap: Record<string, string> = {}
        for (const c of rawCosts ?? []) {
          costMap[c.variant_id] = c.cost != null ? String(c.cost) : ""
        }
        setCosts(costMap)
      })
      .catch((err) => toast.error(t("variantCosts.toast.loadError", { message: err.message })))
      .finally(() => setLoading(false))
  }, [productId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminFetch(`/admin/products/${productId}/variant-costs`, {
        method: "POST",
        body: JSON.stringify({
          costs: variants.map((v) => ({
            variant_id: v.id,
            cost: costs[v.id] !== "" && costs[v.id] != null
              ? Number(costs[v.id])
              : null,
          })),
        }),
      })
      toast.success(t("variantCosts.toast.saved"))
    } catch (err: any) {
      toast.error(t("variantCosts.toast.saveError", { message: err.message }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <div className="flex items-center justify-between mb-3">
        <p className="txt-compact-small-plus text-ui-fg-subtle font-medium uppercase tracking-wider">
          {t("variantCosts.title")}
        </p>
        <Button
          size="small"
          variant="secondary"
          onClick={handleSave}
          isLoading={saving}
          disabled={loading || variants.length === 0}
        >
          {t("common.save")}
        </Button>
      </div>

      {loading ? (
        <p className="text-ui-fg-muted txt-small">{t("common.loading")}</p>
      ) : variants.length === 0 ? (
        <p className="text-ui-fg-muted txt-small">{t("variantCosts.noVariants")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="txt-small truncate">{v.title}</p>
                {v.sku && (
                  <p className="txt-small text-ui-fg-subtle truncate">{v.sku}</p>
                )}
              </div>
              <Input
                type="number"
                min={0}
                step="any"
                value={costs[v.id] ?? ""}
                onChange={(e) =>
                  setCosts((prev) => ({ ...prev, [v.id]: e.target.value }))
                }
                placeholder="0"
                className="w-28 shrink-0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductVariantCostWidget

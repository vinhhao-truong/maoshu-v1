import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type ProductStat = {
  weekly_selling_amount: number
  weekly_view_amount: number
  total_sell_amount: number
  total_view_amount: number
}

const BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

async function adminFetch(path: string) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

const ProductStatsWidget = ({ data }: { data: { id: string } }) => {
  const { t } = useTranslation()
  const [stat, setStat] = useState<ProductStat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetch(`/admin/product-stats/${data.id}`)
      .then((d) => setStat(d.stat))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [data.id])

  const rows = stat
    ? [
        { label: t("productStats.weeklySelling"), value: stat.weekly_selling_amount },
        { label: t("productStats.weeklyView"),    value: stat.weekly_view_amount },
        { label: t("productStats.totalSell"),     value: stat.total_sell_amount },
        { label: t("productStats.totalView"),     value: stat.total_view_amount },
      ]
    : []

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-3 font-medium uppercase tracking-wider">
        {t("productStats.title")}
      </p>
      {loading ? (
        <p className="txt-small text-ui-fg-muted">{t("common.loading")}</p>
      ) : (
        <div className="flex flex-col gap-y-2">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="txt-compact-small text-ui-fg-subtle">{label}</span>
              <span className="txt-compact-small-plus font-mono text-ui-fg-base">
                {value.toLocaleString()}
              </span>
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

export default ProductStatsWidget

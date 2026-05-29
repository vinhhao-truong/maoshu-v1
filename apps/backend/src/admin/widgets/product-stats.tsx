import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type ProductStat = {
  weekly_selling_amount: number
  weekly_view_amount: number
  monthly_selling_amount: number
  monthly_view_amount: number
  annual_selling_amount: number
  annual_view_amount: number
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

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="txt-compact-small text-ui-fg-subtle">{label}</span>
      <span className="txt-compact-small-plus font-mono text-ui-fg-base">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function StatSection({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <div className="flex flex-col gap-y-1.5">
      <p className="txt-compact-xsmall text-ui-fg-muted uppercase tracking-wider font-medium">{title}</p>
      {rows.map(({ label, value }) => (
        <StatRow key={label} label={label} value={value} />
      ))}
    </div>
  )
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

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-4 font-medium uppercase tracking-wider">
        {t("productStats.title")}
      </p>
      {loading ? (
        <p className="txt-small text-ui-fg-muted">{t("common.loading")}</p>
      ) : stat ? (
        <div className="flex flex-col gap-y-4">
          <StatSection
            title={t("productStats.weekly")}
            rows={[
              { label: t("productStats.sold"), value: stat.weekly_selling_amount },
              { label: t("productStats.views"), value: stat.weekly_view_amount },
            ]}
          />
          <div className="border-t border-ui-border-base" />
          <StatSection
            title={t("productStats.monthly")}
            rows={[
              { label: t("productStats.sold"), value: stat.monthly_selling_amount },
              { label: t("productStats.views"), value: stat.monthly_view_amount },
            ]}
          />
          <div className="border-t border-ui-border-base" />
          <StatSection
            title={t("productStats.annual")}
            rows={[
              { label: t("productStats.sold"), value: stat.annual_selling_amount },
              { label: t("productStats.views"), value: stat.annual_view_amount },
            ]}
          />
          <div className="border-t border-ui-border-base" />
          <StatSection
            title={t("productStats.allTime")}
            rows={[
              { label: t("productStats.sold"), value: stat.total_sell_amount },
              { label: t("productStats.views"), value: stat.total_view_amount },
            ]}
          />
        </div>
      ) : null}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductStatsWidget

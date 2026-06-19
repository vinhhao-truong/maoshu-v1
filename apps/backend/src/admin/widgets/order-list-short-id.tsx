import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

async function adminFetch(path: string) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

type Order = {
  id: string
  display_id: number
  created_at: string
  fulfillment_status: string
  shipping_address?: {
    first_name?: string
    last_name?: string
    phone?: string
  }
}

const OrderListShortIdWidget = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchOrders = () => {
    setLoading(true)
    adminFetch("/admin/orders?limit=100&fields=id,display_id,created_at,fulfillment_status,shipping_address")
      .then((data) => {
        const active = (data.orders ?? [])
          .filter((o: Order) => o.fulfillment_status !== "delivered")
          .sort((a: Order, b: Order) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        setOrders(active)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const shortId = (id: string) => `#${id.slice(-8).toUpperCase()}`

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase().replace(/^#/, "")
    if (!q) return orders
    return orders.filter((o) => o.id.slice(-8).toUpperCase().includes(q))
  }, [orders, search])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length === 1) {
      navigate(`/orders/${filtered[0].id}`)
    }
  }

  return (
    <div className="rounded-lg border bg-ui-bg-base shadow-elevation-card-rest mb-4 overflow-hidden">
      <div className="px-4 py-3 border-b bg-ui-bg-subtle flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <p className="txt-compact-small-plus font-medium text-ui-fg-subtle uppercase tracking-wider">
            {t("orderListShortId.title")}
          </p>
          <button
            onClick={fetchOrders}
            title="Refresh"
            className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
          >
            ↻
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={t("orderListShortId.searchPlaceholder")}
          className="w-48 rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1 txt-compact-small text-ui-fg-base placeholder:text-ui-fg-muted focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
        />
      </div>
      {loading ? (
        <p className="px-4 py-3 txt-small text-ui-fg-muted">{t("common.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-3 txt-small text-ui-fg-muted">
          {search ? t("orderListShortId.noMatch") : t("orderListShortId.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-ui-border-base sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex flex-col gap-0.5 bg-ui-bg-base px-3 py-2 text-left hover:bg-ui-bg-base-hover transition-colors"
            >
              <span className="font-mono font-semibold text-ui-fg-base txt-compact-small">
                {shortId(order.id)}
              </span>
              <span className="txt-compact-xsmall text-ui-fg-subtle">
                #{order.display_id} &middot; {new Date(order.created_at).toLocaleDateString()}
              </span>
              {(order.shipping_address?.first_name || order.shipping_address?.last_name) && (
                <span className="txt-compact-xsmall text-ui-fg-base truncate">
                  {[order.shipping_address.first_name, order.shipping_address.last_name].filter(Boolean).join(" ")}
                </span>
              )}
              {order.shipping_address?.phone && (
                <span className="txt-compact-xsmall text-ui-fg-subtle">
                  {order.shipping_address.phone}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default OrderListShortIdWidget

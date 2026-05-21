import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useTranslation } from "react-i18next"

const OrderShortIdWidget = ({ data }: { data: { id: string } }) => {
  const { t } = useTranslation()
  const shortId = `#${data.id.slice(-8).toUpperCase()}`

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest">
      <p className="txt-compact-small-plus text-ui-fg-subtle mb-1 font-medium uppercase tracking-wider">
        {t("orderShortId.title")}
      </p>
      <p className="txt-medium font-mono font-semibold text-ui-fg-base">
        {shortId}
      </p>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderShortIdWidget

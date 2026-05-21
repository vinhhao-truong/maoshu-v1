import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import { useLocale, useTranslations } from "next-intl"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const t = useTranslations("order")
  const locale = useLocale()

  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        {t("processingOrderPrefix")}{" "}
        <span className="text-ui-fg-medium-plus font-semibold">
          {order.shipping_address?.phone}
        </span>
        {t("processingOrderSuffix")}
      </Text>
      <Text className="mt-2">
        {t("orderDate")}:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        {t("orderNumber")}: <span data-testid="order-id">#{order.id.slice(-8).toUpperCase()}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {t("orderStatus")}:{" "}
              <span className="text-ui-fg-subtle" data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              {t("paymentStatus")}:{" "}
              <span
                className="text-ui-fg-subtle"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const [cart, customer, t] = await Promise.all([
    retrieveCart(),
    retrieveCustomer(),
    getTranslations("checkout"),
  ])

  if (!cart) {
    return notFound()
  }

  return (
    <div className="content-container py-12">
      <LocalizedClientLink
        href="/cart"
        className="text-small-semi text-ui-fg-base flex items-center gap-x-2 mb-6 w-fit"
        data-testid="back-to-cart-link"
      >
        <ChevronDown className="rotate-90" size={16} />
        <span className="hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
          {t("backToCart")}
        </span>
        <span className="block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
          {t("back")}
        </span>
      </LocalizedClientLink>
      <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] gap-x-40">
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </PaymentWrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}

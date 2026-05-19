import { Metadata } from "next"
import { cookies } from "next/headers"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { getBaseURL } from "@lib/util/env"
import { themeForCategory } from "@lib/util/theme"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import CategoryGuard from "@modules/layout/components/category-guard"
import ThemeSync from "@modules/layout/components/theme-sync"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  const categories = await listCategories({ limit: 100 })
  const rootCategories = (categories ?? []).filter((c) => !c.parent_category)
  const validIds = rootCategories.map((c) => c.id)

  const cookieStore = await cookies()
  const selectedCategoryId = cookieStore.get("selectedCategoryId")?.value
  const activeRoot = rootCategories.find((c) => c.id === selectedCategoryId)
  const theme = activeRoot ? themeForCategory(activeRoot) : undefined

  return (
    <div data-theme={theme}>
      <ThemeSync theme={theme} />
      <CategoryGuard validIds={validIds} countryCode={countryCode} />
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer categoryLogoUrl={activeRoot?.metadata?.logo_image as string | undefined} />
    </div>
  )
}

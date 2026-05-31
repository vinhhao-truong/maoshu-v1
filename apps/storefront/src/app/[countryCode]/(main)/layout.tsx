import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { getRootCategoryData } from "@lib/data/root-category"
import { getBaseURL } from "@lib/util/env"
import { buildCssVars } from "@lib/util/color-scale"
import { StoreCartShippingOption } from "@medusajs/types"

import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
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

  const selectedCategoryId = process.env.ROOT_CATEGORY_ID

  const [customer, cart, categories, rootCategoryData] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
    listCategories({ limit: 100 }),
    selectedCategoryId ? getRootCategoryData(selectedCategoryId) : null,
  ])

  let shippingOptions: StoreCartShippingOption[] = []
  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  const activeRoot = (categories ?? []).find((c) => c.id === selectedCategoryId)

  const cssVars = rootCategoryData?.color_group
    ? buildCssVars(rootCategoryData.color_group)
    : undefined

  return (
    <div>
      {cssVars && <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />}
      <ThemeSync cssVars={cssVars} />
      <Nav categories={categories ?? []} customer={customer} />
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
      <Footer
        categories={categories ?? []}
        categoryLogoUrl={activeRoot?.metadata?.logo_image as string | undefined}
        categoryName={activeRoot?.name}
        rootCategoryId={selectedCategoryId}
      />
    </div>
  )
}

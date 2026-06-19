import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { getRootCategoryData } from "@lib/data/root-category"
import { buildCssVars } from "@lib/util/color-scale"
import { StoreCartShippingOption } from "@medusajs/types"

import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import ThemeSync from "@modules/layout/components/theme-sync"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import Nav from "@modules/layout/templates/nav"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const cssVars = rootCategoryData?.color_group
    ? buildCssVars(rootCategoryData.color_group)
    : undefined

  return (
    <div className="w-full bg-white relative small:min-h-screen">
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
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}

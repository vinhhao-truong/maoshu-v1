import { Metadata } from "next"
import { cookies } from "next/headers"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { getCategoryColors } from "@lib/data/color-groups"
import { getBaseURL } from "@lib/util/env"
import { buildCssVars } from "@lib/util/color-scale"
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

  // Read selected category from cookie before parallel fetches so we can
  // include the color fetch in the same Promise.all — no sequential waterfall
  const cookieStore = await cookies()
  const selectedCategoryId = cookieStore.get("selectedCategoryId")?.value

  const [customer, cart, categories, colorGroup] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
    listCategories({ limit: 100 }),
    selectedCategoryId ? getCategoryColors(selectedCategoryId) : null,
  ])

  let shippingOptions: StoreCartShippingOption[] = []
  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  const rootCategories = (categories ?? []).filter((c) => !c.parent_category)
  const validIds = rootCategories.map((c) => c.id)
  const activeRoot = rootCategories.find((c) => c.id === selectedCategoryId)

  const cssVars = colorGroup ? buildCssVars(colorGroup) : undefined

  return (
    <div>
      {cssVars && <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />}
      <ThemeSync cssVars={cssVars} />
      <CategoryGuard validIds={validIds} countryCode={countryCode} />
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
      />
    </div>
  )
}

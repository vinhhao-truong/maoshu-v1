import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CategoryDropdown from "@modules/layout/components/category-dropdown"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"
import { getTranslations } from "next-intl/server"

export default async function Nav() {
  const [regions, locales, currentLocale, customer, t, allCategories, { collections }] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCustomer(),
    getTranslations("nav"),
    listCategories({ limit: 100 }),
    listCollections(),
  ])

  const topLevelCategories = (allCategories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                allCategories={allCategories ?? []}
                collections={collections ?? []}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-full gap-y-0.5">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase leading-none"
              data-testid="nav-store-link"
            >
              Maoshu
            </LocalizedClientLink>
            <CategoryDropdown categories={topLevelCategories} />
          </div>

          <div className="flex items-center h-full flex-1 basis-0">
            <div className="flex items-center gap-x-4 ml-auto">
            <SearchBar categories={allCategories ?? []} />
          <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex items-center"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-black text-white text-[9px] font-medium leading-none">
                      0
                    </span>
                  </div>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <div className="hidden small:flex items-center gap-x-6 h-full">
              {customer ? (
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  {customer.first_name
                    ? <div>
                      {t("greeting")}<b>{customer.first_name}</b>
                    </div>
                    : t("account")}
                </LocalizedClientLink>
              ) : (
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/account"
                  data-testid="nav-sign-in-link"
                >
                  {t("signIn")}
                </LocalizedClientLink>
              )}
            </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}

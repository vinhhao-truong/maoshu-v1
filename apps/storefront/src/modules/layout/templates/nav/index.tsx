import { Suspense } from "react"
import { cookies } from "next/headers"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"
import { getBusinessInfo } from "@lib/data/business-info"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CategoryDropdown from "@modules/layout/components/category-dropdown"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"
import SubNav from "@modules/layout/components/sub-nav"
import { getTranslations } from "next-intl/server"

export default async function Nav({
  categories,
  customer,
}: {
  categories: HttpTypes.StoreProductCategory[]
  customer: HttpTypes.StoreCustomer | null
}) {
  // categories and customer are passed from the parent layout — no duplicate fetches
  const [regions, locales, currentLocale, t, { collections }, cookieStore, businessInfo] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getTranslations("nav"),
    listCollections(),
    cookies(),
    getBusinessInfo(),
  ])

  const allCategories = categories
  const topLevelCategories = allCategories.filter((c) => !c.parent_category)

  const selectedCategoryId = cookieStore.get("selectedCategoryId")?.value
  const activeRoot = topLevelCategories.find((c) => c.id === selectedCategoryId) ?? null

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative mx-auto border-b duration-200 bg-primary border-primary-hover">
        <nav className="content-container txt-xsmall-plus text-primary-fg flex items-center justify-between w-full h-12 small:h-16 text-small-regular relative">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-3">
            <div className="h-full small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                allCategories={allCategories ?? []}
                collections={collections ?? []}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity leading-none hidden small:block"
              data-testid="nav-store-link"
            >
              {businessInfo?.logo_url ? (
                <img
                  src={businessInfo.logo_url}
                  alt={businessInfo.store_name ?? "Store logo"}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="txt-compact-xlarge-plus uppercase">
                  {businessInfo?.store_name ?? "Maoshu"}
                </span>
              )}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center justify-center h-full">
            <CategoryDropdown categories={topLevelCategories} />
          </div>

          <div className="flex items-center h-full flex-1 basis-0">
            <div className="flex items-center gap-x-4 ml-auto">
              <SearchBar categories={allCategories ?? []} />
              <div className="relative group/cart-tip">
                <Suspense
                  fallback={
                    <LocalizedClientLink
                      className="hover:text-primary-fg/80 flex items-center"
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
                        <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-white text-primary text-[9px] font-medium leading-none">
                          0
                        </span>
                      </div>
                    </LocalizedClientLink>
                  }
                >
                  <CartButton />
                </Suspense>
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-[11px] bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover/cart-tip:opacity-100 transition-opacity duration-150">
                  {t("cartTooltip")}
                </span>
              </div>
              <div className="hidden small:flex items-center gap-x-6 h-full">
                <div className="relative group/account-tip">
                  {customer ? (
                    <LocalizedClientLink
                      className="hover:text-primary-fg/80"
                      href="/account"
                      data-testid="nav-account-link"
                    >
                      {customer.first_name
                        ? <div>{t("greeting")}<b>{customer.first_name}</b></div>
                        : t("account")}
                    </LocalizedClientLink>
                  ) : (
                    <LocalizedClientLink
                      className="hover:text-primary-fg/80"
                      href="/account"
                      data-testid="nav-sign-in-link"
                    >
                      {t("signIn")}
                    </LocalizedClientLink>
                  )}
                  {customer && (
                    <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-[11px] bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover/account-tip:opacity-100 transition-opacity duration-150">
                      {t("accountTooltip")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <SubNav
        rootCategory={activeRoot}
        allCategories={allCategories ?? []}
        locales={locales ?? []}
        currentLocale={currentLocale ?? "vi"}
      />
    </div>
  )
}

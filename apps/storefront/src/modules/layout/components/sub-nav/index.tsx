import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"
import { getTranslations } from "next-intl/server"
import CategoriesDropdown from "./categories-dropdown"
import LocaleDropdown from "./locale-dropdown"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  rootCategory: HttpTypes.StoreProductCategory | null
  allCategories: HttpTypes.StoreProductCategory[]
  locales: Locale[]
  currentLocale: string
}

export default async function SubNav({ rootCategory, allCategories, locales, currentLocale }: Props) {
  if (!rootCategory) return null

  const t = await getTranslations("store")
  const subcategories = allCategories.filter((c) => c.parent_category?.id === rootCategory.id)

  if (subcategories.length === 0 && !locales.length) return null

  return (
    <div className="hidden small:block bg-white shadow-sm">
      <div className="content-container h-8 flex items-center justify-between">
        <div className="flex items-center h-full">
          <LocalizedClientLink
            href="/new-arrivals"
            className="h-full px-4 flex items-center text-sm font-medium text-gray-700 hover:bg-primary hover:text-primary-fg transition-colors"
          >
            {t("newArrivals")}
          </LocalizedClientLink>
          {subcategories.length > 0 && (
            <CategoriesDropdown categories={subcategories} />
          )}
        </div>
        {false && locales.length > 1 && (
          <LocaleDropdown locales={locales} currentLocale={currentLocale} />
        )}
      </div>
    </div>
  )
}

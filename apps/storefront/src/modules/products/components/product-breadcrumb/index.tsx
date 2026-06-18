import { Fragment } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"

type Category = HttpTypes.StoreProductCategory & {
  parent_category?: Category | null
}

function buildCrumbs(category: Category, rootCategoryId: string): Category[] {
  const crumbs: Category[] = []
  let current: Category | null | undefined = category
  while (current && current.id !== rootCategoryId) {
    crumbs.unshift(current)
    current = current.parent_category
  }
  return crumbs
}

type Props = {
  product: HttpTypes.StoreProduct
}

export default async function ProductBreadcrumb({ product }: Props) {
  const t = await getTranslations("products")
  const rootCategoryId = process.env.ROOT_CATEGORY_ID

  // Pick the most specific (deepest) category using mpath length
  const categories = (product.categories ?? []) as Category[]
  const category = categories.length
    ? [...categories].sort((a, b) => (b.mpath?.length ?? 0) - (a.mpath?.length ?? 0))[0]
    : undefined

  const crumbs = category && rootCategoryId
    ? buildCrumbs(category, rootCategoryId)
    : []

  return (
    <div>
      <div className="content-container py-3">
        <nav className="flex items-center gap-x-2 text-sm text-gray-500 flex-wrap">
          <LocalizedClientLink href="/store" className="hover:text-gray-800 transition-colors">
            {t("breadcrumbAll")}
          </LocalizedClientLink>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.id}>
              <span>/</span>
              <LocalizedClientLink
                href={`/categories/${crumb.handle}`}
                className="hover:text-gray-800 transition-colors"
              >
                {crumb.name}
              </LocalizedClientLink>
            </Fragment>
          ))}
          <span>/</span>
          <span className="text-gray-800">{product.title}</span>
        </nav>
      </div>
    </div>
  )
}

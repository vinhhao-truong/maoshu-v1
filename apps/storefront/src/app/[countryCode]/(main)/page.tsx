import { Metadata } from "next"
import { Suspense } from "react"

import NewArrivals from "@modules/home/components/new-arrivals"
import Hero from "@modules/home/components/hero"
import ProductGrid from "@modules/products/components/product-grid"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CategorySidebar from "@modules/home/components/category-sidebar"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params
  const { category: categoryHandle } = searchParams

  const region = await getRegion(countryCode)

  const categories = await listCategories({ limit: 50 })

  if (!region) {
    return null
  }

  const rootCategoryId = process.env.ROOT_CATEGORY_ID
  const rootCategory = categories?.find((c) => c.id === rootCategoryId)
  const rootCategoryIds = rootCategory
    ? [
        rootCategory.id,
        ...(rootCategory.category_children?.flatMap((c) => [
          c.id,
          ...(c.category_children?.map((d) => d.id) ?? []),
        ]) ?? []),
      ]
    : undefined

  const selectedCategory = categories?.find((c) => c.handle === categoryHandle)
  const categoryIds = selectedCategory
    ? [
        selectedCategory.id,
        ...(selectedCategory.category_children?.map((c) => c.id) ?? []),
      ]
    : rootCategoryIds

  const t = await getTranslations("store")

  return (
    <>
      <Hero rootCategory={rootCategory} />
      <NewArrivals countryCode={countryCode} categoryIds={rootCategoryIds} />
      <div className="content-container py-12 flex flex-col small:flex-row gap-8">
        <CategorySidebar
          categories={categories ?? []}
          selectedHandle={categoryHandle}
          rootCategoryId={rootCategoryId}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-x-4 mb-6">
            <div>
              <h2 className="text-2xl-semi">
                {selectedCategory?.name ?? "Tất Cả Sản Phẩm"}
              </h2>
              {selectedCategory?.description && (
                <p className="text-ui-fg-subtle text-base-regular mt-1">
                  {selectedCategory.description}
                </p>
              )}
            </div>
            <LocalizedClientLink
              href={
                selectedCategory
                  ? `/categories/${selectedCategory.handle}`
                  : "/store"
              }
              className="flex-shrink-0 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              {t("viewAll")} →
            </LocalizedClientLink>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <ProductGrid
              countryCode={countryCode}
              categoryIds={categoryIds}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

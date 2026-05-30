import { Metadata } from "next"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import NewArrivalsPaginatedProducts from "@modules/new-arrivals/components/paginated-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest new products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    limit?: string
    priceMin?: string
    priceMax?: string
  }>
  params: Promise<{ countryCode: string }>
}

export default async function NewArrivalsPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const {
    sortBy = "created_at",
    page,
    limit: limitStr,
    priceMin: priceMinStr,
    priceMax: priceMaxStr,
  } = searchParams

  const pageNumber = page ? parseInt(page) : 1
  const limit = limitStr ? parseInt(limitStr) : 12
  const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
  const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined

  // Only cookies() is blocking — instant, no network call
  const cookieStore = await cookies()
  const rootCategoryId = cookieStore.get("selectedCategoryId")?.value

  const t = await getTranslations("store")

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="new-arrivals-container"
    >
      <RefinementList sortBy={sortBy as SortOptions} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="new-arrivals-title">{t("newArrivals")}</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <NewArrivalsPaginatedProducts
            page={pageNumber}
            countryCode={params.countryCode}
            rootCategoryId={rootCategoryId}
            sortBy={sortBy as SortOptions}
            priceMin={priceMin}
            priceMax={priceMax}
            limit={limit}
          />
        </Suspense>
      </div>
    </div>
  )
}

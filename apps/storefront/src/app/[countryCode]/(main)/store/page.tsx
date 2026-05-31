import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listCategories } from "@lib/data/categories"
import { getRootCategoryIds } from "@lib/util/category-ids"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    priceMin?: string
    priceMax?: string
    limit?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, priceMin: priceMinStr, priceMax: priceMaxStr, limit: limitStr } = searchParams
  const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
  const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined
  const limit = limitStr ? parseInt(limitStr) : undefined

  const allCategories = await listCategories({ limit: 100 })
  const categoryIds = getRootCategoryIds(process.env.ROOT_CATEGORY_ID, allCategories ?? [])

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      priceMin={priceMin}
      priceMax={priceMax}
      categoryIds={categoryIds}
      limit={limit}
    />
  )
}

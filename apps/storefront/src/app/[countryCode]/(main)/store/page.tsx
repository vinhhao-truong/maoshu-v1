import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

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
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, priceMin: priceMinStr, priceMax: priceMaxStr } = searchParams
  const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
  const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      priceMin={priceMin}
      priceMax={priceMax}
    />
  )
}

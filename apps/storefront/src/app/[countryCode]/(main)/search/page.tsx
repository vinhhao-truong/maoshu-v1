import { Metadata } from "next"
import { cookies } from "next/headers"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SearchTemplate from "@modules/search/templates"
import { listCategories } from "@lib/data/categories"
import { getRootCategoryIds } from "@lib/util/category-ids"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string; sortBy?: SortOptions; page?: string; priceMin?: string; priceMax?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { q } = await props.searchParams
  return {
    title: q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm",
  }
}

export default async function SearchPage(props: Props) {
  const { countryCode } = await props.params
  const { q = "", sortBy, page, priceMin: priceMinStr, priceMax: priceMaxStr } = await props.searchParams
  const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
  const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined

  const [cookieStore, allCategories] = await Promise.all([cookies(), listCategories({ limit: 100 })])
  const categoryIds = await getRootCategoryIds(cookieStore, allCategories ?? [])

  return (
    <SearchTemplate
      query={q}
      sortBy={sortBy}
      page={page ? parseInt(page) : 1}
      countryCode={countryCode}
      priceMin={priceMin}
      priceMax={priceMax}
      categoryIds={categoryIds}
    />
  )
}

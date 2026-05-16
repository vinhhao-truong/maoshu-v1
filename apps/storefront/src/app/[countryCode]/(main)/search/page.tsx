import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SearchTemplate from "@modules/search/templates"

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

  return (
    <SearchTemplate
      query={q}
      sortBy={sortBy}
      page={page ? parseInt(page) : 1}
      countryCode={countryCode}
      priceMin={priceMin}
      priceMax={priceMax}
    />
  )
}

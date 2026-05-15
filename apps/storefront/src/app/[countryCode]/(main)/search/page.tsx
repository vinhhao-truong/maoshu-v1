import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SearchTemplate from "@modules/search/templates"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string; sortBy?: SortOptions; page?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { q } = await props.searchParams
  return {
    title: q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm",
  }
}

export default async function SearchPage(props: Props) {
  const { countryCode } = await props.params
  const { q = "", sortBy, page } = await props.searchParams

  return (
    <SearchTemplate
      query={q}
      sortBy={sortBy}
      page={page ? parseInt(page) : 1}
      countryCode={countryCode}
    />
  )
}

import { Suspense } from "react"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchResults from "../components/search-results"
import SearchInput from "../components/search-input"

type Props = {
  query: string
  sortBy?: SortOptions
  page: number
  countryCode: string
  priceMin?: number
  priceMax?: number
  categoryIds?: string[]
}

export default function SearchTemplate({ query, sortBy, page, countryCode, priceMin, priceMax, categoryIds }: Props) {
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="search-container"
    >
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
      <div className="w-full">
        <div className="flex flex-col mb-8 gap-4">
          <SearchInput initialQuery={query} />
          {query && (
            <h1 className="text-2xl-semi">
              Kết quả cho <span className="font-semibold">"{query}"</span>
            </h1>
          )}
        </div>
        {!query ? (
          <p className="text-ui-fg-subtle text-base-regular">
            Nhập từ khóa để tìm kiếm sản phẩm.
          </p>
        ) : (
          <Suspense fallback={<SkeletonProductGrid numberOfProducts={12} />}>
            <SearchResults
              query={query}
              sortBy={sort}
              page={page}
              countryCode={countryCode}
              priceMin={priceMin}
              priceMax={priceMax}
              categoryIds={categoryIds}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

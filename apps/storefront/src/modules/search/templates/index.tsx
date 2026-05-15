import { Suspense } from "react"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchResults from "../components/search-results"

type Props = {
  query: string
  sortBy?: SortOptions
  page: number
  countryCode: string
}

export default function SearchTemplate({ query, sortBy, page, countryCode }: Props) {
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="search-container"
    >
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl-semi gap-4">
          <h1>
            {query
              ? <>Kết quả cho <span className="font-semibold">"{query}"</span></>
              : "Tìm kiếm"}
          </h1>
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
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

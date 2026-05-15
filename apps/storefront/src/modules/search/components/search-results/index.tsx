import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type Props = {
  query: string
  sortBy: SortOptions
  page: number
  countryCode: string
}

export default async function SearchResults({ query, sortBy, page, countryCode }: Props) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams: { limit: PRODUCT_LIMIT, q: query } as any,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (!products.length) {
    return (
      <p className="text-ui-fg-subtle text-base-regular">
        Không tìm thấy sản phẩm nào cho &quot;{query}&quot;.
      </p>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="search-results-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="search-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

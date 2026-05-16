import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { normalizeText, scoreMatch } from "@lib/util/normalize-text"
import { sortProducts } from "@lib/util/sort-products"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type Props = {
  query: string
  sortBy: SortOptions
  page: number
  countryCode: string
  priceMin?: number
  priceMax?: number
  categoryIds?: string[]
}

export default async function SearchResults({ query, sortBy, page, countryCode, priceMin, priceMax, categoryIds }: Props) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const queryParams: Record<string, unknown> = { limit: 200 }
  if (categoryIds?.length) queryParams.category_id = categoryIds

  const {
    response: { products: allProducts },
  } = await listProducts({
    pageParam: 0,
    queryParams,
    countryCode,
  })

  const normalizedQ = normalizeText(query)
  const queryWords = normalizedQ.split(/\s+/).filter(Boolean)

  const scored = allProducts
    .map((p) => ({ p, score: scoreMatch(p.title ?? "", normalizedQ, queryWords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p)

  const sorted = sortProducts(scored, sortBy)

  const filtered =
    priceMin !== undefined || priceMax !== undefined
      ? sorted.filter((product) => {
          const minVariantPrice =
            product.variants && product.variants.length > 0
              ? Math.min(
                  ...product.variants.map(
                    (v) => v?.calculated_price?.calculated_amount || 0
                  )
                )
              : Infinity
          if (priceMin !== undefined && minVariantPrice < priceMin) return false
          if (priceMax !== undefined && minVariantPrice > priceMax) return false
          return true
        })
      : sorted

  const totalPages = Math.ceil(filtered.length / PRODUCT_LIMIT)
  const offset = (page - 1) * PRODUCT_LIMIT
  const products = filtered.slice(offset, offset + PRODUCT_LIMIT)

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
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 border-l border-t border-gray-200"
        data-testid="search-results-list"
      >
        {products.map((p) => (
          <li key={p.id} className="border-r border-b border-gray-200 transition-shadow duration-300 hover:ring-1 hover:ring-inset hover:ring-black">
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

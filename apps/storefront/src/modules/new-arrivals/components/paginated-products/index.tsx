import { listProducts, listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const SORT_ORDER: Partial<Record<SortOptions, string>> = {
  created_at: "-created_at",
  title_asc: "title",
  title_desc: "-title",
}

export default async function NewArrivalsPaginatedProducts({
  page,
  countryCode,
  categoryIds,
  sortBy = "created_at",
  priceMin,
  priceMax,
  limit = 12,
}: {
  page: number
  countryCode: string
  categoryIds?: string[]
  sortBy?: SortOptions
  priceMin?: number
  priceMax?: number
  limit?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) return null

  const needsClientSort =
    sortBy === "price_asc" ||
    sortBy === "price_desc" ||
    priceMin !== undefined ||
    priceMax !== undefined

  let products: Awaited<ReturnType<typeof listProducts>>["response"]["products"]
  let count: number

  if (needsClientSort) {
    const result = await listProductsWithSort({
      page,
      queryParams: {
        limit,
        ...(categoryIds?.length ? { category_id: categoryIds } : {}),
      },
      sortBy,
      countryCode,
      priceMin,
      priceMax,
    })
    products = result.response.products
    count = result.response.count
  } else {
    const offset = (page - 1) * limit
    const result = await listProducts({
      countryCode,
      queryParams: {
        limit,
        offset,
        order: SORT_ORDER[sortBy] ?? "-created_at",
        ...(categoryIds?.length ? { category_id: categoryIds } : {}),
      },
    })
    products = result.response.products
    count = result.response.count
  }

  const totalPages = Math.ceil(count / limit)

  if (!products.length) {
    return (
      <p className="text-ui-fg-subtle py-8 text-center">Không có sản phẩm nào.</p>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 border-l border-t border-gray-200"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li
            key={p.id}
            className="border-r border-b border-gray-200 transition-shadow duration-300 hover:ring-1 hover:ring-inset hover:ring-black"
          >
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      <Pagination
        data-testid="new-arrivals-pagination"
        page={page}
        totalPages={totalPages}
        limit={limit}
      />
    </>
  )
}

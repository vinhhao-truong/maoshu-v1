import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductGrid({
  countryCode,
  limit = 12,
  categoryIds,
}: {
  countryCode: string
  limit?: number
  categoryIds?: string[]
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: Record<string, unknown> = { limit }
  if (categoryIds?.length) {
    queryParams.category_id = categoryIds
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams,
  })

  if (!products.length) {
    return (
      <p className="text-ui-fg-subtle py-8 text-center">
        Không có sản phẩm nào.
      </p>
    )
  }

  return (
    <ul
      className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 border-l border-t border-gray-200"
      data-testid="products-list"
    >
      {products.map((product) => (
        <li
          key={product.id}
          className="border-r border-b border-gray-200 transition-shadow duration-300 hover:ring-1 hover:ring-inset hover:ring-black"
        >
          <ProductPreview product={product} region={region} />
        </li>
      ))}
    </ul>
  )
}

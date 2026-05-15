import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function ProductGrid({
  countryCode,
  limit = 12,
}: {
  countryCode: string
  limit?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit },
  })

  if (!products.length) {
    return (
      <p className="text-ui-fg-subtle py-8 text-center">No products found.</p>
    )
  }

  return (
    <div className="content-container py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl-semi">Tất Cả Sản Phẩm</h2>
        <LocalizedClientLink
          href="/store"
          className="text-ui-fg-subtle hover:text-ui-fg-base text-small-regular transition-colors"
        >
          View all →
        </LocalizedClientLink>
      </div>
      <ul
        className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 border-l border-t border-gray-200"
        data-testid="products-list"
      >
        {products.map((product) => (
          <li key={product.id} className="border-r border-b border-gray-200 transition-shadow duration-300 hover:ring-1 hover:ring-inset hover:ring-black">
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}

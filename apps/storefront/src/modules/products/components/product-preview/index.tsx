import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import AddToCartButton from "./add-to-cart-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <div data-testid="product-wrapper" className="group relative p-5">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="absolute inset-0 z-10"
        aria-label={product.title ?? ""}
      />
      <Thumbnail
        thumbnail={product.thumbnail}
        images={product.images}
        size="full"
        isFeatured={isFeatured}
        flat
      />
      <Text
        className="text-ui-fg-subtle text-xs mt-3 block"
        data-testid="product-title"
      >
        {product.title}
      </Text>
      <div className="relative z-20 mt-2">
        <AddToCartButton product={product} price={cheapestPrice} />
      </div>
    </div>
  )
}

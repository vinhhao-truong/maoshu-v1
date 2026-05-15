import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
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
    <div data-testid="product-wrapper" className="group">
      <LocalizedClientLink href={`/products/${product.handle}`}>
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <Text
          className="text-ui-fg-subtle text-xs mt-3 block"
          data-testid="product-title"
        >
          {product.title}
        </Text>
      </LocalizedClientLink>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-x-2">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}

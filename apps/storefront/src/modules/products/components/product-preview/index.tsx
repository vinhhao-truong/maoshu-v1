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
    <div data-testid="product-wrapper" className="group relative p-5 border border-transparent hover:border-primary transition-colors duration-200 flex flex-col h-full">
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
        className="text-black text-sm font-medium mt-3 block"
        data-testid="product-title"
      >
        {product.title}
      </Text>
      {(product.variants?.length ?? 0) > 1 && (product.options ?? []).length > 0 && (
        <div className="mt-1.5 flex flex-col gap-y-1">
          {product.options!.map((option) => (
            <div key={option.id} className="flex flex-wrap gap-1">
              {(option.values ?? []).map((v) => (
                <span
                  key={v.id}
                  className="text-xs text-ui-fg-subtle border border-ui-border-base px-1.5 py-0.5"
                >
                  {v.value}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="relative z-20 mt-auto pt-2">
        <AddToCartButton product={product} price={cheapestPrice} />
      </div>
    </div>
  )
}

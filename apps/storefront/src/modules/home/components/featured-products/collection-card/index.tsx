import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { getTranslations } from "next-intl/server"

export default async function CollectionCard({
  collection,
  countryCode,
  categoryIds,
}: {
  collection: HttpTypes.StoreCollection
  countryCode: string
  categoryIds?: string[]
}) {
  const t = await getTranslations("store")

  const queryParams: Record<string, unknown> = {
    collection_id: collection.id,
    limit: 4,
    fields: "id,handle,title,thumbnail,+images",
  }
  if (categoryIds?.length) {
    queryParams.category_id = categoryIds
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams,
  })

  if (categoryIds?.length && products.length === 0) return null

  return (
    <div className="border border-gray-200 overflow-hidden flex flex-col h-full">
      {products.length > 0 ? (
        <div className="grid grid-cols-2">
          {products.slice(0, 4).map((product: HttpTypes.StoreProduct) => (
            <LocalizedClientLink
              key={product.id}
              href={`/products/${product.handle}`}
              className="block border-b border-r border-gray-200 last:border-r-0 [&:nth-child(2)]:border-r-0 hover:opacity-90 transition-opacity pb-2"
            >
              <div className="aspect-square overflow-hidden">
                <Thumbnail
                  thumbnail={product.thumbnail}
                  images={product.images}
                  size="full"
                  flat
                />
              </div>
              <p className="text-xs text-ui-fg-subtle mt-1 px-1.5 truncate">
                {product.title}
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <p className="text-sm text-ui-fg-subtle text-center">
            {collection.description ?? ""}
          </p>
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-gray-200 mt-auto">
        <span className="text-base-semi text-ui-fg-base truncate">
          {collection.title}
        </span>
        <LocalizedClientLink
          href={`/collections/${collection.handle}`}
          className="flex-shrink-0 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
        >
          {t("viewAll")} →
        </LocalizedClientLink>
      </div>
    </div>
  )
}

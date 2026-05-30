import { listProducts } from "@lib/data/products"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"

export default async function NewArrivals({
  countryCode,
  categoryIds,
}: {
  countryCode: string
  categoryIds?: string[]
}) {
  const t = await getTranslations("store")

  const queryParams: Record<string, unknown> = {
    limit: 6,
    order: "-created_at",
    fields: "id,handle,title,thumbnail,+images",
  }
  if (categoryIds?.length) {
    queryParams.category_id = categoryIds
  }

  const {
    response: { products },
  } = await listProducts({ countryCode, queryParams })

  if (!products.length) return null

  return (
    <div className="content-container py-12">
      <ul className="grid grid-cols-3 gap-4">
        <li className="flex flex-col">
          <div className="border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="grid grid-cols-3">
              {products.slice(0, 6).map((product: HttpTypes.StoreProduct) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="block border-b border-r border-gray-200 [&:nth-child(3n)]:border-r-0 hover:opacity-90 transition-opacity pb-1"
                >
                  <div className="aspect-[3/2] overflow-hidden">
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
            <div className="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-gray-200 mt-auto">
              <span className="text-base-semi text-ui-fg-base truncate">
                {t("newArrivals")}
              </span>
              <LocalizedClientLink
                href="/new-arrivals"
                className="flex-shrink-0 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              >
                {t("viewAll")} →
              </LocalizedClientLink>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}

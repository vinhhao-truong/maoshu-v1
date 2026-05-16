import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function FeaturedProducts({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) {
  if (!collections.length) return null

  return (
    <div className="content-container py-12">
      <ul className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <li key={collection.id}>
            <LocalizedClientLink href={`/collections/${collection.handle}`}>
              <div className="border border-gray-200 px-8 py-10 flex items-center justify-center hover:border-black transition-colors duration-200 cursor-pointer">
                <span className="text-base-semi text-ui-fg-base text-center">
                  {collection.title}
                </span>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

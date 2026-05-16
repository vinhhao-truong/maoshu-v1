import { HttpTypes } from "@medusajs/types"
import CollectionCard from "./collection-card"

export default function FeaturedProducts({
  collections,
  countryCode,
  categoryIds,
}: {
  collections: HttpTypes.StoreCollection[]
  countryCode: string
  categoryIds?: string[]
}) {
  if (!collections.length) return null

  return (
    <div className="content-container py-12">
      <ul className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} countryCode={countryCode} categoryIds={categoryIds} />
          </li>
        ))}
      </ul>
    </div>
  )
}

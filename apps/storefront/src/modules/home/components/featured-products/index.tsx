import { HomeGridData } from "@lib/data/root-category"
import NewArrivalsCard from "@modules/home/components/new-arrivals/card"
import CollectionCard from "./collection-card"

export default function FeaturedGrid({ data }: { data: HomeGridData }) {
  const { new_arrivals, featured_collections } = data

  if (!new_arrivals.length && !featured_collections.length) return null

  return (
    <div className="content-container py-12">
      <ul className="grid grid-cols-3 gap-4">
        {new_arrivals.length > 0 && (
          <li>
            <NewArrivalsCard products={new_arrivals} />
          </li>
        )}
        {featured_collections.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </div>
  )
}

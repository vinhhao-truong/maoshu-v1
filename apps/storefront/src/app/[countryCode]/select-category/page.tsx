import { listCategories } from "@lib/data/categories"
import { retrieveCart } from "@lib/data/cart"
import CategoryGrid from "./category-grid"

export default async function SelectCategoryPage() {
  const [categories, cart] = await Promise.all([
    listCategories({ limit: 100 }),
    retrieveCart(),
  ])
  const topLevel = (categories ?? []).filter((c) => !c.parent_category)
  const hasCartItems = (cart?.items?.length ?? 0) > 0

  return (
    <div className="w-screen h-screen overflow-hidden">
      <CategoryGrid categories={topLevel} hasCartItems={hasCartItems} />
    </div>
  )
}

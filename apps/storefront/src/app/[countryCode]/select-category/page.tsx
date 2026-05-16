import { listCategories } from "@lib/data/categories"
import CategoryGrid from "./category-grid"

export default async function SelectCategoryPage() {
  const categories = await listCategories({ limit: 100 })
  const topLevel = (categories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="w-screen h-screen overflow-hidden">
      <CategoryGrid categories={topLevel} />
    </div>
  )
}

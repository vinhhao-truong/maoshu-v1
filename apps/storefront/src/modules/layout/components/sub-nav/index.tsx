import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"
import CollectionsDropdown from "./collections-dropdown"
import CategoriesDropdown from "./categories-dropdown"
import LocaleDropdown from "./locale-dropdown"

function getDescendantIds(
  rootId: string,
  allCategories: HttpTypes.StoreProductCategory[]
): string[] {
  const children = allCategories.filter((c) => c.parent_category?.id === rootId)
  return [rootId, ...children.flatMap((c) => getDescendantIds(c.id, allCategories))]
}

type Props = {
  rootCategory: HttpTypes.StoreProductCategory | null
  allCategories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  locales: Locale[]
  currentLocale: string
}

export default function SubNav({ rootCategory, allCategories, collections, locales, currentLocale }: Props) {
  if (!rootCategory) return null

  const descendantIds = getDescendantIds(rootCategory.id, allCategories)

  const relevantCollectionIds = new Set<string>()
  for (const catId of descendantIds) {
    const cat = allCategories.find((c) => c.id === catId)
    for (const product of cat?.products ?? []) {
      const colId =
        (product as HttpTypes.StoreProduct & { collection_id?: string }).collection_id
        ?? product.collection?.id
      if (colId) relevantCollectionIds.add(colId)
    }
  }

  const filteredCollections = collections.filter((c) => relevantCollectionIds.has(c.id))
  const subcategories = allCategories.filter((c) => c.parent_category?.id === rootCategory.id)

  if (filteredCollections.length === 0 && subcategories.length === 0 && !locales.length) return null

  return (
    <div className="hidden small:block bg-white shadow-sm">
      <div className="content-container h-8 flex items-center justify-between">
        <div className="flex items-center h-full">
          {filteredCollections.length > 0 && (
            <CollectionsDropdown collections={filteredCollections} />
          )}
          {subcategories.length > 0 && (
            <CategoriesDropdown categories={subcategories} />
          )}
        </div>
        {locales.length > 1 && (
          <LocaleDropdown locales={locales} currentLocale={currentLocale} />
        )}
      </div>
    </div>
  )
}

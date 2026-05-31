import { HttpTypes } from "@medusajs/types"

export function collectDescendantIds(
  cat: HttpTypes.StoreProductCategory
): string[] {
  return [cat.id, ...(cat.category_children ?? []).flatMap(collectDescendantIds)]
}

export function getRootCategoryIds(
  rootCategoryId: string | undefined,
  categories: HttpTypes.StoreProductCategory[]
): string[] | undefined {
  if (!rootCategoryId) return undefined
  const root = categories.find((c) => c.id === rootCategoryId)
  return root ? collectDescendantIds(root) : undefined
}

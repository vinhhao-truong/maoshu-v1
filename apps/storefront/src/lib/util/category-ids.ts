import { HttpTypes } from "@medusajs/types"

export function collectDescendantIds(
  cat: HttpTypes.StoreProductCategory
): string[] {
  return [cat.id, ...(cat.category_children ?? []).flatMap(collectDescendantIds)]
}

export async function getRootCategoryIds(
  cookieStore: { get: (key: string) => { value: string } | undefined },
  categories: HttpTypes.StoreProductCategory[]
): Promise<string[] | undefined> {
  const rootId = cookieStore.get("selectedCategoryId")?.value
  if (!rootId) return undefined
  const root = categories.find((c) => c.id === rootId)
  return root ? collectDescendantIds(root) : undefined
}

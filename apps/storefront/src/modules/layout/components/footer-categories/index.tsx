"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  rootCategoryId?: string
}

export default function FooterCategories({ categories, rootCategoryId }: Props) {
  const root = rootCategoryId ? categories.find((c) => c.id === rootCategoryId) : null
  const items = root
    ? (root.category_children ?? [])
    : categories.filter((c) => !c.parent_category)

  if (!items.length) return null

  return (
    <ul className="grid grid-cols-1 gap-2" data-testid="footer-categories">
      {items.slice(0, 6).map((c) => (
        <li key={c.id} className="text-ui-fg-subtle txt-small">
          <LocalizedClientLink
            className="hover:text-ui-fg-base"
            href={`/categories/${c.handle}`}
            data-testid="category-link"
          >
            {c.name}
          </LocalizedClientLink>
        </li>
      ))}
    </ul>
  )
}

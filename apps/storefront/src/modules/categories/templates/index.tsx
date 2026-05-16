import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  priceMin,
  priceMax,
  subcategoryId,
  rootCategoryId,
  limit,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  priceMin?: number
  priceMax?: number
  subcategoryId?: string
  rootCategoryId?: string
  limit?: number
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const subcategories = category.category_children ?? []
  const activeCategoryId = subcategoryId || category.id
  const visibleParents = parents.filter((p) => p.id !== rootCategoryId)

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        subcategories={subcategories}
        data-testid="sort-by-container"
      />
      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl-semi gap-4">
          {visibleParents.map((parent) => (
            <span key={parent.id} className="text-ui-fg-subtle">
              <LocalizedClientLink
                className="mr-4 text-gray-500 hover:text-black"
                href={`/categories/${parent.handle}`}
                data-testid="sort-by-link"
              >
                {parent.name}
              </LocalizedClientLink>
              &gt;
            </span>
          ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
<Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={activeCategoryId}
            countryCode={countryCode}
            priceMin={priceMin}
            priceMax={priceMax}
            limit={limit}
          />
        </Suspense>
      </div>
    </div>
  )
}

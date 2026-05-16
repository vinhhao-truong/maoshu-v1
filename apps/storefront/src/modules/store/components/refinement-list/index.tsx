"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import PriceRangeFilter from "./price-range-filter"
import SubcategoryFilter from "./subcategory-filter"
import { HttpTypes } from "@medusajs/types"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  subcategories?: HttpTypes.StoreProductCategory[]
  'data-testid'?: string
}

const RefinementList = ({ sortBy, subcategories, 'data-testid': dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const priceMin = searchParams.get("priceMin") ?? ""
  const priceMax = searchParams.get("priceMax") ?? ""
  const subcategoryId = searchParams.get("subcategoryId") ?? ""

  const applyPriceRange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams)
    if (min) params.set("priceMin", min); else params.delete("priceMin")
    if (max) params.set("priceMax", max); else params.delete("priceMax")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />
      <PriceRangeFilter priceMin={priceMin} priceMax={priceMax} onApply={applyPriceRange} />
      {subcategories && subcategories.length > 0 && (
        <SubcategoryFilter
          subcategories={subcategories}
          currentSubcategoryId={subcategoryId}
          setQueryParams={setQueryParams}
        />
      )}
    </div>
  )
}

export default RefinementList

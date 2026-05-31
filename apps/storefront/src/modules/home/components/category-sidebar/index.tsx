"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  selectedHandle?: string
  rootCategoryId?: string
}

export default function CategorySidebar({ categories, selectedHandle, rootCategoryId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rootCategory = categories.find((c) => c.id === rootCategoryId) ?? null

  const setCategory = useCallback(
    (handle: string | undefined) => {
      const params = new URLSearchParams(searchParams)
      if (handle) {
        params.set("category", handle)
      } else {
        params.delete("category")
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const topLevel = rootCategory
    ? (rootCategory.category_children ?? [])
    : categories.filter((c) => !c.parent_category)

  const prevRootIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!rootCategory) return
    if (prevRootIdRef.current === rootCategory.id) return
    prevRootIdRef.current = rootCategory.id
    const first = rootCategory.category_children?.[0]
    if (first) setCategory(first.handle)
  }, [rootCategory, setCategory])

  return (
    <div className="small:w-52 small:flex-shrink-0">
      <Text className="txt-compact-small-plus text-ui-fg-muted mb-4">
        Danh Mục
      </Text>
      <div className="flex flex-col gap-y-3">
        {topLevel.map((cat) => {
          const isSelected = cat.handle === selectedHandle
          const subCategories = cat.category_children ?? []
          const isChildSelected = subCategories.some(
            (sub) => sub.handle === selectedHandle
          )
          const isActive = isSelected || isChildSelected

          return (
            <div key={cat.id} className="flex flex-col gap-y-2">
              {/* Top-level category row */}
              <div
                className={`flex items-center gap-x-2 ${
                  isSelected ? "ml-[-23px]" : ""
                }`}
              >
                {isSelected && (
                  <span className="text-ui-fg-base text-sm leading-none flex-shrink-0">
                    •
                  </span>
                )}
                <button
                  onClick={() => setCategory(cat.handle)}
                  className={`txt-compact-small text-left truncate transition-colors ${
                    isActive
                      ? "text-ui-fg-base"
                      : "text-ui-fg-subtle hover:text-ui-fg-base"
                  }`}
                >
                  {cat.name}
                </button>
              </div>

              {/* Subcategories (depth 1) */}
              {subCategories.length > 0 && (
                <div className="flex flex-col gap-y-2 ml-2 pl-3 border-l border-gray-200">
                  {subCategories.map((sub) => {
                    const isSubSelected = sub.handle === selectedHandle
                    const deepSubs = sub.category_children ?? []
                    const isDeepChildSelected = deepSubs.some(
                      (d) => d.handle === selectedHandle
                    )
                    const isSubActive = isSubSelected || isDeepChildSelected
                    return (
                      <div key={sub.id} className="flex flex-col gap-y-2">
                        <button
                          onClick={() => setCategory(sub.handle)}
                          className={`txt-compact-small text-left truncate transition-colors ${
                            isSubActive
                              ? "text-ui-fg-base font-medium"
                              : "text-ui-fg-subtle hover:text-ui-fg-base"
                          }`}
                        >
                          {sub.name}
                        </button>

                        {/* Subcategories (depth 2) */}
                        {deepSubs.length > 0 && (
                          <div className="flex flex-col gap-y-2 ml-2 pl-3 border-l border-gray-200">
                            {deepSubs.map((deep) => {
                              const isDeepSelected = deep.handle === selectedHandle
                              return (
                                <button
                                  key={deep.id}
                                  onClick={() => setCategory(deep.handle)}
                                  className={`txt-compact-small text-left truncate transition-colors ${
                                    isDeepSelected
                                      ? "text-ui-fg-base font-medium"
                                      : "text-ui-fg-subtle hover:text-ui-fg-base"
                                  }`}
                                >
                                  {deep.name}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

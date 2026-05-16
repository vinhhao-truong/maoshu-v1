"use client"

import { HttpTypes } from "@medusajs/types"
import { useRouter, useParams } from "next/navigation"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryGrid({ categories }: Props) {
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string

  const handleSelect = (id: string) => {
    localStorage.setItem("selectedCategoryId", id)

    const returnPath = sessionStorage.getItem("selectCategoryReturnPath")
    sessionStorage.removeItem("selectCategoryReturnPath")

    router.push(returnPath || `/${countryCode}`)
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className="flex items-center justify-center p-8 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-center"
        >
          <span className="text-lg font-medium text-ui-fg-base">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  )
}

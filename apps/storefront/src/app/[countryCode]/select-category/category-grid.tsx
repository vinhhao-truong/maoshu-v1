"use client"

import { HttpTypes } from "@medusajs/types"
import { useRouter, useParams } from "next/navigation"
import { themeForCategory } from "@lib/util/theme"
import { useState } from "react"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

function getCategoryImage(category: HttpTypes.StoreProductCategory): string | undefined {
  const metaImage = (category.metadata as Record<string, unknown> | null)?.vertical_image
  if (typeof metaImage === "string" && metaImage) return metaImage
  return undefined
}

export default function CategoryGrid({ categories }: Props) {
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string
  const [hoveredTheme, setHoveredTheme] = useState<string | undefined>(undefined)

  const handleSelect = (id: string) => {
    localStorage.setItem("selectedCategoryId", id)
    document.cookie = `selectedCategoryId=${id}; path=/; max-age=31536000`

    const returnPath = sessionStorage.getItem("selectCategoryReturnPath")
    sessionStorage.removeItem("selectCategoryReturnPath")

    router.push(returnPath || `/${countryCode}`)
  }

  return (
    <div
      className="relative grid grid-cols-2 w-full h-full"
      data-theme={hoveredTheme}
    >
      {categories.map((category) => {
        const image = getCategoryImage(category)
        const theme = themeForCategory(category)

        return (
          <button
            key={category.id}
            onClick={() => handleSelect(category.id)}
            onMouseEnter={() => setHoveredTheme(theme)}
            onMouseLeave={() => setHoveredTheme(undefined)}
            className="relative flex items-center justify-center overflow-hidden group"
            style={!image ? { backgroundColor: "#f3f4f6" } : undefined}
          >
            {/* blurrable background image */}
            {image && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
              />
            )}

            {/* full-size glass overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/25 group-hover:backdrop-blur-none group-hover:bg-black/10 transition-all duration-300" />

            {/* centered label */}
            <span className="relative z-10 text-white group-hover:text-primary text-6xl font-bold tracking-widest uppercase drop-shadow-lg transition-colors duration-300">
              {category.name}
            </span>
          </button>
        )
      })}

      {/* Center divider circle */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-28 h-28 rounded-full shadow-lg transition-colors duration-300 ${hoveredTheme ? "bg-primary" : "bg-white"}`}
      />
    </div>
  )
}

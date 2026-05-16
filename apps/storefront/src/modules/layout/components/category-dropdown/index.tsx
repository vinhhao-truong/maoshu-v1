"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryDropdown({ categories }: Props) {
  const [selected, setSelected] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const params = useParams()
  const countryCode = params.countryCode as string

  useEffect(() => {
    const id = localStorage.getItem("selectedCategoryId")
    if (id) {
      const match = categories.find((c) => c.id === id)
      setSelected(match ?? null)
    }
  }, [categories])

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current)
  }

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  const handleSelect = (category: HttpTypes.StoreProductCategory) => {
    localStorage.setItem("selectedCategoryId", category.id)
    document.cookie = `selectedCategoryId=${category.id}; path=/; max-age=31536000`
    window.dispatchEvent(new CustomEvent("selectedCategoryChanged", { detail: { id: category.id } }))
    setSelected(category)
    setOpen(false)
    window.location.href = `/${countryCode}`
  }

  return (
    <div
      className="flex items-center"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger */}
      <button className="flex items-center gap-0.5 text-[10px] text-ui-fg-subtle hover:text-ui-fg-base transition-colors">
        <span>{selected?.name ?? "—"}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown — positioned relative to the nav header */}
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 min-w-[160px] bg-white border border-ui-border-base shadow-md z-50"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelect(category)}
              className={`w-full text-center px-4 py-2.5 text-sm transition-colors hover:bg-ui-bg-subtle ${
                selected?.id === category.id
                  ? "font-semibold text-ui-fg-base"
                  : "text-ui-fg-subtle"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

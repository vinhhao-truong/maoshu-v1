"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

type Props = {
  collections: HttpTypes.StoreCollection[]
}

export default function CollectionsDropdown({ collections }: Props) {
  const t = useTranslations("sideMenu")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative h-full w-max">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-full px-4 flex items-center gap-1 text-sm font-medium transition-colors ${
          open ? "bg-primary text-primary-fg" : "text-gray-700 hover:bg-primary hover:text-primary-fg"
        }`}
      >
        <span>{t("collections")}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
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

      {open && (
        <>
          <div
            className="fixed top-24 left-0 right-0 bottom-0 backdrop-blur-sm bg-black/10 z-[199]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-md z-[200] w-max p-[1px]">
            <ul className="flex flex-col">
                {collections.map((col) => (
                  <li key={col.id}>
                    <LocalizedClientLink
                      href={`/collections/${col.handle}`}
                      className="block pl-2 pr-[50px] py-2 text-sm text-gray-700 rounded-sm hover:bg-primary hover:text-primary-fg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {col.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
          </div>
        </>
      )}
    </div>
  )
}

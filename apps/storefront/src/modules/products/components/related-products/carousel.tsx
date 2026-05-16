"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeftMini, ArrowRightMini } from "@medusajs/icons"

export default function RelatedProductsCarousel({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations("relatedProducts")
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement
    const amount = card ? card.offsetWidth : 280

    if (dir === "right") {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior })
      } else {
        el.scrollBy({ left: amount, behavior: "smooth" })
      }
    } else {
      const atStart = el.scrollLeft <= 2
      if (atStart) {
        el.scrollTo({ left: el.scrollWidth, behavior: "instant" as ScrollBehavior })
      } else {
        el.scrollBy({ left: -amount, behavior: "smooth" })
      }
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div className="flex flex-col items-start gap-2">
          <span className="text-base-regular text-gray-600">
            {t("heading")}
          </span>
          <p className="text-2xl-regular text-ui-fg-base max-w-lg">
            {t("subheading")}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 ml-4">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
            aria-label="Previous"
          >
            <ArrowLeftMini />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
            aria-label="Next"
          >
            <ArrowRightMini />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden border-l border-t border-b border-gray-200"
      >
        {children}
      </div>
    </div>
  )
}

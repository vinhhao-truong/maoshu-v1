"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { clearCart } from "@lib/data/cart"
import ConfirmModal from "@modules/common/components/confirm-modal"
import { themeForCategory } from "@lib/util/theme"
import { useTranslations } from "next-intl"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryDropdown({ categories }: Props) {
  const t = useTranslations("cart")
  const [selected, setSelected] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
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
    setOpen(false)
    if (selected && selected.id !== category.id) {
      setPending(category)
      return
    }
    applySwitch(category)
  }

  const applySwitch = (category: HttpTypes.StoreProductCategory) => {
    localStorage.setItem("selectedCategoryId", category.id)
    document.cookie = `selectedCategoryId=${category.id}; path=/; max-age=31536000`
    window.dispatchEvent(new CustomEvent("selectedCategoryChanged", { detail: { id: category.id } }))
    setSelected(category)
    window.location.href = `/${countryCode}`
  }

  const handleConfirm = async () => {
    if (!pending) return
    setIsConfirming(true)
    await clearCart()
    applySwitch(pending)
    setPending(null)
    setIsConfirming(false)
  }

  const handleCancel = () => setPending(null)

  return (
    <>
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

        {/* Dropdown */}
        {open && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 min-w-[160px] bg-white border border-ui-border-base shadow-md z-50"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {categories.map((category) => {
              const isSelected = selected?.id === category.id
              return (
                <button
                  key={category.id}
                  data-theme={themeForCategory(category)}
                  onClick={() => !isSelected && handleSelect(category)}
                  className={`w-full text-center px-4 py-2.5 text-sm text-primary transition-colors ${
                    isSelected
                      ? "font-semibold cursor-default"
                      : "opacity-60 hover:opacity-100 hover:bg-ui-bg-subtle"
                  }`}
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pending}
        title={t("switchCategoryTitle")}
        description={t("switchCategoryDesc")}
        confirmLabel={t("switchCategoryConfirm")}
        cancelLabel={t("switchCategoryCancel")}
        confirmVariant="danger"
        isLoading={isConfirming}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  )
}

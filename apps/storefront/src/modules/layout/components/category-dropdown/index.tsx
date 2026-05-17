"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { clearCart } from "@lib/data/cart"
import ConfirmModal from "@modules/common/components/confirm-modal"
import { clx } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategorySwitch({ categories }: Props) {
  const t = useTranslations("cart")
  const [selected, setSelected] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [pending, setPending] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const params = useParams()
  const countryCode = params.countryCode as string

  useEffect(() => {
    const id = localStorage.getItem("selectedCategoryId")
    if (id) {
      const match = categories.find((c) => c.id === id)
      setSelected(match ?? null)
    }
  }, [categories])

  const handleSelect = (category: HttpTypes.StoreProductCategory) => {
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
      <div className="flex items-center bg-black/15 rounded-full p-0.5">
        {categories.map((category) => {
          const isSelected = selected?.id === category.id
          return (
            <button
              key={category.id}
              onClick={() => !isSelected && handleSelect(category)}
              className={clx(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                isSelected
                  ? "bg-white text-primary shadow-sm cursor-default"
                  : "text-primary-fg/70 hover:text-primary-fg"
              )}
            >
              {category.name}
            </button>
          )
        })}
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

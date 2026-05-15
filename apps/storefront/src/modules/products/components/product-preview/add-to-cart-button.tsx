"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { VariantPrice } from "types/global"

type Props = {
  product: HttpTypes.StoreProduct
  price?: VariantPrice | null
}

export default function AddToCartButton({ product, price }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const t = useTranslations("products")

  const singleVariant =
    product.variants?.length === 1 ? product.variants[0] : null

  const inStock = singleVariant
    ? !singleVariant.manage_inventory ||
      singleVariant.allow_backorder ||
      (singleVariant.inventory_quantity ?? 0) > 0
    : true

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!singleVariant) {
      router.push(`/${countryCode}/products/${product.handle}`)
      return
    }

    setIsAdding(true)
    await addToCart({
      variantId: singleVariant.id!,
      quantity: 1,
      countryCode,
    })
    setIsAdding(false)
  }

  const label = !singleVariant
    ? t("selectVariant")
    : !inStock
    ? t("outOfStock")
    : t("addToCart")

  return (
    <button
      onClick={handleClick}
      disabled={!!singleVariant && (!inStock || isAdding)}
      className="group/btn w-full flex items-stretch border border-black rounded-sm overflow-hidden disabled:opacity-50 disabled:pointer-events-none"
      data-testid="add-to-cart-preview-button"
    >
      <span className="flex-1 h-8 px-3 flex items-center bg-white text-black">
        {price && (
          <span className="flex items-center gap-x-1">
            {price.price_type === "sale" && (
              <span className="line-through text-xs opacity-50">
                {price.original_price}
              </span>
            )}
            <span
              className={clx("text-xs font-medium", {
                "text-red-600": price.price_type === "sale",
              })}
            >
              {price.calculated_price}
            </span>
          </span>
        )}
      </span>
      <span
        className="h-8 pr-3 pl-10 -ml-8 flex items-center bg-black text-white text-xs whitespace-nowrap transition-colors duration-200 group-hover/btn:bg-gray-800"
        style={{ clipPath: "path('M 32 0 A 16 16 0 0 0 32 32 L 9999 32 L 9999 0 Z')" }}
      >
        <span className="relative flex items-center justify-center">
          <span className={isAdding ? "invisible" : ""}>{label}</span>
          {isAdding && (
            <span className="absolute flex items-center gap-x-0.5">
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

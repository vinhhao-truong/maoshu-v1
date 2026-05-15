"use client"

import { addToCart } from "@lib/data/cart"
import { ShoppingCartSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  product: HttpTypes.StoreProduct
}

export default function AddToCartButton({ product }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
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

  return (
    <Button
      onClick={handleClick}
      disabled={!!singleVariant && (!inStock || isAdding)}
      variant="primary"
      size="small"
      className="rounded-none px-2"
      isLoading={isAdding}
      data-testid="add-to-cart-preview-button"
    >
      <ShoppingCartSolid />
    </Button>
  )
}

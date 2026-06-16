"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import AddToCartModal from "@modules/products/components/add-to-cart-modal"
import BusinessInfoPopup, { type BusinessInfoPopupHandle } from "@modules/layout/components/business-info-popup"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  rootCategoryId?: string
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  rootCategoryId,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("products")

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const countryCode = useParams().countryCode as string
  const businessInfoRef = useRef<BusinessInfoPopupHandle>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const openModal = () => {
    if (!selectedVariant?.id) return
    setModalOpen(true)
  }

  const handleAddToCart = async (qty: number) => {
    if (!selectedVariant?.id) return

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: qty,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="grid grid-cols-2 gap-x-2">
          <Button
            onClick={openModal}
            disabled={
              !isMounted ||
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="h-10"
            isLoading={!isMounted || isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? t("selectVariant")
              : !inStock || !isValidVariant
              ? t("outOfStock")
              : t("addToCart")}
          </Button>
          <Button
            variant="secondary"
            className="h-10"
            onClick={() => businessInfoRef.current?.open()}
          >
            {t("contactUs")}
          </Button>
        </div>

        <BusinessInfoPopup ref={businessInfoRef} rootCategoryId={rootCategoryId} />

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={openModal}
          isAdding={isAdding}
          isMounted={isMounted}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
        {selectedVariant && (
          <AddToCartModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={handleAddToCart}
            product={product}
            variant={selectedVariant}
            isAdding={isAdding}
          />
        )}
      </div>
    </>
  )
}

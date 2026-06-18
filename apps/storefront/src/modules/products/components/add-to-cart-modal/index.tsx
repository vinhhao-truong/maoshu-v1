"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { isEqual } from "lodash"
import { retrieveCart } from "@lib/data/cart"
import { trackProductView } from "@lib/data/product-stats"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { Button, clx } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import X from "@modules/common/icons/x"
import Thumbnail from "@modules/products/components/thumbnail"
import OptionSelect from "@modules/products/components/product-actions/option-select"

type AddToCartModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (qty: number, variantId: string) => Promise<void>
  product: HttpTypes.StoreProduct
  initialVariant?: HttpTypes.StoreProductVariant
  isAdding: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
): Record<string, string> =>
  variantOptions?.reduce((acc: Record<string, string>, o) => {
    if (o.option_id) acc[o.option_id] = o.value
    return acc
  }, {}) ?? {}

const hasRealOptions = (product: HttpTypes.StoreProduct) =>
  (product.variants?.length ?? 0) > 1

export default function AddToCartModal({
  open,
  onClose,
  onConfirm,
  product,
  initialVariant,
  isAdding,
}: AddToCartModalProps) {
  const t = useTranslations("addToCartModal")
  const pathname = usePathname()
  const [qty, setQty] = useState(1)
  const [inputValue, setInputValue] = useState("1")
  const [inCart, setInCart] = useState<number | null>(0)
  const [options, setOptions] = useState<Record<string, string>>({})

  const showVariantSelector = hasRealOptions(product)

  // Reset form state and seed options from initialVariant each time modal opens
  useEffect(() => {
    if (!open) return
    setQty(1)
    setInputValue("1")
    setOptions(initialVariant?.options ? optionsAsKeymap(initialVariant.options) : {})
  }, [open, initialVariant])

  // Resolve selected variant from current options
  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return undefined
    return product.variants.find((v) =>
      isEqual(optionsAsKeymap(v.options), options)
    )
  }, [product.variants, options])

  const maxInventory =
    selectedVariant?.manage_inventory && !selectedVariant?.allow_backorder
      ? (selectedVariant?.inventory_quantity ?? 0)
      : Infinity

  const maxAddable =
    inCart !== null ? Math.max(0, maxInventory - inCart) : Infinity

  // Fetch cart quantity whenever the resolved variant changes
  useEffect(() => {
    if (!open || !selectedVariant?.id) {
      setInCart(0)
      return
    }
    setInCart(null) // show loading only while actively fetching
    retrieveCart().then((cart) => {
      if (!cart) { setInCart(0); return }
      const line = cart.items?.find((i) => i.variant_id === selectedVariant.id)
      setInCart(line?.quantity ?? 0)
    })
  }, [open, selectedVariant?.id])

  // Clamp qty once inCart loads
  useEffect(() => {
    if (inCart === null) return
    if (qty > maxAddable) {
      const clamped = Math.max(1, maxAddable)
      setQty(clamped)
      setInputValue(String(clamped))
    }
  }, [inCart])

  const applyQty = (next: number) => {
    const clamped = Math.min(Math.max(1, next), maxAddable)
    setQty(clamped)
    setInputValue(String(clamped))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 1) setQty(Math.min(parsed, maxAddable))
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    applyQty(isNaN(parsed) ? 1 : parsed)
  }

  const handleConfirm = async () => {
    if (!selectedVariant?.id) return
    await onConfirm(qty, selectedVariant.id)
    if (!pathname.includes("/products/")) {
      trackProductView(product.id)
    }
    onClose()
  }

  const variantLabel = selectedVariant?.options?.map((o) => o.value).join(" / ")

  const { variantPrice, cheapestPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })
  const displayPrice = selectedVariant ? variantPrice : cheapestPrice

  const totalPrice = displayPrice
    ? convertToLocale({
        amount: displayPrice.calculated_price_number * qty,
        currency_code: displayPrice.currency_code,
      })
    : null
  const totalOriginalPrice = displayPrice?.price_type === "sale"
    ? convertToLocale({
        amount: displayPrice.original_price_number * qty,
        currency_code: displayPrice.currency_code,
      })
    : null

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <Dialog.Title className="text-sm font-semibold text-ui-fg-base uppercase tracking-wider">
                  {t("title")}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 flex flex-col gap-y-5">
                {/* Thumbnail */}
                <div className="w-28 mx-auto">
                  <Thumbnail
                    thumbnail={product.thumbnail}
                    images={product.images}
                    size="full"
                    flat
                  />
                </div>

                {/* Product name + variant */}
                <div className="flex flex-col gap-y-0.5 text-center">
                  <span className="text-base font-semibold text-ui-fg-base">
                    {product.title}
                  </span>
                  {variantLabel && variantLabel !== "Default option value" && (
                    <span className="text-sm text-ui-fg-subtle">{variantLabel}</span>
                  )}
                </div>

                {/* Variant selectors */}
                {showVariantSelector && (
                  <div className="flex flex-col gap-y-3">
                    {(product.options ?? []).map((option) => (
                      <OptionSelect
                        key={option.id}
                        option={option}
                        current={options[option.id]}
                        updateOption={(optionId, value) =>
                          setOptions((prev) => ({ ...prev, [optionId]: value }))
                        }
                        title={option.title ?? ""}
                        disabled={isAdding}
                      />
                    ))}
                  </div>
                )}

                {/* Quantity stepper — hidden for multi-variant until a variant is chosen */}
                {(!showVariantSelector || selectedVariant) && (
                  <>
                    {/* Quantity stepper */}
                    <div className="flex flex-col items-center gap-y-2">
                      <div className="flex items-center justify-center gap-x-3">
                        <button
                          onClick={() => applyQty(qty - 1)}
                          disabled={qty <= 1}
                          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-xl hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={maxAddable === Infinity ? undefined : maxAddable}
                          value={inputValue}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          disabled={isAdding || maxAddable === 0}
                          className="w-16 h-9 border border-gray-300 text-center text-lg font-bold text-ui-fg-base focus:border-black focus:outline-none tabular-nums disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label="Quantity"
                        />
                        <button
                          onClick={() => applyQty(qty + 1)}
                          disabled={qty >= maxAddable}
                          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-xl hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      {maxInventory !== Infinity && inCart !== null && (
                        <span className="text-xs text-ui-fg-subtle">
                          {maxAddable <= 0
                            ? t("noMoreAvailable")
                            : t("remainingStock", { count: maxAddable })}
                        </span>
                      )}
                      {totalPrice && (
                        <div className="flex items-center justify-center gap-x-2">
                          {totalOriginalPrice && (
                            <span className="text-sm text-ui-fg-muted line-through">
                              {totalOriginalPrice}
                            </span>
                          )}
                          <span
                            className={clx("text-lg font-bold", {
                              "text-ui-fg-interactive": displayPrice?.price_type === "sale",
                              "text-ui-fg-base": displayPrice?.price_type !== "sale",
                            })}
                          >
                            {totalPrice}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cart breakdown */}
                    <div className="flex flex-col gap-y-2 text-sm bg-gray-50 px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span className="text-ui-fg-subtle">{t("inCart")}</span>
                        <span className="font-medium text-ui-fg-base tabular-nums">
                          {inCart === null
                            ? <span className="inline-block w-14 h-3 bg-gray-200 animate-pulse rounded" />
                            : t("items", { count: inCart })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ui-fg-subtle">{t("adding")}</span>
                        <span className="font-medium text-ui-fg-base tabular-nums">
                          {t("items", { count: qty })}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 my-1" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-ui-fg-base">{t("totalAfter")}</span>
                        <span className="font-bold text-ui-fg-base tabular-nums">
                          {inCart === null
                            ? <span className="inline-block w-14 h-3 bg-gray-200 animate-pulse rounded" />
                            : t("items", { count: inCart + qty })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-x-3 px-6 pb-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isAdding}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirm}
                  isLoading={isAdding}
                  disabled={isAdding || !selectedVariant || maxAddable === 0}
                >
                  {t("addToCart")}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { retrieveCart } from "@lib/data/cart"
import { Button } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import X from "@modules/common/icons/x"
import Thumbnail from "@modules/products/components/thumbnail"

type AddToCartModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (qty: number) => Promise<void>
  product: HttpTypes.StoreProduct
  variant: HttpTypes.StoreProductVariant
  isAdding: boolean
}

export default function AddToCartModal({
  open,
  onClose,
  onConfirm,
  product,
  variant,
  isAdding,
}: AddToCartModalProps) {
  const t = useTranslations("addToCartModal")
  const [qty, setQty] = useState(1)
  const [inputValue, setInputValue] = useState("1")
  const [inCart, setInCart] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setQty(1)
    setInputValue("1")
    setInCart(null)
    retrieveCart().then((cart) => {
      if (!cart) { setInCart(0); return }
      const line = cart.items?.find((i) => i.variant_id === variant.id)
      setInCart(line?.quantity ?? 0)
    })
  }, [open, variant.id])

  const applyQty = (next: number) => {
    const clamped = Math.max(1, next)
    setQty(clamped)
    setInputValue(String(clamped))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 1) setQty(parsed)
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    applyQty(isNaN(parsed) ? 1 : parsed)
  }

  const handleConfirm = async () => {
    await onConfirm(qty)
    onClose()
  }

  const variantLabel = variant.options?.map((o) => o.value).join(" / ")

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
                  {variantLabel && (
                    <span className="text-sm text-ui-fg-subtle">{variantLabel}</span>
                  )}
                </div>

                {/* Quantity stepper */}
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
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    disabled={isAdding}
                    className="w-16 h-9 border border-gray-300 text-center text-lg font-bold text-ui-fg-base focus:border-black focus:outline-none tabular-nums disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => applyQty(qty + 1)}
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 text-xl hover:border-black transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
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

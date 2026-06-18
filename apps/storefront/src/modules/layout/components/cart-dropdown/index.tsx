"use client"

import { Transition } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { XMark } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const t = useTranslations("cart")

  const close = () => setCartDropdownOpen(false)
  const toggle = () => setCartDropdownOpen((v) => !v)

  const totalItems = cartState?.items?.length || 0
  const subtotal = cartState?.total ?? 0

  const pathname = usePathname()
  useEffect(() => { close() }, [pathname])

  return (
    <div className="h-full z-50">
      {/* Backdrop */}
      {cartDropdownOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm pointer-events-auto"
          onClick={close}
        />
      )}

      {/* Trigger */}
      <button
        onClick={toggle}
        className="hover:text-primary-fg/80 flex items-center h-full"
        data-testid="nav-cart-link"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-white text-primary text-[9px] font-medium leading-none">
            {totalItems}
          </span>
        </div>
      </button>

      {/* Side panel */}
      <Transition
        show={cartDropdownOpen}
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-x-4"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-4"
      >
        <div
          className="fixed right-0 top-0 h-screen sm:h-[calc(100vh-1rem)] z-[200] sm:m-2 w-full sm:w-[420px] flex flex-col bg-white sm:rounded-rounded text-ui-fg-base text-sm shadow-lg"
          data-testid="nav-cart-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h3 className="text-large-semi">{t("title")}</h3>
            <button onClick={close} data-testid="close-cart-button">
              <XMark />
            </button>
          </div>

          {cartState && cartState.items?.length ? (
            <>
              {/* Items */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 grid grid-cols-1 content-start gap-y-4 no-scrollbar">
                {cartState.items
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item) => (
                    <div
                      className="grid grid-cols-[122px_1fr] gap-x-4"
                      key={item.id}
                      data-testid="cart-item"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.product_handle}`}
                        className="w-24"
                      >
                        <Thumbnail
                          thumbnail={item.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                        />
                      </LocalizedClientLink>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                              <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                <LocalizedClientLink
                                  href={`/products/${item.product_handle}`}
                                  data-testid="product-link"
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <span
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                {t("quantity", { count: item.quantity })}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              <LineItemPrice
                                item={item}
                                style="tight"
                                currencyCode={cartState.currency_code}
                              />
                            </div>
                          </div>
                        </div>
                        <DeleteButton
                          id={item.id}
                          className="mt-1"
                          withConfirm="inline"
                          data-testid="cart-item-remove-button"
                        >
                          {t("remove")}
                        </DeleteButton>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-4 flex flex-col gap-y-3 text-small-regular border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("totalInclTax")}</span>
                  <span className="text-large-semi" data-testid="cart-subtotal" data-value={subtotal}>
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>
                <LocalizedClientLink href="/cart" passHref>
                  <Button className="w-full" size="large" data-testid="go-to-cart-button" onClick={close}>
                    {t("goToCart")}
                  </Button>
                </LocalizedClientLink>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col gap-y-3 items-center justify-center text-center px-6">
              <span>{t("empty")}</span>
              <LocalizedClientLink href="/store">
                <Button onClick={close}>{t("explore")}</Button>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </Transition>
    </div>
  )
}

export default CartDropdown

"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const t = useTranslations("cart")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(item.quantity)
  const [inputValue, setInputValue] = useState(String(item.quantity))

  useEffect(() => {
    setQty(item.quantity)
    setInputValue(String(item.quantity))
  }, [item.quantity])

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  const applyQty = (next: number) => {
    const clamped = Math.max(1, next)
    setQty(clamped)
    setInputValue(String(clamped))
    changeQuantity(clamped)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 1) setQty(parsed)
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    const clamped = Math.max(1, isNaN(parsed) ? 1 : parsed)
    setQty(clamped)
    setInputValue(String(clamped))
    if (clamped !== item.quantity) changeQuantity(clamped)
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-1">
              <button
                onClick={() => applyQty(qty - 1)}
                disabled={qty <= 1 || updating}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 text-base hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label={t("decreaseQty")}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={updating}
                className="w-12 h-7 border border-gray-300 text-center text-sm font-semibold text-ui-fg-base focus:border-black focus:outline-none tabular-nums disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                data-testid="product-select-button"
                aria-label={t("quantityLabel")}
              />
              <button
                onClick={() => applyQty(qty + 1)}
                disabled={updating}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 text-base hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label={t("increaseQty")}
              >
                +
              </button>
              {updating && <Spinner />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className={clx({ "!pr-0": type === "preview" })}>
        <span
          className={clx({
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell className="!pr-0 w-8">
          <DeleteButton id={item.id} data-testid="product-delete-button" />
        </Table.Cell>
      )}
    </Table.Row>
  )
}

export default Item

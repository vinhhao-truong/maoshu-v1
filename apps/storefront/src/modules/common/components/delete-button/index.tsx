"use client"

import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

const DeleteButton = ({
  id,
  children,
  className,
  withConfirm = true,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  /** true = popup to the right | "inline" = button swaps in-place | false = immediate delete */
  withConfirm?: boolean | "inline"
}) => {
  const t = useTranslations("cart")
  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!confirming || withConfirm !== true) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setConfirming(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [confirming, withConfirm])

  const handleDelete = async () => {
    setConfirming(false)
    setIsDeleting(true)
    await deleteLineItem(id).catch(() => setIsDeleting(false))
  }

  const handleClick = () => {
    if (isDeleting) return
    if (withConfirm === false) {
      handleDelete()
    } else {
      setConfirming((v) => !v)
    }
  }

  // Inline mode: replace the button with two side-by-side buttons
  if (withConfirm === "inline" && confirming) {
    return (
      <div className={clx("flex items-center gap-x-1 text-small-regular", className)}>
        <button
          onClick={handleDelete}
          className="flex-1 h-6 px-2 text-xs bg-danger text-danger-fg hover:bg-danger-hover transition-colors whitespace-nowrap"
        >
          {t("removeConfirm")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 h-6 px-2 text-xs border border-gray-300 hover:border-black transition-colors whitespace-nowrap"
        >
          {t("removeCancel")}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={clx("relative flex items-center justify-between text-small-regular", className)}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={handleClick}
        aria-label={t("remove")}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>

      {withConfirm === true && confirming && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 w-44 bg-white border border-gray-200 shadow-lg p-3 flex flex-col gap-y-2">
          <span className="text-xs font-medium text-ui-fg-base">{t("removeConfirmTitle")}</span>
          <div className="flex gap-x-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 h-7 text-xs border border-gray-300 hover:border-black transition-colors"
            >
              {t("removeCancel")}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 h-7 text-xs bg-danger text-danger-fg hover:bg-danger-hover transition-colors"
            >
              {t("removeConfirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteButton

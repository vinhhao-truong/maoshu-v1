"use client"

import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48]

export function Pagination({
  page,
  totalPages,
  limit,
  'data-testid': dataTestid,
}: {
  page: number
  totalPages: number
  limit: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("store")

  const navigate = (params: URLSearchParams) =>
    router.push(`${pathname}?${params.toString()}`)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    navigate(params)
  }

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("limit", newLimit.toString())
    params.set("page", "1")
    navigate(params)
  }

  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, i) => start + i)

  const renderPageButton = (p: number, label: string | number, isCurrent: boolean) => (
    <button
      key={p}
      className={clx("txt-xlarge-plus text-primary/50 transition-colors", {
        "bg-primary text-primary-fg px-1.5": isCurrent,
        "hover:text-primary": !isCurrent,
      })}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  const renderEllipsis = (key: string) => (
    <span key={key} className="txt-xlarge-plus text-primary/50 cursor-default">
      ...
    </span>
  )

  const renderPageButtons = () => {
    const buttons = []
    if (totalPages <= 7) {
      buttons.push(...arrayRange(1, totalPages).map((p) => renderPageButton(p, p, p === page)))
    } else if (page <= 4) {
      buttons.push(...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page)))
      buttons.push(renderEllipsis("e1"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    } else if (page >= totalPages - 3) {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("e2"))
      buttons.push(...arrayRange(totalPages - 4, totalPages).map((p) => renderPageButton(p, p, p === page)))
    } else {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("e3"))
      buttons.push(...arrayRange(page - 1, page + 1).map((p) => renderPageButton(p, p, p === page)))
      buttons.push(renderEllipsis("e4"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    }
    return buttons
  }

  return (
    <div className="flex items-center justify-between w-full mt-12" data-testid={dataTestid}>
      {/* Left: prev / page buttons / next */}
      <div className="flex items-center gap-x-3">
        {totalPages > 1 && (
          <>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="txt-xlarge-plus text-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              ←
            </button>
            <div className="flex gap-3 items-end">{renderPageButtons()}</div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="txt-xlarge-plus text-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Right: per-page selector + page count */}
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2 text-xs text-primary/50">
          <span>{t("perPage")}:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => handleLimitChange(size)}
              className={clx("px-2 py-0.5 transition-colors duration-150", {
                "bg-primary text-primary-fg": size === limit,
                "text-primary/50 hover:text-primary": size !== limit,
              })}
            >
              {size}
            </button>
          ))}
        </div>
        <span className="text-xs text-primary/50 tabular-nums">
          {page} / {totalPages}
        </span>
      </div>
    </div>
  )
}

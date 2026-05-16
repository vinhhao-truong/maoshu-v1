import { Text } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type PriceRangeFilterProps = {
  priceMin: string
  priceMax: string
  onApply: (min: string, max: string) => void
}

const PriceRangeFilter = ({ priceMin, priceMax, onApply }: PriceRangeFilterProps) => {
  const t = useTranslations("store")
  const [min, setMin] = useState(priceMin)
  const [max, setMax] = useState(priceMax)

  useEffect(() => { setMin(priceMin) }, [priceMin])
  useEffect(() => { setMax(priceMax) }, [priceMax])

  const isInvalid =
    min !== "" && max !== "" && parseFloat(min) > parseFloat(max)

  const tryApply = () => {
    if (!isInvalid) onApply(min, max)
  }

  const clear = () => {
    setMin("")
    setMax("")
    onApply("", "")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") tryApply()
  }

  const inputClass = (invalid: boolean) =>
    `w-[88px] border rounded px-2 py-1 text-xs text-ui-fg-base bg-white focus:outline-none focus:ring-1 transition-colors ${
      invalid
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-200 focus:ring-gray-900"
    }`

  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{t("priceRange")}</Text>
      <div className="flex flex-col gap-y-1.5">
        <div className="flex items-center gap-x-2">
          <input
            type="number"
            placeholder={t("minPrice")}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClass(isInvalid)}
            min={0}
          />
          <span className="text-ui-fg-muted text-xs">—</span>
          <input
            type="number"
            placeholder={t("maxPrice")}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClass(isInvalid)}
            min={0}
          />
        </div>
        {isInvalid && (
          <p className="text-[11px] text-red-500">{t("priceRangeError")}</p>
        )}
      </div>
      <div className="flex items-center gap-x-2">
        <button
          onClick={tryApply}
          disabled={isInvalid}
          className="text-[11px] bg-gray-900 text-white px-2 py-0.5 hover:bg-gray-700 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("apply")}
        </button>
        <button
          onClick={clear}
          className="text-[11px] text-ui-fg-subtle hover:text-ui-fg-base transition-colors duration-150"
        >
          {t("clear")}
        </button>
      </div>
    </div>
  )
}

export default PriceRangeFilter

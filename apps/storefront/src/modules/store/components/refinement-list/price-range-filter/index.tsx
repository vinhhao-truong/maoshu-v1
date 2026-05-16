import { Text } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type PriceRangeFilterProps = {
  priceMin: string
  priceMax: string
  setQueryParams: (name: string, value: string) => void
}

const PriceRangeFilter = ({ priceMin, priceMax, setQueryParams }: PriceRangeFilterProps) => {
  const t = useTranslations("store")
  const [min, setMin] = useState(priceMin)
  const [max, setMax] = useState(priceMax)

  useEffect(() => { setMin(priceMin) }, [priceMin])
  useEffect(() => { setMax(priceMax) }, [priceMax])

  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{t("priceRange")}</Text>
      <div className="flex items-center gap-x-2">
        <input
          type="number"
          placeholder={t("minPrice")}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onBlur={() => setQueryParams("priceMin", min)}
          className="w-[88px] border border-gray-200 rounded px-2 py-1 text-xs text-ui-fg-base bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          min={0}
        />
        <span className="text-ui-fg-muted text-xs">—</span>
        <input
          type="number"
          placeholder={t("maxPrice")}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={() => setQueryParams("priceMax", max)}
          className="w-[88px] border border-gray-200 rounded px-2 py-1 text-xs text-ui-fg-base bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          min={0}
        />
      </div>
    </div>
  )
}

export default PriceRangeFilter

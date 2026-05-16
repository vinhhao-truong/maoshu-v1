"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useTranslations } from "next-intl"

export type SortOptions = "price_asc" | "price_desc" | "created_at" | "title_asc" | "title_desc"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const t = useTranslations("store")

  const sortOptions = [
    {
      value: "created_at",
      label: t("latestArrivals"),
    },
    {
      value: "price_asc",
      label: t("priceLowHigh"),
    },
    {
      value: "price_desc",
      label: t("priceHighLow"),
    },
    {
      value: "title_asc",
      label: t("nameAZ"),
    },
    {
      value: "title_desc",
      label: t("nameZA"),
    },
  ]

  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  return (
    <FilterRadioGroup
      title={t("sortBy")}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts

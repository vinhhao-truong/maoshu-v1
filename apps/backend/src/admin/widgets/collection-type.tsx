import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Select } from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const COLLECTION_TYPE_KEYS = ["new_release", "trending", "best_selling", "other"] as const

const CollectionTypeWidget = () => {
  const { t } = useTranslation()
  const [value, setValue] = useState("")

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest flex flex-col gap-y-3">
      <p className="txt-compact-small-plus text-ui-fg-subtle font-medium uppercase tracking-wider">
        {t("collectionType.title")}
      </p>
      <Select value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder={t("collectionType.placeholder")} />
        </Select.Trigger>
        <Select.Content>
          {COLLECTION_TYPE_KEYS.map((key) => (
            <Select.Item key={key} value={key}>
              {t(`collectionType.types.${key}`)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.before",
})

export default CollectionTypeWidget

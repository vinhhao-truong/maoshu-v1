import { Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type SubcategoryFilterProps = {
  subcategories: HttpTypes.StoreProductCategory[]
  currentSubcategoryId: string
  setQueryParams: (name: string, value: string) => void
}

const SubcategoryFilter = ({
  subcategories,
  currentSubcategoryId,
  setQueryParams,
}: SubcategoryFilterProps) => {
  const t = useTranslations("store")

  const toggle = (id: string) => {
    setQueryParams("subcategoryId", currentSubcategoryId === id ? "" : id)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{t("subcategories")}</Text>
      <ul className="flex flex-col gap-y-2">
        {subcategories.map((sub) => {
          const checked = currentSubcategoryId === sub.id
          return (
            <li key={sub.id}>
              <button
                onClick={() => toggle(sub.id)}
                className="flex items-center gap-x-2 text-left w-full group"
              >
                <span
                  className={`w-4 h-4 shrink-0 rounded-sm border transition-colors duration-150 flex items-center justify-center ${
                    checked
                      ? "bg-ui-fg-base border-ui-fg-base"
                      : "border-gray-300 group-hover:border-ui-fg-base"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm transition-colors duration-150 ${
                    checked ? "font-semibold text-ui-fg-base" : "text-ui-fg-subtle group-hover:text-ui-fg-base"
                  }`}
                >
                  {sub.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SubcategoryFilter

import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"
import React from "react"

const Help = async () => {
  const t = await getTranslations("order")

  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{t("needHelp")}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">{t("contact")}</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {t("returnsExchanges")}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help

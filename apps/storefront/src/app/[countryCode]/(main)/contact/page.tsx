import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BusinessInfoDetails from "@modules/common/components/business-info-details"
import { getBusinessInfo } from "@lib/data/business-info"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact")
  return {
    title: t("title"),
    description: t("breadcrumbCurrent"),
  }
}

export default async function ContactPage() {
  const [t, info] = await Promise.all([
    getTranslations("contact"),
    getBusinessInfo(process.env.ROOT_CATEGORY_ID),
  ])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="content-container py-3">
          <nav className="flex items-center gap-x-2 text-sm text-gray-500">
            <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors">
              {t("breadcrumbHome")}
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-gray-800">{t("breadcrumbCurrent")}</span>
          </nav>
        </div>
      </div>

      <div className="content-container py-10 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl-semi mb-10 text-gray-900">{t("title")}</h1>

          <BusinessInfoDetails
            info={info}
            labels={{
              email: t("email"),
              phone: t("phone"),
              address: t("address"),
              businessHours: t("businessHours"),
              socialMedia: t("socialMedia"),
              noInfo: t("noInfo"),
            }}
          />
        </div>
      </div>
    </div>
  )
}

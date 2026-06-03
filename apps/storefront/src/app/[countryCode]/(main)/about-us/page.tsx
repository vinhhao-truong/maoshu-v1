import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBusinessInfo } from "@lib/data/business-info"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutUs")
  return {
    title: t("title"),
    description: t("breadcrumbCurrent"),
  }
}

export default async function AboutUsPage() {
  const [t, info] = await Promise.all([
    getTranslations("aboutUs"),
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
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl-semi mb-8 text-gray-900">{t("title")}</h1>
          {info?.about_us ? (
            <div
              className="text-gray-700 leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary-hover [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4 [&_strong]:font-semibold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: info.about_us }}
            />
          ) : (
            <p className="text-gray-400 italic">{t("comingSoon")}</p>
          )}
        </div>
      </div>
    </div>
  )
}

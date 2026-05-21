import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBusinessInfo } from "@lib/data/business-info"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact")
  return {
    title: t("title"),
    description: t("breadcrumbCurrent"),
  }
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-x-4">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col gap-y-0.5">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="text-gray-900">{children}</div>
      </div>
    </div>
  )
}

const socialLinks = [
  {
    key: "facebook_url" as const,
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram_url" as const,
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    key: "tiktok_url" as const,
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
      </svg>
    ),
  },
  {
    key: "youtube_url" as const,
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "twitter_url" as const,
    label: "X / Twitter",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "zalo_url" as const,
    label: "Zalo",
    icon: (
      <svg viewBox="0 0 48 48" fill="currentColor" className="h-5 w-5">
        <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm-4.5 27.5h-2.25v-9h2.25v9zm-1.125-10.35a1.35 1.35 0 110-2.7 1.35 1.35 0 010 2.7zm14.625 10.35h-2.1l-4.35-6.15V31.5H24.3v-9h2.1l4.35 6.15V22.5h2.25v9z" />
      </svg>
    ),
  },
]

export default async function ContactPage() {
  const [t, info] = await Promise.all([
    getTranslations("contact"),
    getBusinessInfo(),
  ])

  const addressParts = [
    info?.address_line1,
    info?.address_line2,
    [info?.city, info?.state, info?.postal_code].filter(Boolean).join(", "),
    info?.country,
  ].filter(Boolean)

  const hasSocial = socialLinks.some((s) => !!(info as any)?.[s.key])

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

          {!info ? (
            <p className="text-gray-400 italic">{t("noInfo")}</p>
          ) : (
            <div className="flex flex-col gap-y-8">
              {/* Email */}
              {info.email && (
                <ContactRow
                  label={t("email")}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  }
                >
                  <a href={`mailto:${info.email}`} className="text-primary hover:underline">
                    {info.email}
                  </a>
                </ContactRow>
              )}

              {/* Phone */}
              {info.phone && (
                <ContactRow
                  label={t("phone")}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  }
                >
                  <a href={`tel:${info.phone}`} className="text-primary hover:underline">
                    {info.phone}
                  </a>
                </ContactRow>
              )}

              {/* Address */}
              {addressParts.length > 0 && (
                <ContactRow
                  label={t("address")}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  }
                >
                  <address className="not-italic leading-relaxed text-gray-900">
                    {addressParts.map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </address>
                </ContactRow>
              )}

              {/* Business Hours */}
              {info.business_hours && (
                <ContactRow
                  label={t("businessHours")}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                    {info.business_hours}
                  </pre>
                </ContactRow>
              )}

              {/* Social Media */}
              {hasSocial && (
                <div className="flex flex-col gap-y-3">
                  <span className="text-sm font-medium text-gray-500">{t("socialMedia")}</span>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map(({ key, label, icon }) => {
                      const url = (info as any)[key] as string | null
                      if (!url) return null
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-x-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-primary hover:text-primary"
                        >
                          {icon}
                          {label}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

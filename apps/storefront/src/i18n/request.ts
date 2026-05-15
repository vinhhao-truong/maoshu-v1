import { getRequestConfig } from "next-intl/server"
import { getLocale } from "@lib/data/locale-actions"

export default getRequestConfig(async () => {
  const locale = (await getLocale()) ?? "vi"
  const messages =
    locale === "en"
      ? (await import("../../messages/en.json")).default
      : (await import("../../messages/vi.json")).default
  return { locale, messages }
})

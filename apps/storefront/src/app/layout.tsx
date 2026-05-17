import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import NextTopLoader from "nextjs-toploader"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} data-mode="light">
      <body>
        <NextTopLoader color="#ffffff" height={3} showSpinner={false} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <main className="relative">{props.children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

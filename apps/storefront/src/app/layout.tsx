import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import NextTopLoader from "nextjs-toploader"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-mode="light">
      <body>
        <NextTopLoader color="#111827" height={3} showSpinner={false} />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

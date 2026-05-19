import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about us",
}

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="content-container py-3">
          <nav className="flex items-center gap-x-2 text-sm text-gray-500">
            <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors">
              Home
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-gray-800">About Us</span>
          </nav>
        </div>
      </div>

      <div className="content-container py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl-semi mb-6 text-gray-900">About Us</h1>
          <p className="text-gray-400 italic">Coming soon.</p>
        </div>
      </div>
    </div>
  )
}

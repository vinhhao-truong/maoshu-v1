import { Metadata } from "next"
import { listPublishedContent } from "@lib/data/content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Announcements",
  description: "Latest announcements",
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function AnnouncementsListPage() {
  const items = await listPublishedContent("announcement")

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="content-container py-3">
          <nav className="flex items-center gap-x-2 text-sm text-gray-500">
            <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors">
              Home
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-gray-800">Announcements</span>
          </nav>
        </div>
      </div>

      <div className="content-container py-10 md:py-16">
        <h1 className="text-3xl-semi mb-10 text-gray-900">Announcements</h1>

        {items.length === 0 ? (
          <p className="text-gray-400 italic">No announcements yet.</p>
        ) : (
          <div className="flex flex-col gap-y-6">
            {items.map((item) => (
              <LocalizedClientLink
                key={item.id}
                href={`/announcement/${item.handle}`}
                className="group flex gap-x-6 rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {item.thumbnail_url && (
                  <div className="hidden sm:block shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="object-cover"
                      style={{ width: 120, height: 90 }}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-y-1">
                  {formatDate(item.published_at) && (
                    <span className="text-xs text-gray-400">
                      {formatDate(item.published_at)}
                    </span>
                  )}
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
                  )}
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

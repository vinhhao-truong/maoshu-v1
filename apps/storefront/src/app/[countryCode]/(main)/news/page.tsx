import { Metadata } from "next"
import { listPublishedContent } from "@lib/data/content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates",
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function NewsListPage() {
  const items = await listPublishedContent("news")

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="content-container py-3">
          <nav className="flex items-center gap-x-2 text-sm text-gray-500">
            <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors">
              Home
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-gray-800">News</span>
          </nav>
        </div>
      </div>

      <div className="content-container py-10 md:py-16">
        <h1 className="text-3xl-semi mb-10 text-gray-900">News</h1>

        {items.length === 0 ? (
          <p className="text-gray-400 italic">No news articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LocalizedClientLink
                key={item.id}
                href={`/news/${item.handle}`}
                className="group flex flex-col gap-y-3"
              >
                {item.thumbnail_url ? (
                  <div className="overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ height: 200 }}
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-gray-300 text-sm">No image</span>
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

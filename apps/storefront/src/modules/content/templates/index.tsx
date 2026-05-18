import { ContentItem } from "@lib/data/content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const TYPE_LABELS: Record<string, string> = {
  news: "News",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  return_policy: "Return Policy",
  faq: "FAQ",
  announcement: "Announcement",
}

const TYPE_BASE_PATHS: Record<string, string> = {
  news: "/news",
  announcement: "/announcement",
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ContentTemplate({ content }: { content: ContentItem }) {
  const isArticle = content.type === "news" || content.type === "announcement"
  const typeLabel = TYPE_LABELS[content.type] ?? content.type
  const basePath = TYPE_BASE_PATHS[content.type] ?? "/content"
  const publishDate = formatDate(content.published_at)

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="content-container py-3">
          <nav className="flex items-center gap-x-2 text-sm text-gray-500">
            <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors">
              Home
            </LocalizedClientLink>
            <span>/</span>
            <LocalizedClientLink href={basePath} className="hover:text-gray-800 transition-colors">
              {typeLabel}
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-gray-800">{content.title}</span>
          </nav>
        </div>
      </div>

      <div className="content-container py-10 md:py-16">
        <article className="mx-auto max-w-3xl">
          {/* Type badge */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gray-600">
              {typeLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl-semi mb-4 text-gray-900 md:text-[40px] md:leading-tight">
            {content.title}
          </h1>

          {/* Meta — author + date (shown for article types) */}
          {isArticle && (content.author || publishDate) && (
            <div className="mb-6 flex items-center gap-x-3 text-sm text-gray-500">
              {content.author && (
                <span className="font-medium text-gray-700">{content.author}</span>
              )}
              {content.author && publishDate && (
                <span className="text-gray-300">·</span>
              )}
              {publishDate && <span>{publishDate}</span>}
            </div>
          )}

          {/* Excerpt */}
          {content.excerpt && (
            <p className="mb-8 text-lg leading-relaxed text-gray-500 border-l-4 border-gray-200 pl-4">
              {content.excerpt}
            </p>
          )}

          {/* Thumbnail — full width for articles */}
          {content.thumbnail_url && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="w-full object-cover"
                style={{ maxHeight: 480 }}
              />
            </div>
          )}

          {/* Body */}
          {content.body ? (
            <div
              className="rich-text-body"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          ) : (
            <p className="text-gray-400 italic">No content available.</p>
          )}

          {/* Date footer for non-article types */}
          {!isArticle && publishDate && (
            <p className="mt-12 border-t border-gray-100 pt-4 text-sm text-gray-400">
              Last updated: {publishDate}
            </p>
          )}
        </article>
      </div>
    </div>
  )
}

import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getContentByHandle } from "@lib/data/content"
import ContentTemplate from "@modules/content/templates"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const content = await getContentByHandle(handle)

  if (!content) return {}

  return {
    title: content.seo_title ?? content.title,
    description: content.seo_description ?? content.excerpt ?? undefined,
    openGraph: {
      title: content.seo_title ?? content.title,
      description: content.seo_description ?? content.excerpt ?? undefined,
      images: content.thumbnail_url ? [content.thumbnail_url] : [],
    },
  }
}

export default async function ContentPage(props: Props) {
  const { countryCode, handle } = await props.params
  const content = await getContentByHandle(handle)

  if (!content) notFound()

  // News and announcements live at their own URLs
  if (content.type === "news") redirect(`/${countryCode}/news/${handle}`)
  if (content.type === "announcement") redirect(`/${countryCode}/announcement/${handle}`)

  return <ContentTemplate content={content} />
}

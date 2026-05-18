import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getContentByHandle } from "@lib/data/content"
import ContentTemplate from "@modules/content/templates"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const content = await getContentByHandle(handle)

  if (!content || content.type !== "news") return {}

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

export default async function NewsPage(props: Props) {
  const { handle } = await props.params
  const content = await getContentByHandle(handle)

  if (!content || content.type !== "news") notFound()

  return <ContentTemplate content={content} />
}

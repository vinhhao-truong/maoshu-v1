"use server"

import { sdk } from "@lib/config"

export type ContentItem = {
  id: string
  title: string
  handle: string
  type: string
  body: string | null
  excerpt: string | null
  thumbnail_url: string | null
  author: string | null
  status: string
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  is_active: boolean
  created_at: string
}

export const getContentByHandle = async (
  handle: string
): Promise<ContentItem | null> => {
  return sdk.client
    .fetch<{ content: ContentItem }>(`/store/contents/${handle}`, {
      method: "GET",
      cache: "no-store",
    })
    .then(({ content }) => content)
    .catch(() => null)
}

export const listPublishedContent = async (
  type?: string
): Promise<ContentItem[]> => {
  const query: Record<string, string> = {}
  if (type) query.type = type

  return sdk.client
    .fetch<{ contents: ContentItem[]; count: number }>(`/store/contents`, {
      method: "GET",
      query,
      cache: "no-store",
    })
    .then(({ contents }) => contents)
    .catch(() => [])
}

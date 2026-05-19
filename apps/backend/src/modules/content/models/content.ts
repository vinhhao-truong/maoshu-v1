import { model } from "@medusajs/framework/utils"

const Content = model.define("content", {
  id: model.id({ prefix: "cnt" }).primaryKey(),
  title: model.text(),
  handle: model.text(),
  // "news" | "terms" | "privacy" | "return_policy" | "faq" | "announcement"
  type: model.text(),
  body: model.text().nullable(),
  excerpt: model.text().nullable(),
  thumbnail_url: model.text().nullable(),
  author: model.text().nullable(),
  // "draft" | "published" | "archived"
  status: model.text().default("draft"),
  published_at: model.dateTime().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  metadata: model.json().nullable(),
  is_active: model.boolean().default(true),
  in_footer: model.boolean().default(false),
})

export default Content

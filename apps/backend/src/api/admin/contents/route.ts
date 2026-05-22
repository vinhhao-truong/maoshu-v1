import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../modules/content"
import ContentModuleService from "../../../modules/content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.type) filters.type = req.query.type
  if (req.query.status) filters.status = req.query.status

  const [contents, count] = await contentService.listAndCountContents(
    filters,
    { skip: 0, take: 200, order: { created_at: "DESC" } }
  )
  res.json({ contents, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const body = req.body as {
    title: string
    handle: string
    type: string
    body?: string
    excerpt?: string
    thumbnail_url?: string
    author?: string
    status?: string
    published_at?: string
    seo_title?: string
    seo_description?: string
    metadata?: Record<string, unknown>
    is_active?: boolean
    in_footer?: boolean
  }

  if (!body.title || !body.handle || !body.type) {
    return res.status(400).json({ message: "title, handle, and type are required" })
  }

  const existing = await contentService.listContents({ handle: body.handle })
  if (existing.length > 0) {
    return res.status(409).json({ message: "A content item with this handle already exists" })
  }

  const content = await contentService.createContents({
    ...body,
    published_at: body.published_at ? new Date(body.published_at) : undefined,
  })
  res.status(201).json({ content })
}

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"
import ContentModuleService from "../../../../modules/content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const content = await contentService.retrieveContent(req.params.id)
  res.json({ content })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const body = req.body as {
    title?: string
    handle?: string
    type?: string
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

  if (body.handle) {
    const existing = await contentService.listContents({ handle: body.handle })
    if (existing.length > 0 && existing[0].id !== req.params.id) {
      return res.status(409).json({ message: "A content item with this handle already exists" })
    }
  }

  const [content] = await contentService.updateContents([{
    id: req.params.id,
    ...body,
    published_at: body.published_at !== undefined
      ? (body.published_at ? new Date(body.published_at) : null)
      : undefined,
  }])
  res.json({ content })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  await contentService.deleteContents([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}

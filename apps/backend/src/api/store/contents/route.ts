import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../modules/content"
import ContentModuleService from "../../../modules/content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)

  if (req.query.in_footer === "true") {
    const [contents, count] = await contentService.listAndCountContents(
      { in_footer: true },
      { skip: 0, take: 100, order: { title: "ASC" } }
    )
    return res.json({ contents, count })
  }

  const filters: Record<string, unknown> = {
    status: "published",
    is_active: true,
  }
  if (req.query.type) filters.type = req.query.type

  const [contents, count] = await contentService.listAndCountContents(
    filters,
    { skip: 0, take: 100, order: { published_at: "DESC" } }
  )
  res.json({ contents, count })
}

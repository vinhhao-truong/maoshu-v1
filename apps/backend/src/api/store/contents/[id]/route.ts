import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"
import ContentModuleService from "../../../../modules/content/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentService: ContentModuleService = req.scope.resolve(CONTENT_MODULE)

  // Support lookup by handle (storefront) or by ID (direct)
  const param = req.params.id
  const byHandle = await contentService.listContents({
    handle: param,
    status: "published",
    is_active: true,
  })

  const content =
    byHandle[0] ??
    (await contentService.listContents({ id: param, status: "published", is_active: true }).then((r) => r[0] ?? null))

  if (!content) {
    return res.status(404).json({ message: "Content not found" })
  }

  res.json({ content })
}

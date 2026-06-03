import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BUSINESS_INFO_MODULE } from "../../../modules/business-info"
import BusinessInfoModuleService from "../../../modules/business-info/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: BusinessInfoModuleService = req.scope.resolve(BUSINESS_INFO_MODULE)
  const { root_category_id } = req.query as { root_category_id?: string }
  const filter = root_category_id ? { root_category_id } : {}
  const [info] = await service.listBusinessInfos(filter, { take: 1 })
  res.json({ business_info: info ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: BusinessInfoModuleService = req.scope.resolve(BUSINESS_INFO_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.store_name) {
    return res.status(400).json({ message: "store_name is required" })
  }

  const rootCategoryId = (body.root_category_id as string | null) ?? null
  const filter = rootCategoryId ? { root_category_id: rootCategoryId } : {}
  const [existing] = await service.listBusinessInfos(filter, { take: 1 })

  let info
  if (existing) {
    ;[info] = await service.updateBusinessInfos([{ id: existing.id, ...body }])
  } else {
    info = await service.createBusinessInfos(body)
  }

  res.json({ business_info: info })
}

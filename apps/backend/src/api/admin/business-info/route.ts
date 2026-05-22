import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BUSINESS_INFO_MODULE } from "../../../modules/business-info"
import BusinessInfoModuleService from "../../../modules/business-info/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: BusinessInfoModuleService = req.scope.resolve(BUSINESS_INFO_MODULE)
  const [info] = await service.listBusinessInfoes({}, { take: 1 })
  res.json({ business_info: info ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: BusinessInfoModuleService = req.scope.resolve(BUSINESS_INFO_MODULE)
  const body = req.body as Record<string, unknown>

  if (!body.store_name) {
    return res.status(400).json({ message: "store_name is required" })
  }

  const [existing] = await service.listBusinessInfoes({}, { take: 1 })

  let info
  if (existing) {
    ;[info] = await service.updateBusinessInfoes([{ id: existing.id, ...body }])
  } else {
    info = await service.createBusinessInfoes(body)
  }

  res.json({ business_info: info })
}

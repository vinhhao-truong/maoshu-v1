import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BUSINESS_INFO_MODULE } from "../../../modules/business-info"
import BusinessInfoModuleService from "../../../modules/business-info/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: BusinessInfoModuleService = req.scope.resolve(BUSINESS_INFO_MODULE)
  const [info] = await service.listBusinessInfos({}, { take: 1 })
  res.json({ business_info: info ?? null })
}

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const [brands, count] = await brandService.listAndCountBrands(
    {},
    { skip: 0, take: 200, order: { name: "ASC" } }
  )
  res.json({ brands, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const body = req.body as {
    name: string
    handle: string
    description?: string
    logo_url?: string
    is_active?: boolean
  }

  if (!body.name || !body.handle) {
    return res.status(400).json({ message: "name and handle are required" })
  }

  const existing = await brandService.listBrands({ handle: body.handle })
  if (existing.length > 0) {
    return res.status(409).json({ message: "A brand with this handle already exists" })
  }

  const brand = await brandService.createBrands(body)
  res.status(201).json({ brand })
}

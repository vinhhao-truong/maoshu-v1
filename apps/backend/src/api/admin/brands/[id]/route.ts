import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"
import BrandModuleService from "../../../../modules/brand/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const brand = await brandService.retrieveBrand(req.params.id)
  res.json({ brand })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const body = req.body as {
    name?: string
    handle?: string
    description?: string
    logo_url?: string
    is_active?: boolean
  }

  if (body.handle) {
    const existing = await brandService.listBrands({ handle: body.handle })
    if (existing.length > 0 && existing[0].id !== req.params.id) {
      return res.status(409).json({ message: "A brand with this handle already exists" })
    }
  }

  const [brand] = await brandService.updateBrands([{ id: req.params.id, ...body }])
  res.json({ brand })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  await brandService.deleteBrands([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}

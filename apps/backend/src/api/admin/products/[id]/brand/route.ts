import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    filters: { id: req.params.id },
    fields: ["id", "brand.*"],
  })
  const product = data[0]
  res.json({ brand: (product as any)?.brand ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { brand_id } = req.body as { brand_id: string | null }
  const productId = req.params.id

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  // Fetch the current brand so we can dismiss the specific link record
  const { data: [product] } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: ["id", "brand.id"],
  })
  const currentBrandId = (product as any)?.brand?.id

  if (currentBrandId) {
    await remoteLink.dismiss({
      [Modules.PRODUCT]: { product_id: productId },
      [BRAND_MODULE]: { brand_id: currentBrandId },
    })
  }

  if (brand_id) {
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: productId },
      [BRAND_MODULE]: { brand_id },
    })
  }

  res.json({ product_id: productId, brand_id: brand_id ?? null })
}

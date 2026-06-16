import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const { response } = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  })
  const product = response.products[0]

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      rootCategoryId={process.env.ROOT_CATEGORY_ID}
    />
  )
}

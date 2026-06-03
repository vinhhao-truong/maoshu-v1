import { defineMiddlewares } from "@medusajs/medusa"
import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

const BRAND_FIELDS = [
  "brand.id",
  "brand.name",
  "brand.handle",
  "brand.description",
  "brand.logo_url",
  "brand.is_active",
]

function injectBrandFields(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.remoteQueryConfig?.fields) {
    // validateAndTransformQuery already ran — append directly to the resolved fields list
    req.remoteQueryConfig.fields.push(...BRAND_FIELDS)
  } else {
    // validateAndTransformQuery hasn't run yet — use req.allowed so it picks them up
    req.allowed = [...(req.allowed ?? []), ...BRAND_FIELDS]
    const existing = (req.query.fields as string) ?? ""
    const additions = BRAND_FIELDS.map((f) => `+${f}`).join(",")
    req.query = {
      ...req.query,
      fields: existing ? `${existing},${additions}` : additions,
    }
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/uploads",
      method: ["POST"],
      bodyParser: { sizeLimit: "10mb" },
    },
    {
      matcher: "/admin/media",
      method: ["POST"],
      bodyParser: { sizeLimit: "10mb" },
    },
    {
      matcher: "/store/products",
      method: ["GET"],
      middlewares: [injectBrandFields],
    },
    {
      matcher: "/store/products/:id",
      method: ["GET"],
      middlewares: [injectBrandFields],
    },
  ],
})

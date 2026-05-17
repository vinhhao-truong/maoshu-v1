import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const LOCALES = [
  { code: "vi", name: "Tiếng Việt" },
  { code: "en", name: "English" },
]

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({ locales: LOCALES })
}

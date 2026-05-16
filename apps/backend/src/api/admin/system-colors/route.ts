import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SYSTEM_COLOR_MODULE } from "../../../modules/system-color"
import SystemColorModuleService from "../../../modules/system-color/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: SystemColorModuleService = req.scope.resolve(SYSTEM_COLOR_MODULE)
  const [system_colors, count] = await service.listAndCountSystemColors(
    {},
    { skip: 0, take: 500, order: { name: "ASC" } }
  )
  res.json({ system_colors, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: SystemColorModuleService = req.scope.resolve(SYSTEM_COLOR_MODULE)
  const body = req.body as { name: string; hex: string }

  if (!body.name?.trim() || !body.hex?.trim()) {
    return res.status(400).json({ message: "name and hex are required" })
  }

  const system_color = await service.createSystemColors({
    name: body.name.trim(),
    hex: body.hex.trim(),
  })
  res.status(201).json({ system_color })
}

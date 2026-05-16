import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SYSTEM_COLOR_MODULE } from "../../../../modules/system-color"
import SystemColorModuleService from "../../../../modules/system-color/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: SystemColorModuleService = req.scope.resolve(SYSTEM_COLOR_MODULE)
  const body = req.body as { name?: string; hex?: string }

  const [system_color] = await service.updateSystemColors([
    { id: req.params.id, ...body },
  ])
  res.json({ system_color })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: SystemColorModuleService = req.scope.resolve(SYSTEM_COLOR_MODULE)
  await service.deleteSystemColors([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}

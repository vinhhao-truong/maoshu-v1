import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COLOR_GROUP_MODULE } from "../../../../modules/color-group"
import ColorGroupModuleService from "../../../../modules/color-group/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ColorGroupModuleService = req.scope.resolve(COLOR_GROUP_MODULE)
  const body = req.body as {
    name?: string
    primary?: string | null
    secondary?: string | null
    inverse?: string | null
    neutral?: string | null
    success?: string | null
    warning?: string | null
    danger?: string | null
    info?: string | null
  }

  const [color_group] = await service.updateColorGroups([
    { id: req.params.id, ...body },
  ])
  res.json({ color_group })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: ColorGroupModuleService = req.scope.resolve(COLOR_GROUP_MODULE)
  await service.deleteColorGroups([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}

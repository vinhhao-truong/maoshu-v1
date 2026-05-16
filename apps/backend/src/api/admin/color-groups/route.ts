import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COLOR_GROUP_MODULE } from "../../../modules/color-group"
import ColorGroupModuleService from "../../../modules/color-group/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ColorGroupModuleService = req.scope.resolve(COLOR_GROUP_MODULE)
  const [color_groups, count] = await service.listAndCountColorGroups(
    {},
    { skip: 0, take: 200, order: { name: "ASC" } }
  )
  res.json({ color_groups, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ColorGroupModuleService = req.scope.resolve(COLOR_GROUP_MODULE)
  const body = req.body as {
    name: string
    primary?: string | null
    secondary?: string | null
    inverse?: string | null
    neutral?: string | null
    success?: string | null
    warning?: string | null
    danger?: string | null
    info?: string | null
  }

  if (!body.name?.trim()) {
    return res.status(400).json({ message: "name is required" })
  }

  const color_group = await service.createColorGroups({
    name: body.name.trim(),
    primary: body.primary ?? null,
    secondary: body.secondary ?? null,
    inverse: body.inverse ?? null,
    neutral: body.neutral ?? null,
    success: body.success ?? null,
    warning: body.warning ?? null,
    danger: body.danger ?? null,
    info: body.info ?? null,
  })
  res.status(201).json({ color_group })
}

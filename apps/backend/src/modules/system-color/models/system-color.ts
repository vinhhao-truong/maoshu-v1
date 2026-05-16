import { model } from "@medusajs/framework/utils"

const SystemColor = model.define("system_color", {
  id: model.id({ prefix: "syscol" }).primaryKey(),
  name: model.text(),
  hex: model.text(),
})

export default SystemColor

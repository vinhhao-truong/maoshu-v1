import { model } from "@medusajs/framework/utils"

const ColorGroup = model.define("color_group", {
  id: model.id({ prefix: "colgrp" }).primaryKey(),
  name: model.text(),
  primary: model.text().nullable(),
  secondary: model.text().nullable(),
  inverse: model.text().nullable(),
  neutral: model.text().nullable(),
  success: model.text().nullable(),
  warning: model.text().nullable(),
  danger: model.text().nullable(),
  info: model.text().nullable(),
})

export default ColorGroup

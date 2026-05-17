import { model } from "@medusajs/framework/utils"

const VariantCost = model.define("variant_cost", {
  id: model.id({ prefix: "vcost" }).primaryKey(),
  variant_id: model.text(),
  cost: model.number().nullable(),
})

export default VariantCost

import { model } from "@medusajs/framework/utils"

const ProductStatHistory = model.define("product_stat_history", {
  id: model.id({ prefix: "psth" }).primaryKey(),
  product_id: model.text(),
  reset_type: model.text(),
  selling_amount: model.number().default(0),
  view_amount: model.number().default(0),
  period_end: model.dateTime(),
})

export default ProductStatHistory

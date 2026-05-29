import { model } from "@medusajs/framework/utils"

const ProductStat = model.define("product_stat", {
  id: model.id({ prefix: "pstat" }).primaryKey(),
  product_id: model.text(),
  weekly_selling_amount: model.number().default(0),
  weekly_view_amount: model.number().default(0),
  monthly_selling_amount: model.number().default(0),
  monthly_view_amount: model.number().default(0),
  annual_selling_amount: model.number().default(0),
  annual_view_amount: model.number().default(0),
  total_sell_amount: model.number().default(0),
  total_view_amount: model.number().default(0),
})

export default ProductStat

import { model } from "@medusajs/framework/utils"

const BusinessInfo = model.define("business_info", {
  id: model.id({ prefix: "biz" }).primaryKey(),
  store_name: model.text(),
  tagline: model.text().nullable(),
  logo_url: model.text().nullable(),
  // Contact
  email: model.text().nullable(),
  phone: model.text().nullable(),
  // Address
  address_line1: model.text().nullable(),
  address_line2: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  country: model.text().nullable(),
  postal_code: model.text().nullable(),
  // Social
  facebook_url: model.text().nullable(),
  instagram_url: model.text().nullable(),
  twitter_url: model.text().nullable(),
  tiktok_url: model.text().nullable(),
  youtube_url: model.text().nullable(),
  zalo_url: model.text().nullable(),
  // Content
  about_us: model.text().nullable(),
  // Other
  business_hours: model.text().nullable(),
  tax_id: model.text().nullable(),
  logo_white_url: model.text().nullable(),
  logo_black_url: model.text().nullable(),
  metadata: model.json().nullable(),
  root_category_id: model.text().nullable(),
})

export default BusinessInfo

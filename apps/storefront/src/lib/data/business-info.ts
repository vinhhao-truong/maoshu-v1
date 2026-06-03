"use server"

import { sdk } from "@lib/config"

export type BusinessInfo = {
  id: string
  store_name: string | null
  tagline: string | null
  logo_url: string | null
  logo_white_url: string | null
  logo_black_url: string | null
  about_us: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  zalo_url: string | null
  business_hours: string | null
}

export const getBusinessInfo = async (rootCategoryId?: string): Promise<BusinessInfo | null> => {
  const qs = rootCategoryId ? `?root_category_id=${rootCategoryId}` : ""
  return sdk.client
    .fetch<{ business_info: BusinessInfo }>(`/store/business-info${qs}`, {
      method: "GET",
      cache: "no-store",
    })
    .then(({ business_info }) => business_info)
    .catch(() => null)
}

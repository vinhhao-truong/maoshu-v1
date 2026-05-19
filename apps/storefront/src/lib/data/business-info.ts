"use server"

import { sdk } from "@lib/config"

export type BusinessInfo = {
  id: string
  store_name: string | null
  tagline: string | null
  logo_url: string | null
}

export const getBusinessInfo = async (): Promise<BusinessInfo | null> => {
  return sdk.client
    .fetch<{ business_info: BusinessInfo }>(`/store/business-info`, {
      method: "GET",
      next: { revalidate: 3600 },
    })
    .then(({ business_info }) => business_info)
    .catch(() => null)
}

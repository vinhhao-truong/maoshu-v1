import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import { useTranslations } from "next-intl"
import React, { useState } from "react"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const t = useTranslations("checkout")

  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.full_name": [
      cart?.billing_address?.first_name,
      cart?.billing_address?.last_name,
    ]
      .filter(Boolean)
      .join(" "),
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label={t("fullName")}
            name="billing_address.full_name"
            autoComplete="name"
            value={formData["billing_address.full_name"]}
            onChange={handleChange}
            required
            data-testid="billing-full-name-input"
          />
        </div>
        <Input
          label={t("addressLine")}
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <Input
          label={t("company")}
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label={t("phone")}
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress

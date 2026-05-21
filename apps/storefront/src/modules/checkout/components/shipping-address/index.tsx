import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { isPhoneUser } from "@lib/util/customer"
import { mapKeys } from "lodash"
import { useTranslations } from "next-intl"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const t = useTranslations("checkout")

  const defaultCountryCode = cart?.region?.countries?.[0]?.iso_2 || "vn"

  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.full_name": [
      cart?.shipping_address?.first_name,
      cart?.shipping_address?.last_name,
    ]
      .filter(Boolean)
      .join(" "),
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email:
      cart?.email && !isPhoneUser(cart.email)
        ? cart.email
        : customer?.email && !isPhoneUser(customer.email)
          ? customer.email
          : "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.full_name": [address?.first_name, address?.last_name]
          .filter(Boolean)
          .join(" "),
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email && !isPhoneUser(email)) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email,
      }))
    }
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email && !isPhoneUser(customer.email)) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

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
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {t("savedAddressPrompt", { name: customer.first_name })}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <input
        type="hidden"
        name="shipping_address.country_code"
        value={defaultCountryCode}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label={t("fullName")}
            name="shipping_address.full_name"
            autoComplete="name"
            value={formData["shipping_address.full_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-full-name-input"
          />
        </div>
        <Input
          label={t("addressLine")}
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label={t("company")}
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
      </div>
      <div className="my-8">
        <Checkbox
          label={t("billingAddressSameAsShipping")}
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label={t("phone")}
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <Input
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          data-testid="shipping-email-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress

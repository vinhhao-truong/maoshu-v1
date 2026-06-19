"use client"

import { Badge } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

const PaymentTest = ({ className }: { className?: string }) => {
  const t = useTranslations("checkout")
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">{t("paymentTestAttention")}</span>{" "}
      {t("paymentTestOnlyDesc")}
    </Badge>
  )
}

export default PaymentTest

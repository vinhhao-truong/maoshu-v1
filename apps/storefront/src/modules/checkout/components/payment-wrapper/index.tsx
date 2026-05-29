"use client"

import { loadStripe, Stripe } from "@stripe/stripe-js"
import React, { useRef } from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripeLike } from "@lib/constants"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null)

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (isStripeLike(paymentSession?.provider_id) && paymentSession && stripeKey) {
    if (!stripePromiseRef.current) {
      stripePromiseRef.current = loadStripe(
        stripeKey,
        medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
      )
    }
    return (
      <StripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromiseRef.current}
      >
        {children}
      </StripeWrapper>
    )
  }

  return <div>{children}</div>
}

export default PaymentWrapper

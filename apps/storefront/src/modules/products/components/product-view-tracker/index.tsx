"use client"

import { useEffect } from "react"
import { trackProductView } from "@lib/data/product-stats"

export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductView(productId)
  }, [productId])

  return null
}

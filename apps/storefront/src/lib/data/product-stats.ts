const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export function trackProductView(productId: string): void {
  fetch(`${BACKEND_URL}/store/products/${productId}/view`, {
    method: "POST",
    headers: { "x-publishable-api-key": PUB_KEY },
  }).catch(() => {})
}

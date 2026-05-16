"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type Props = {
  validIds: string[]
  countryCode: string
}

export default function CategoryGuard({ validIds, countryCode }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname.includes("/select-category")) return

    const stored = localStorage.getItem("selectedCategoryId")
    const isValid = !!stored && validIds.includes(stored)

    if (!isValid) {
      sessionStorage.setItem("selectCategoryReturnPath", pathname)
      router.replace(`/${countryCode}/select-category`)
    }
  }, [pathname, validIds, countryCode, router])

  return null
}

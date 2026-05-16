"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type Props = {
  validIds: string[]
  countryCode: string
}

export default function CategoryGuard({ validIds, countryCode }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (pathname.includes("/select-category")) {
      setChecking(false)
      return
    }

    const stored = localStorage.getItem("selectedCategoryId")
    const isValid = !!stored && validIds.includes(stored)

    if (!isValid) {
      sessionStorage.setItem("selectCategoryReturnPath", pathname)
      router.replace(`/${countryCode}/select-category`)
    } else {
      setChecking(false)
    }
  }, [pathname, validIds, countryCode, router])

  if (!checking) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-t-gray-800 animate-spin" />
      </div>
    </div>
  )
}

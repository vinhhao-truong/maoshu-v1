"use client"

import { useEffect } from "react"

export default function ThemeSync({ theme }: { theme?: string }) {
  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme)
    } else {
      document.body.removeAttribute("data-theme")
    }
  }, [theme])

  return null
}

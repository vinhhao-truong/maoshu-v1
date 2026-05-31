"use client"

import { useEffect } from "react"

const STYLE_ID = "theme-css-vars-sync"

export default function ThemeSync({ cssVars }: { cssVars?: string }) {
  useEffect(() => {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null

    if (cssVars) {
      if (!el) {
        el = document.createElement("style")
        el.id = STYLE_ID
        document.head.appendChild(el)
      }
      el.textContent = `:root{${cssVars}}`
    } else if (el) {
      el.remove()
    }
  }, [cssVars])

  return null
}

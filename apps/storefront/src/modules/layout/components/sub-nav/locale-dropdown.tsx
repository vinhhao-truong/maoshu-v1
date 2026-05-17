"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import NProgress from "nprogress"

type Props = {
  locales: Locale[]
  currentLocale: string
}

export default function LocaleDropdown({ locales, currentLocale }: Props) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const current = locales.find((l) => l.code === currentLocale) ?? locales[0]

  const cancelClose = () => { if (timer.current) clearTimeout(timer.current) }
  const scheduleClose = () => { timer.current = setTimeout(() => setOpen(false), 120) }

  const handleSelect = async (code: string) => {
    setOpen(false)
    NProgress.start()
    await updateLocale(code)
    router.refresh()
    NProgress.done()
  }

  if (!locales.length) return null

  return (
    <div
      className="relative h-full w-max"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
    >
      <button
        className="h-full px-4 flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{current?.name ?? currentLocale}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 bg-white border border-gray-200 shadow-md z-[200] w-max p-[1px]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <ul className="flex flex-col">
            {locales.filter((l) => l.code !== currentLocale).map((locale) => (
              <li key={locale.code}>
                <button
                  onClick={() => handleSelect(locale.code)}
                  className="w-full text-left pl-2 pr-[50px] py-2 text-sm rounded-sm text-gray-700 hover:bg-primary hover:text-primary-fg transition-colors"
                >
                  {locale.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

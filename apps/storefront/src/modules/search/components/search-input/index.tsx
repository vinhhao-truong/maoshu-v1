"use client"

import { useParams, useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"

export default function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    startTransition(() => {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(trimmed)}`)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-xl">
      <div className="flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-3 py-2.5 bg-white focus-within:border-primary transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm..."
          className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="text-gray-400 hover:text-gray-600 leading-none text-base"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-fg text-sm rounded-md hover:bg-primary-hover disabled:opacity-70 transition-colors shrink-0 min-w-[60px]"
      >
        {isPending ? (
          <span className="w-4 h-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
        ) : (
          "Tìm"
        )}
      </button>
    </form>
  )
}

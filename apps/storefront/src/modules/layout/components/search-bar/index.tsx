"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type ProductResult = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

async function searchProducts(q: string): Promise<ProductResult[]> {
  if (!q.trim()) return []
  const url = `${BACKEND_URL}/store/products?q=${encodeURIComponent(q)}&limit=6&fields=id,title,handle,thumbnail`
  const res = await fetch(url, {
    headers: { "x-publishable-api-key": PUB_KEY },
    cache: "no-store",
  })
  if (!res.ok) return []
  const { products } = await res.json()
  return products ?? []
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    // Show hint dropdown immediately for short queries
    if (query.trim().length < 3) {
      setResults([])
      setOpen(true)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const found = await searchProducts(query)
      setResults(found)
      setOpen(true)
      setLoading(false)
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleClose = () => {
    setOpen(false)
    setQuery("")
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 3) {
      setOpen(false)
      router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center h-full">
      <div className="flex items-center gap-1 border border-gray-200 rounded-md px-2 py-1 bg-white focus-within:border-gray-400 transition-colors">
        {/* Search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm..."
          className="w-36 sm:w-48 text-xs outline-none bg-transparent placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 leading-none text-sm"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-72 bg-white border border-gray-200 shadow-lg rounded-md z-[200] overflow-hidden">
          {query.trim().length < 3 ? (
            <div className="p-4 text-xs text-gray-400 text-center">Nhập ít nhất 3 ký tự để tìm kiếm</div>
          ) : loading ? (
            <div className="p-4 text-xs text-gray-400 text-center">Đang tìm...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">Không tìm thấy sản phẩm</div>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id} className="border-b border-gray-100 last:border-0">
                  <LocalizedClientLink
                    href={`/products/${p.handle}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    onClick={handleClose}
                  >
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-10 h-10 object-cover rounded border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-gray-100 bg-gray-100 shrink-0" />
                    )}
                    <span className="text-xs text-gray-700 line-clamp-2">{p.title}</span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

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

function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
}

function scoreProduct(title: string, normalizedQ: string, queryWords: string[]): number {
  const titleNorm = normalizeText(title)

  // Full phrase match → highest score
  if (titleNorm.includes(normalizedQ)) return 1

  // Word-level match: score = fraction of query words found in title
  const matched = queryWords.filter((w) => titleNorm.includes(w)).length
  return matched / queryWords.length
}

async function searchProducts(q: string): Promise<ProductResult[]> {
  if (!q.trim()) return []

  const normalizedQ = normalizeText(q)
  const queryWords = normalizedQ.split(/\s+/).filter(Boolean)
  if (queryWords.length === 0) return []

  const url = `${BACKEND_URL}/store/products?limit=200&fields=id,title,handle,thumbnail`
  const res = await fetch(url, {
    headers: { "x-publishable-api-key": PUB_KEY },
    cache: "no-store",
  })
  if (!res.ok) return []
  const { products } = await res.json()

  return (products ?? [] as ProductResult[])
    .map((p: ProductResult) => ({
      p,
      score: scoreProduct(p.title, normalizedQ, queryWords),
    }))
    .filter(({ score }: { score: number }) => score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 6)
    .map(({ p }: { p: ProductResult }) => p)
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

      {/* Backdrop */}
      {open && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 backdrop-blur-sm bg-black/10 z-[199]"
          onClick={handleClose}
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-[200] overflow-hidden">
          <div className="content-container py-2">
            {query.trim().length < 3 ? (
              <div className="py-3 text-xs text-gray-400 text-center">Nhập ít nhất 3 ký tự để tìm kiếm</div>
            ) : loading ? (
              <div className="py-3 text-xs text-gray-400 text-center">Đang tìm...</div>
            ) : results.length === 0 ? (
              <div className="py-3 text-xs text-gray-400 text-center">Không tìm thấy sản phẩm</div>
            ) : (
              <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-1 py-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <LocalizedClientLink
                      href={`/products/${p.handle}`}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 transition-colors"
                      onClick={handleClose}
                    >
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-10 h-10 object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 border border-gray-100 bg-gray-100 shrink-0" />
                      )}
                      <span className="text-xs text-gray-700 line-clamp-2">{p.title}</span>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

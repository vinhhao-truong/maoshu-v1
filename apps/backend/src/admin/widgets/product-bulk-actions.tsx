import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Checkbox, toast } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

type Product = {
  id: string
  title: string
  status: string
  thumbnail: string | null
}

const BACKEND_URL = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

async function fetchAllProducts(): Promise<Product[]> {
  const limit = 100
  let offset = 0
  const all: Product[] = []

  while (true) {
    const data = await adminFetch(`/admin/products?limit=${limit}&offset=${offset}&fields=id,title,status,thumbnail`)
    const products: Product[] = data.products ?? []
    all.push(...products)
    if (all.length >= data.count || products.length < limit) break
    offset += limit
  }

  return all
}

async function deleteProduct(id: string) {
  await adminFetch(`/admin/products/${id}`, { method: "DELETE" })
}

// ── Modal ────────────────────────────────────────────────────────────────────

function BulkDeleteModal({ onClose }: { onClose: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false))
  }, [])

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = async () => {
    if (selected.size === 0) return
    setDeleting(true)
    let failed = 0
    for (const id of selected) {
      try {
        await deleteProduct(id)
      } catch {
        failed++
      }
    }
    setDeleting(false)
    if (failed > 0) {
      toast.error(`${failed} product(s) could not be deleted.`)
    } else {
      toast.success(`${selected.size} product(s) deleted.`)
    }
    onClose()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold">Delete Selected Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No products found.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-gray-100 sticky top-0 bg-white">
                <Checkbox
                  checked={selected.size === products.length && products.length > 0}
                  onCheckedChange={toggleAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer select-none">
                  Select all ({products.length})
                </label>
              </div>
              <ul className="divide-y divide-gray-100">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-6 px-6"
                    onClick={() => toggle(p.id)}
                  >
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                    />
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <span className="text-sm flex-1 truncate">{p.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{p.status}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting}
              isLoading={deleting}
            >
              Delete {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Widget ───────────────────────────────────────────────────────────────────

const ProductBulkActionsWidget = () => {
  const [showModal, setShowModal] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ""
    if (!file) return

    setImporting(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${BACKEND_URL}/admin/product-import`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Import failed")
      toast.success(`Imported: ${data.created} created, ${data.updated} updated${data.errors?.length ? `, ${data.errors.length} errors` : ""}`)
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message ?? "Import failed")
    } finally {
      setImporting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirmAll) {
      setConfirmAll(true)
      return
    }
    setDeletingAll(true)
    try {
      const products = await fetchAllProducts()
      let failed = 0
      for (const p of products) {
        try {
          await deleteProduct(p.id)
        } catch {
          failed++
        }
      }
      if (failed > 0) {
        toast.error(`${failed} product(s) could not be deleted.`)
      } else {
        toast.success(`All ${products.length} product(s) deleted.`)
      }
      window.location.reload()
    } catch {
      toast.error("Failed to fetch products.")
    } finally {
      setDeletingAll(false)
      setConfirmAll(false)
    }
  }

  const downloadTemplate = () => {
    window.open(`${BACKEND_URL}/admin/product-import-template`, "_blank")
  }

  const exportProducts = () => {
    window.open(`${BACKEND_URL}/admin/product-export`, "_blank")
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
        />

        <Button
          variant="secondary"
          size="small"
          onClick={downloadTemplate}
        >
          Download Import Template
        </Button>

        <Button
          variant="secondary"
          size="small"
          onClick={() => fileInputRef.current?.click()}
          isLoading={importing}
        >
          Import Products
        </Button>

        <Button
          variant="secondary"
          size="small"
          onClick={exportProducts}
        >
          Export Products
        </Button>

        <Button
          variant="secondary"
          size="small"
          onClick={() => setShowModal(true)}
        >
          Delete Selected
        </Button>

        <Button
          variant="danger"
          size="small"
          onClick={handleDeleteAll}
          isLoading={deletingAll}
        >
          {confirmAll ? "Confirm Delete All?" : "Delete All Products"}
        </Button>

        {confirmAll && !deletingAll && (
          <button
            onClick={() => setConfirmAll(false)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        )}
      </div>

      {showModal && <BulkDeleteModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductBulkActionsWidget

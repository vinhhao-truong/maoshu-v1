import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Input, Label, Switch, Textarea, toast } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type CollectionData = {
  id: string
  title?: string
  handle?: string
  description?: string | null
  metadata: Record<string, any> | null
}

const BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"


function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function postCollection(id: string, body: Record<string, any>) {
  const res = await fetch(`${BACKEND_URL}/admin/collections/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to save collection")
}

async function uploadFile(file: File, folder: string, oldUrl?: string): Promise<string> {
  const data = await readAsBase64(file)
  const res = await fetch(`${BACKEND_URL}/admin/media`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, data, folder, ...(oldUrl ? { oldUrl } : {}) }),
  })
  if (!res.ok) throw new Error("Upload failed")
  const json = await res.json()
  return json.url as string
}

function ImageUploadField({
  label, imageUrl, uploading, inputRef, onFileSelect,
}: {
  label: string
  imageUrl: string | undefined
  uploading: boolean
  inputRef: React.RefObject<HTMLInputElement>
  onFileSelect: (file: File) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-y-2">
      <p className="txt-compact-small text-ui-fg-subtle font-medium">{label}</p>
      {imageUrl ? (
        <div className="relative rounded-md overflow-hidden border border-ui-border-base bg-ui-bg-subtle">
          <img src={imageUrl} alt={label} className="w-full object-cover" style={{ maxHeight: 140 }} />
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-ui-border-base bg-ui-bg-subtle">
          <p className="txt-small text-ui-fg-muted">{t("common.noImage")}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
          e.target.value = ""
        }}
      />
      <Button
        size="small"
        variant="secondary"
        isLoading={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        {imageUrl ? t("common.replace") : t("common.upload")}
      </Button>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest flex flex-col gap-y-4">
      <p className="txt-compact-small-plus text-ui-fg-subtle font-medium uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  )
}

const CollectionLayoutWidget = ({ data }: { data: CollectionData }) => {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)

  // Hide the native General section (the sibling immediately after this widget
  // in the SingleColumnPage flex container) — we re-render it on the left.
  useEffect(() => {
    const next = rootRef.current?.nextElementSibling as HTMLElement | null
    if (!next) return
    const prev = next.style.display
    next.style.display = "none"
    return () => {
      next.style.display = prev
    }
  }, [])

  // ── General (left) ──
  const [general, setGeneral] = useState({
    title: data.title ?? "",
    handle: data.handle ?? "",
    description: (data.metadata?.description as string) ?? "",
  })
  const [savingGeneral, setSavingGeneral] = useState(false)

  const saveGeneral = async () => {
    setSavingGeneral(true)
    try {
      const newMeta = { ...metadata, description: general.description }
      await postCollection(data.id, {
        title: general.title,
        handle: general.handle,
        metadata: newMeta,
      })
      setMetadata(newMeta)
      toast.success(t("collectionLayout.toast.saved"))
    } catch (e: any) {
      toast.error(e?.message ?? t("collectionLayout.toast.error"))
    } finally {
      setSavingGeneral(false)
    }
  }

  // ── Custom fields (right) — all persisted in collection.metadata ──
  const [metadata, setMetadata] = useState<Record<string, any>>(data.metadata ?? {})
  const [uploading, setUploading] = useState({ horizontal: false, vertical: false })
  const [savingFeatured, setSavingFeatured] = useState(false)

  const hRef = useRef<HTMLInputElement>(null!)
  const vRef = useRef<HTMLInputElement>(null!)

  const saveMetadata = async (newMeta: Record<string, any>) => {
    await postCollection(data.id, { metadata: newMeta })
    setMetadata(newMeta)
  }

  const handleUpload = async (file: File, type: "horizontal" | "vertical") => {
    const field = type === "horizontal" ? "horizontal_image" : "vertical_image"
    setUploading((u) => ({ ...u, [type]: true }))
    try {
      const folder = `collection/${data.id}/${field}`
      const url = await uploadFile(file, folder, metadata[field] || undefined)
      await saveMetadata({ ...metadata, [field]: url })
      toast.success(
        type === "horizontal"
          ? t("collectionImages.toast.horizontalSaved")
          : t("collectionImages.toast.verticalSaved")
      )
    } catch (e: any) {
      toast.error(e?.message ?? t("collectionImages.toast.uploadError"))
    } finally {
      setUploading((u) => ({ ...u, [type]: false }))
    }
  }

  const featured = metadata.featured === true || metadata.featured === "true"
  const handleFeatured = async (checked: boolean) => {
    const prev = metadata
    setMetadata({ ...metadata, featured: checked })
    setSavingFeatured(true)
    try {
      await saveMetadata({ ...metadata, featured: checked })
      toast.success(t("collectionFeatured.toast.saved"))
    } catch (e: any) {
      setMetadata(prev)
      toast.error(e?.message ?? t("collectionFeatured.toast.error"))
    } finally {
      setSavingFeatured(false)
    }
  }

  return (
    <div ref={rootRef}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* LEFT — default fields */}
        <Card title={t("collectionLayout.generalTitle")}>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="col-title" size="small">{t("collectionLayout.title")}</Label>
            <Input
              id="col-title"
              value={general.title}
              onChange={(e) => setGeneral((g) => ({ ...g, title: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="col-handle" size="small">{t("collectionLayout.handle")}</Label>
            <div className="flex items-center rounded-md border border-ui-border-base bg-ui-bg-field overflow-hidden focus-within:ring-1 focus-within:ring-ui-border-interactive">
              <span className="px-3 text-ui-fg-muted txt-compact-small select-none border-r border-ui-border-base bg-ui-bg-subtle h-full flex items-center">
                /
              </span>
              <input
                id="col-handle"
                value={general.handle}
                onChange={(e) => setGeneral((g) => ({ ...g, handle: e.target.value }))}
                className="flex-1 px-3 py-2 bg-transparent txt-compact-small text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="col-desc" size="small">{t("collectionLayout.description")}</Label>
            <Textarea
              id="col-desc"
              rows={4}
              value={general.description}
              onChange={(e) => setGeneral((g) => ({ ...g, description: e.target.value }))}
            />
          </div>
          <Button size="small" isLoading={savingGeneral} onClick={saveGeneral} className="self-start">
            {t("collectionLayout.save")}
          </Button>
        </Card>

        {/* RIGHT — custom fields */}
        <div className="flex flex-col gap-y-4">
          <Card title={t("collectionImages.title")}>
            <ImageUploadField
              label={t("collectionImages.horizontalImage")}
              imageUrl={metadata.horizontal_image}
              uploading={uploading.horizontal}
              inputRef={hRef}
              onFileSelect={(f) => handleUpload(f, "horizontal")}
            />
            <ImageUploadField
              label={t("collectionImages.verticalImage")}
              imageUrl={metadata.vertical_image}
              uploading={uploading.vertical}
              inputRef={vRef}
              onFileSelect={(f) => handleUpload(f, "vertical")}
            />
          </Card>

          <Card title={t("collectionFeatured.title")}>
            <div className="flex items-center justify-between gap-x-4">
              <Label htmlFor="col-featured">{t("collectionFeatured.showOnHomepage")}</Label>
              <Switch
                id="col-featured"
                checked={featured}
                disabled={savingFeatured}
                onCheckedChange={handleFeatured}
              />
            </div>
            <p className="txt-small text-ui-fg-muted">{t("collectionFeatured.description")}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.before",
})

export default CollectionLayoutWidget

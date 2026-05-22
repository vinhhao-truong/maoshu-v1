import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, toast } from "@medusajs/ui"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type CollectionData = {
  id: string
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

async function saveCollectionMetadata(
  id: string,
  metadata: Record<string, any>
) {
  const res = await fetch(`${BACKEND_URL}/admin/collections/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata }),
  })
  if (!res.ok) throw new Error("Failed to save metadata")
}

function ImageUploadField({
  label,
  imageUrl,
  uploading,
  inputRef,
  onFileSelect,
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
          <img
            src={imageUrl}
            alt={label}
            className="w-full object-cover"
            style={{ maxHeight: 140 }}
          />
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

const CollectionImagesWidget = ({ data }: { data: CollectionData }) => {
  const { t } = useTranslation()
  const [metadata, setMetadata] = useState<Record<string, any>>(
    data.metadata ?? {}
  )
  const [uploading, setUploading] = useState({ horizontal: false, vertical: false })

  const hRef = useRef<HTMLInputElement>(null!)
  const vRef = useRef<HTMLInputElement>(null!)

  const handleUpload = async (file: File, type: "horizontal" | "vertical") => {
    const field = type === "horizontal" ? "horizontal_image" : "vertical_image"
    setUploading((u) => ({ ...u, [type]: true }))
    try {
      const folder = `collection/${data.id}/${field}`
      const url = await uploadFile(file, folder, metadata[field] || undefined)
      const newMeta = { ...metadata, [field]: url }
      await saveCollectionMetadata(data.id, newMeta)
      setMetadata(newMeta)
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

  return (
    <div className="rounded-lg border bg-ui-bg-base p-4 shadow-elevation-card-rest flex flex-col gap-y-4">
      <p className="txt-compact-small-plus text-ui-fg-subtle font-medium uppercase tracking-wider">
        {t("collectionImages.title")}
      </p>

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
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.before",
})

export default CollectionImagesWidget

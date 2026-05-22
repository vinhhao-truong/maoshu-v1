import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import path from "path"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { filename, data, folder, oldUrl } = req.body as {
    filename?: string
    data?: string
    folder?: string
    oldUrl?: string
  }

  if (!filename || !data) {
    return res.status(400).json({ message: "filename and data are required" })
  }

  const fileService = req.scope.resolve(Modules.FILE)

  if (oldUrl) {
    const base = process.env.S3_FILE_URL?.replace(/\/$/, "")
    if (base && oldUrl.startsWith(base + "/")) {
      const oldKey = decodeURIComponent(oldUrl.slice(base.length + 1))
      try {
        await fileService.deleteFiles([oldKey])
      } catch {
        // non-fatal: old file may already be gone
      }
    }
  }

  const fullFilename = folder ? `${folder}/${filename}` : filename
  const ext = path.extname(filename).toLowerCase()
  const mimeType = MIME_TYPES[ext] ?? "application/octet-stream"

  const [uploaded] = await fileService.createFiles([
    {
      filename: fullFilename,
      mimeType,
      content: data,
      access: "public",
    },
  ])

  res.json({ url: uploaded.url })
}

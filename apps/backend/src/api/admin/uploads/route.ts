import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { filename, data } = req.body as { filename?: string; data?: string }

  if (!filename || !data) {
    return res.status(400).json({ message: "filename and data are required" })
  }

  const staticDir = path.resolve(process.cwd(), "static")
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true })
  }

  const ext = path.extname(filename) || ".jpg"
  const newFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filepath = path.join(staticDir, newFilename)

  try {
    const buffer = Buffer.from(data, "base64")
    fs.writeFileSync(filepath, buffer)
  } catch {
    return res.status(400).json({ message: "Invalid base64 data" })
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`
  res.json({ url: `${baseUrl}/uploads/${newFilename}` })
}

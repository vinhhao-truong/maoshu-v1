import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { filename } = req.params as { filename: string }

  const staticDir = path.resolve(process.cwd(), "static")
  const filePath = path.resolve(staticDir, filename)

  // Prevent path traversal
  if (!filePath.startsWith(staticDir + path.sep) && filePath !== staticDir) {
    return res.status(403).json({ message: "Forbidden" })
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" })
  }

  res.sendFile(filePath)
}

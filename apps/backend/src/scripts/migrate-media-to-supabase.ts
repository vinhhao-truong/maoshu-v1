/**
 * One-off script: uploads all files from apps/backend/static/ to Supabase Storage
 * and patches every database row that references the old local URL.
 *
 * Run from apps/backend/:
 *   npx ts-node --esm src/scripts/migrate-media-to-supabase.ts
 *
 * Required env vars (loaded from .env automatically):
 *   DATABASE_URL, S3_ENDPOINT, S3_REGION, S3_BUCKET,
 *   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_FILE_URL,
 *   OLD_FILE_BASE_URL  (default: http://localhost:9000/static)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { readFileSync, readdirSync } from "fs"
import { join, extname } from "path"
import { Pool } from "pg"
import * as dotenv from "dotenv"

dotenv.config()

const STATIC_DIR = join(process.cwd(), "static")
const OLD_BASE = (process.env.OLD_FILE_BASE_URL || "http://localhost:9000/static").replace(/\/$/, "")
const NEW_BASE = process.env.S3_FILE_URL!.replace(/\/$/, "")

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".json": "application/json",
}

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }))
    return true
  } catch {
    return false
  }
}

async function uploadFile(filename: string): Promise<string> {
  const ext = extname(filename).toLowerCase()
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream"
  const body = readFileSync(join(STATIC_DIR, filename))

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: filename,
    Body: body,
    ContentType: contentType,
  }))

  return `${NEW_BASE}/${filename}`
}

async function patchDatabase(fileMap: Map<string, string>) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    // --- product images ---
    for (const [filename, newUrl] of fileMap) {
      const oldUrl = `${OLD_BASE}/${filename}`
      const { rowCount } = await pool.query(
        `UPDATE image SET url = $1 WHERE url = $2`,
        [newUrl, oldUrl]
      )
      if ((rowCount ?? 0) > 0) {
        console.log(`  image table: ${filename} → updated ${rowCount} row(s)`)
      }
    }

    // --- product thumbnails ---
    for (const [filename, newUrl] of fileMap) {
      const oldUrl = `${OLD_BASE}/${filename}`
      const { rowCount } = await pool.query(
        `UPDATE product SET thumbnail = $1 WHERE thumbnail = $2`,
        [newUrl, oldUrl]
      )
      if ((rowCount ?? 0) > 0) {
        console.log(`  product.thumbnail: ${filename} → updated ${rowCount} row(s)`)
      }
    }

    // --- JSONB metadata (product_category, etc.) ---
    // Replace old base URL in all jsonb metadata columns across key tables.
    const jsonbTargets = [
      { table: "product_category", column: "metadata" },
      { table: "product_collection", column: "metadata" },
    ]

    for (const { table, column } of jsonbTargets) {
      const { rowCount } = await pool.query(
        `UPDATE ${table}
         SET ${column} = REPLACE(${column}::text, $1, $2)::jsonb
         WHERE ${column}::text LIKE $3`,
        [OLD_BASE, NEW_BASE, `%${OLD_BASE}%`]
      )
      if ((rowCount ?? 0) > 0) {
        console.log(`  ${table}.${column}: updated ${rowCount} row(s)`)
      }
    }
  } finally {
    await pool.end()
  }
}

async function main() {
  const required = ["DATABASE_URL", "S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_FILE_URL"]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.error("Missing env vars:", missing.join(", "))
    process.exit(1)
  }

  const allFiles = readdirSync(STATIC_DIR)
  const publicFiles = allFiles.filter((f) => !f.startsWith("private-"))
  console.log(`Found ${publicFiles.length} public file(s) in static/ (${allFiles.length - publicFiles.length} private skipped)\n`)

  const fileMap = new Map<string, string>()

  for (const filename of publicFiles) {
    const alreadyUploaded = await fileExistsInS3(filename)
    if (alreadyUploaded) {
      console.log(`[skip] ${filename} (already in bucket)`)
      fileMap.set(filename, `${NEW_BASE}/${filename}`)
      continue
    }

    process.stdout.write(`[upload] ${filename} ... `)
    const newUrl = await uploadFile(filename)
    fileMap.set(filename, newUrl)
    console.log("done")
  }

  console.log("\nPatching database URLs...")
  await patchDatabase(fileMap)

  console.log("\nDone. You can now remove apps/backend/static/ public files if desired.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { batchProductsWorkflow } from "@medusajs/core-flows"
import Busboy from "busboy"
import { parse } from "csv-parse"
import { VARIANT_COST_MODULE } from "../../../modules/variant-cost"

// Parse the multipart file upload, return CSV string
function readUploadedCSV(req: MedusaRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers as any })
    let csvContent = ""
    let found = false

    bb.on("file", (_field, stream, _info) => {
      found = true
      const chunks: Buffer[] = []
      stream.on("data", (d: Buffer) => chunks.push(d))
      stream.on("end", () => {
        csvContent = Buffer.concat(chunks).toString("utf-8")
      })
    })

    bb.on("finish", () => {
      if (!found) return reject(new Error("No file uploaded"))
      resolve(csvContent)
    })

    bb.on("error", reject)
    req.pipe(bb)
  })
}

// Parse a price column name: "Variant Price [Region] VND" → "vnd"
function parsePriceISO(colName: string): string | null {
  const iso = colName.split(" ").pop()
  return iso ? iso.toLowerCase() : null
}

// Build the variant object from a CSV row
function buildVariant(row: Record<string, string>, isUpdate: boolean) {
  const variant: Record<string, any> = {}

  const variantId = row["Variant Id"]?.trim()
  if (variantId && isUpdate) variant.id = variantId

  const title = row["Variant Title"]?.trim()
  if (title) variant.title = title

  const sku = row["Variant Sku"]?.trim()
  if (sku) variant.sku = sku

  const mi = row["Variant Manage Inventory"]?.trim()
  if (mi) variant.manage_inventory = mi.toUpperCase() === "TRUE"

  const ab = row["Variant Allow Backorder"]?.trim()
  if (ab) variant.allow_backorder = ab.toUpperCase() === "TRUE"

  const w = row["Variant Weight"]?.trim()
  if (w && !isNaN(Number(w))) variant.weight = Number(w)

  // Options: Variant Option 1 Name / Value, 2, 3 ...
  const options: Record<string, string> = {}
  for (let i = 1; i <= 10; i++) {
    const name = row[`Variant Option ${i} Name`]?.trim()
    const value = row[`Variant Option ${i} Value`]?.trim()
    if (!name) break
    if (value) options[name] = value
  }
  if (Object.keys(options).length > 0) variant.options = options

  // Prices: any column starting with "Variant Price "
  const prices: { currency_code: string; amount: number }[] = []
  for (const [col, val] of Object.entries(row)) {
    if (!col.startsWith("Variant Price ") || !val?.trim()) continue
    const iso = parsePriceISO(col)
    const amount = Number(val.trim())
    if (iso && !isNaN(amount) && amount > 0) {
      prices.push({ currency_code: iso, amount })
    }
  }
  variant.prices = prices

  return variant
}

// Extract sku→cost pairs from all rows for post-workflow cost saving
function extractSkuCosts(
  allRows: Record<string, string>[]
): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of allRows) {
    const sku = row["Variant Sku"]?.trim()
    const costStr = row["Variant Cost"]?.trim()
    if (sku && costStr && !isNaN(Number(costStr))) {
      map.set(sku, Number(costStr))
    }
  }
  return map
}

// Build the product object from a group of rows (one row per variant)
function buildProduct(rows: Record<string, string>[], isUpdate: boolean) {
  const first = rows[0]
  const product: Record<string, any> = {}

  const handle = first["Product Handle"]?.trim()
  if (handle) product.handle = handle

  const title = first["Product Title"]?.trim()
  if (title) product.title = title

  const subtitle = first["Product Subtitle"]?.trim()
  if (subtitle) product.subtitle = subtitle

  const description = first["Product Description"]?.trim()
  if (description) product.description = description

  const status = first["Product Status"]?.trim().toLowerCase()
  if (status) product.status = status

  const thumbnail = first["Product Thumbnail"]?.trim()
  if (thumbnail) product.thumbnail = thumbnail

  const weight = first["Product Weight"]?.trim()
  if (weight && !isNaN(Number(weight))) product.weight = Number(weight)

  const length = first["Product Length"]?.trim()
  if (length && !isNaN(Number(length))) product.length = Number(length)

  const width = first["Product Width"]?.trim()
  if (width && !isNaN(Number(width))) product.width = Number(width)

  const height = first["Product Height"]?.trim()
  if (height && !isNaN(Number(height))) product.height = Number(height)

  const origin = first["Product Origin Country"]?.trim()
  if (origin) product.origin_country = origin

  const material = first["Product Material"]?.trim()
  if (material) product.material = material

  const disc = first["Product Discountable"]?.trim()
  if (disc) product.discountable = disc.toUpperCase() === "TRUE"

  // Build options list from all rows
  const optionMap = new Map<string, Set<string>>()
  for (const row of rows) {
    for (let i = 1; i <= 10; i++) {
      const name = row[`Variant Option ${i} Name`]?.trim()
      const value = row[`Variant Option ${i} Value`]?.trim()
      if (!name) break
      if (!optionMap.has(name)) optionMap.set(name, new Set())
      if (value) optionMap.get(name)!.add(value)
    }
  }
  if (optionMap.size > 0) {
    product.options = [...optionMap.entries()].map(([title, values]) => ({
      title,
      values: [...values],
    }))
  }

  // Build variants
  product.variants = rows
    .filter((r) => r["Variant Title"]?.trim())
    .map((r) => buildVariant(r, isUpdate))

  return product
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // 1. Read uploaded CSV
  let csvContent: string
  try {
    csvContent = await readUploadedCSV(req)
  } catch {
    return res.status(400).json({ message: "No CSV file found in request" })
  }

  // 2. Parse CSV rows (csv-parse handles UTF-8 BOM with bom: true)
  let allRows: Record<string, string>[]
  try {
    allRows = await new Promise<Record<string, string>[]>((resolve, reject) => {
      parse(
        csvContent,
        { columns: true, skip_empty_lines: true, bom: true, trim: true, relax_column_count: true },
        (err, records) => {
          if (err) reject(err)
          else resolve(records as Record<string, string>[])
        }
      )
    })
  } catch (err: any) {
    return res.status(400).json({ message: `CSV parse error: ${err.message}` })
  }

  if (allRows.length === 0) {
    return res.status(400).json({ message: "CSV is empty" })
  }

  // 3. Group rows by product key (Product Id takes priority, then Handle)
  const productGroups = new Map<string, Record<string, string>[]>()
  for (const row of allRows) {
    const key = row["Product Id"]?.trim() || row["Product Handle"]?.trim()
    if (!key) continue
    if (!productGroups.has(key)) productGroups.set(key, [])
    productGroups.get(key)!.push(row)
  }

  // 4. Look up existing products by ID or handle
  const productService = req.scope.resolve(Modules.PRODUCT)

  const toCreate: any[] = []
  const toUpdate: any[] = []
  const errors: string[] = []

  for (const [_key, rows] of productGroups) {
    try {
      const first = rows[0]
      const productId = first["Product Id"]?.trim()
      const handle = first["Product Handle"]?.trim()

      let existingId: string | undefined

      if (productId) {
        const [found] = await productService.listProducts(
          { id: productId },
          { select: ["id"], take: 1 }
        )
        if (found) existingId = found.id
      }

      if (!existingId && handle) {
        const [found] = await productService.listProducts(
          { handle },
          { select: ["id"], take: 1 }
        )
        if (found) existingId = found.id
      }

      if (existingId) {
        const product = buildProduct(rows, true)
        toUpdate.push({ id: existingId, ...product })
      } else {
        const product = buildProduct(rows, false)
        if (!product.title) {
          errors.push(`Row skipped: no title for handle "${handle}"`)
          continue
        }
        toCreate.push(product)
      }
    } catch (err: any) {
      errors.push(err.message)
    }
  }

  // 5. Build sku→cost map before running workflow
  const skuCostMap = extractSkuCosts(allRows)

  // 6. Run batch workflow
  let workflowResult: any
  try {
    const { result } = await batchProductsWorkflow(req.scope).run({
      input: {
        create: toCreate,
        update: toUpdate,
        delete: [],
      },
    })
    workflowResult = result
  } catch (err: any) {
    return res.status(500).json({ message: err.message, errors })
  }

  // 7. Save costs for variants that have a SKU in the CSV
  if (skuCostMap.size > 0) {
    try {
      const productService = req.scope.resolve(Modules.PRODUCT)
      const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)
      const skus = [...skuCostMap.keys()]

      const variants = await productService.listProductVariants(
        { sku: skus },
        { select: ["id", "sku"], take: skus.length }
      )

      for (const variant of variants) {
        const cost = skuCostMap.get(variant.sku!)
        if (cost == null) continue
        const [existing] = await variantCostService.listVariantCosts({
          variant_id: variant.id,
        })
        if (existing) {
          await variantCostService.updateVariantCosts(existing.id, { cost })
        } else {
          await variantCostService.createVariantCosts({
            variant_id: variant.id,
            cost,
          })
        }
      }
    } catch (err: any) {
      errors.push(`Cost save failed: ${err.message}`)
    }
  }

  res.json({
    created: toCreate.length,
    updated: toUpdate.length,
    errors,
    result: workflowResult,
  })
}

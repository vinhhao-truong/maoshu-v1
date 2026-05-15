import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const regionService = req.scope.resolve(Modules.REGION)
  const regions = await regionService.listRegions({}, {
    select: ["id", "name", "currency_code"],
  })

  // Correct format required by CSVNormalizer:
  // ISO code must be the LAST word. Region name goes in brackets before it.
  // e.g. "Variant Price [Vietnam] VND"  →  iso = "vnd", region = "Vietnam"
  // Duplicate currency codes are deduplicated so one price column per currency.
  const seenCurrencies = new Set<string>()
  const priceHeaders = regions
    .filter((r) => {
      if (seenCurrencies.has(r.currency_code)) return false
      seenCurrencies.add(r.currency_code)
      return true
    })
    .map((r) => `Variant Price [${r.name}] ${r.currency_code.toUpperCase()}`)

  const headers = [
    // ── Product fields ──────────────────────────────────────────────────────
    "Product Handle",         // required
    "Product Title",
    "Product Subtitle",
    "Product Description",
    "Product Status",         // draft | published
    "Product Thumbnail",
    "Product Weight",
    "Product Length",
    "Product Width",
    "Product Height",
    "Product Origin Country",
    "Product Material",
    "Product Discountable",   // TRUE | FALSE
    // ── Variant fields ──────────────────────────────────────────────────────
    "Variant Title",
    "Variant Sku",
    "Variant Manage Inventory", // FALSE = no stock tracking
    "Variant Allow Backorder",
    "Variant Weight",
    // ── Options (must be prefixed with "Variant") ────────────────────────
    "Variant Option 1 Name",
    "Variant Option 1 Value",
    // ── Prices ──────────────────────────────────────────────────────────────
    ...priceHeaders,
  ]

  const exampleRow = headers.map((h) => {
    switch (h) {
      case "Product Handle":            return "my-product-handle"
      case "Product Title":             return "My Product Title"
      case "Product Status":            return "draft"
      case "Product Discountable":      return "TRUE"
      case "Variant Title":             return "Default Title"
      case "Variant Sku":               return "MY-SKU-001"
      case "Variant Manage Inventory":  return "FALSE"
      case "Variant Allow Backorder":   return "FALSE"
      case "Variant Option 1 Name":     return "Title"
      case "Variant Option 1 Value":    return "Default Title"
      default:                          return ""
    }
  })

  const escape = (v: string) =>
    v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v

  const csv = "﻿" + [
    headers.map(escape).join(","),
    exampleRow.map(escape).join(","),
  ].join("\n")

  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=product-import-template.csv"
  )
  res.send(csv)
}

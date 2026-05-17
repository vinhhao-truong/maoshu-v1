import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VARIANT_COST_MODULE } from "../../../modules/variant-cost"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const regionService = req.scope.resolve(Modules.REGION)
  const variantCostService = req.scope.resolve(VARIANT_COST_MODULE)

  const regions = await regionService.listRegions({}, {
    select: ["id", "name", "currency_code"],
  })
  const regionMap = new Map(regions.map((r) => [r.id, r]))

  const allCosts = await variantCostService.listVariantCosts(
    {},
    { take: 100000 }
  )
  const costMap = new Map<string, number | null>(
    allCosts.map((c: any) => [c.variant_id, c.cost])
  )

  // Fetch all products with variants, options and prices via query.graph
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "handle", "title", "subtitle", "description", "status",
      "thumbnail", "weight", "length", "width", "height",
      "origin_country", "material", "discountable",
      "collection_id", "type_id", "external_id",
      "options.id", "options.title",
      "variants.id", "variants.title", "variants.sku",
      "variants.manage_inventory", "variants.allow_backorder", "variants.weight",
      "variants.options.value", "variants.options.option_id",
      "variants.price_set.prices.amount",
      "variants.price_set.prices.currency_code",
      "variants.price_set.prices.price_rules.attribute",
      "variants.price_set.prices.price_rules.value",
    ],
    pagination: { take: 10000, skip: 0 },
  })

  // Deduplicate price column headers by currency
  const seenCurrencies = new Set<string>()
  const priceHeaders = regions
    .filter((r) => {
      if (seenCurrencies.has(r.currency_code)) return false
      seenCurrencies.add(r.currency_code)
      return true
    })
    .map((r) => `Variant Price [${r.name}] ${r.currency_code.toUpperCase()}`)

  // Dynamic option column count based on widest product
  let maxOptions = 1
  for (const p of products as any[]) {
    const count = (p.options?.length ?? 0)
    if (count > maxOptions) maxOptions = count
  }
  const optionHeaders: string[] = []
  for (let i = 1; i <= maxOptions; i++) {
    optionHeaders.push(`Variant Option ${i} Name`, `Variant Option ${i} Value`)
  }

  const headers = [
    "Product Id",
    "Product Handle",
    "Product Title",
    "Product Subtitle",
    "Product Description",
    "Product Status",
    "Product Thumbnail",
    "Product Weight",
    "Product Length",
    "Product Width",
    "Product Height",
    "Product Origin Country",
    "Product Material",
    "Product Discountable",
    "Product Collection Id",
    "Product Type Id",
    "Product External Id",
    "Variant Title",
    "Variant Sku",
    "Variant Manage Inventory",
    "Variant Allow Backorder",
    "Variant Weight",
    "Variant Cost",
    ...optionHeaders,
    ...priceHeaders,
  ]

  const escape = (v: any): string => {
    const s = v == null ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const rows: string[] = [headers.map(escape).join(",")]

  for (const product of products as any[]) {
    const variants: any[] = product.variants?.length ? product.variants : [null]

    for (const variant of variants) {
      const productCols: Record<string, any> = {
        "Product Id": product.id,
        "Product Handle": product.handle,
        "Product Title": product.title,
        "Product Subtitle": product.subtitle,
        "Product Description": product.description,
        "Product Status": product.status,
        "Product Thumbnail": product.thumbnail,
        "Product Weight": product.weight,
        "Product Length": product.length,
        "Product Width": product.width,
        "Product Height": product.height,
        "Product Origin Country": product.origin_country,
        "Product Material": product.material,
        "Product Discountable": product.discountable != null
          ? String(product.discountable).toUpperCase() : "",
        "Product Collection Id": product.collection_id,
        "Product Type Id": product.type_id,
        "Product External Id": product.external_id,
      }

      const variantCols: Record<string, any> = {
        "Variant Title": variant?.title ?? "",
        "Variant Sku": variant?.sku ?? "",
        "Variant Manage Inventory": variant?.manage_inventory != null
          ? String(variant.manage_inventory).toUpperCase() : "FALSE",
        "Variant Allow Backorder": variant?.allow_backorder != null
          ? String(variant.allow_backorder).toUpperCase() : "FALSE",
        "Variant Weight": variant?.weight ?? "",
        "Variant Cost": variant?.id != null ? (costMap.get(variant.id) ?? "") : "",
      }

      // Options: match option_id → product option title
      const optionCols: Record<string, any> = {}
      const variantOptions: any[] = variant?.options ?? []
      variantOptions.forEach((opt: any, idx: number) => {
        const i = idx + 1
        const prodOption = product.options?.find((o: any) => o.id === opt.option_id)
        optionCols[`Variant Option ${i} Name`] = prodOption?.title ?? ""
        optionCols[`Variant Option ${i} Value`] = opt.value ?? ""
      })
      for (let i = variantOptions.length + 1; i <= maxOptions; i++) {
        optionCols[`Variant Option ${i} Name`] = ""
        optionCols[`Variant Option ${i} Value`] = ""
      }

      // Prices: format as "Variant Price [RegionName] CURRENCY"
      const priceCols: Record<string, any> = {}
      const prices: any[] = variant?.price_set?.prices ?? []

      for (const price of prices) {
        const regionRule = price.price_rules?.find(
          (r: any) => r.attribute === "region_id"
        )
        if (regionRule) {
          const region = regionMap.get(regionRule.value)
          if (region) {
            const col = `Variant Price [${region.name}] ${region.currency_code.toUpperCase()}`
            priceCols[col] = price.amount
          }
        } else if (!price.price_rules?.length) {
          const col = priceHeaders.find(
            (h) => h.endsWith(` ${price.currency_code.toUpperCase()}`)
          )
          if (col) priceCols[col] = price.amount
        }
      }
      for (const ph of priceHeaders) {
        if (!(ph in priceCols)) priceCols[ph] = ""
      }

      const row = headers.map((h) =>
        escape(productCols[h] ?? variantCols[h] ?? optionCols[h] ?? priceCols[h] ?? "")
      )
      rows.push(row.join(","))
    }
  }

  const csv = "﻿" + rows.join("\n")
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=product-export-${Date.now()}.csv`
  )
  res.send(csv)
}

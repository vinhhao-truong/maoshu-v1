"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const variant_cost_1 = require("../../../modules/variant-cost");
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const regionService = req.scope.resolve(utils_1.Modules.REGION);
    const variantCostService = req.scope.resolve(variant_cost_1.VARIANT_COST_MODULE);
    const regions = await regionService.listRegions({}, {
        select: ["id", "name", "currency_code"],
    });
    const regionMap = new Map(regions.map((r) => [r.id, r]));
    const allCosts = await variantCostService.listVariantCosts({}, { take: 100000 });
    const costMap = new Map(allCosts.map((c) => [c.variant_id, c.cost]));
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
    });
    // Deduplicate price column headers by currency
    const seenCurrencies = new Set();
    const priceHeaders = regions
        .filter((r) => {
        if (seenCurrencies.has(r.currency_code))
            return false;
        seenCurrencies.add(r.currency_code);
        return true;
    })
        .map((r) => `Variant Price [${r.name}] ${r.currency_code.toUpperCase()}`);
    // Dynamic option column count based on widest product
    let maxOptions = 1;
    for (const p of products) {
        const count = (p.options?.length ?? 0);
        if (count > maxOptions)
            maxOptions = count;
    }
    const optionHeaders = [];
    for (let i = 1; i <= maxOptions; i++) {
        optionHeaders.push(`Variant Option ${i} Name`, `Variant Option ${i} Value`);
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
    ];
    const escape = (v) => {
        const s = v == null ? "" : String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    };
    const rows = [headers.map(escape).join(",")];
    for (const product of products) {
        const variants = product.variants?.length ? product.variants : [null];
        for (const variant of variants) {
            const productCols = {
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
            };
            const variantCols = {
                "Variant Title": variant?.title ?? "",
                "Variant Sku": variant?.sku ?? "",
                "Variant Manage Inventory": variant?.manage_inventory != null
                    ? String(variant.manage_inventory).toUpperCase() : "FALSE",
                "Variant Allow Backorder": variant?.allow_backorder != null
                    ? String(variant.allow_backorder).toUpperCase() : "FALSE",
                "Variant Weight": variant?.weight ?? "",
                "Variant Cost": variant?.id != null ? (costMap.get(variant.id) ?? "") : "",
            };
            // Options: match option_id → product option title
            const optionCols = {};
            const variantOptions = variant?.options ?? [];
            variantOptions.forEach((opt, idx) => {
                const i = idx + 1;
                const prodOption = product.options?.find((o) => o.id === opt.option_id);
                optionCols[`Variant Option ${i} Name`] = prodOption?.title ?? "";
                optionCols[`Variant Option ${i} Value`] = opt.value ?? "";
            });
            for (let i = variantOptions.length + 1; i <= maxOptions; i++) {
                optionCols[`Variant Option ${i} Name`] = "";
                optionCols[`Variant Option ${i} Value`] = "";
            }
            // Prices: format as "Variant Price [RegionName] CURRENCY"
            const priceCols = {};
            const prices = variant?.price_set?.prices ?? [];
            for (const price of prices) {
                const regionRule = price.price_rules?.find((r) => r.attribute === "region_id");
                if (regionRule) {
                    const region = regionMap.get(regionRule.value);
                    if (region) {
                        const col = `Variant Price [${region.name}] ${region.currency_code.toUpperCase()}`;
                        priceCols[col] = price.amount;
                    }
                }
                else if (!price.price_rules?.length) {
                    const col = priceHeaders.find((h) => h.endsWith(` ${price.currency_code.toUpperCase()}`));
                    if (col)
                        priceCols[col] = price.amount;
                }
            }
            for (const ph of priceHeaders) {
                if (!(ph in priceCols))
                    priceCols[ph] = "";
            }
            const row = headers.map((h) => escape(productCols[h] ?? variantCols[h] ?? optionCols[h] ?? priceCols[h] ?? ""));
            rows.push(row.join(","));
        }
    }
    const csv = "﻿" + rows.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=product-export-${Date.now()}.csv`);
    res.send(csv);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3QtZXhwb3J0L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsa0JBeUxDO0FBNUxELHFEQUE4RTtBQUM5RSxnRUFBbUU7QUFFNUQsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN2RCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGtDQUFtQixDQUFDLENBQUE7SUFFakUsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRTtRQUNsRCxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLGVBQWUsQ0FBQztLQUN4QyxDQUFDLENBQUE7SUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRXhELE1BQU0sUUFBUSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsZ0JBQWdCLENBQ3hELEVBQUUsRUFDRixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FDakIsQ0FBQTtJQUNELE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUNyQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVB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
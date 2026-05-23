"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const regionService = req.scope.resolve(utils_1.Modules.REGION);
    const regions = await regionService.listRegions({}, {
        select: ["id", "name", "currency_code"],
    });
    // Correct format required by CSVNormalizer:
    // ISO code must be the LAST word. Region name goes in brackets before it.
    // e.g. "Variant Price [Vietnam] VND"  →  iso = "vnd", region = "Vietnam"
    // Duplicate currency codes are deduplicated so one price column per currency.
    const seenCurrencies = new Set();
    const priceHeaders = regions
        .filter((r) => {
        if (seenCurrencies.has(r.currency_code))
            return false;
        seenCurrencies.add(r.currency_code);
        return true;
    })
        .map((r) => `Variant Price [${r.name}] ${r.currency_code.toUpperCase()}`);
    const headers = [
        // ── Product fields ──────────────────────────────────────────────────────
        "Product Handle", // required
        "Product Title",
        "Product Subtitle",
        "Product Description",
        "Product Status", // draft | published
        "Product Thumbnail",
        "Product Weight",
        "Product Length",
        "Product Width",
        "Product Height",
        "Product Origin Country",
        "Product Material",
        "Product Discountable", // TRUE | FALSE
        // ── Variant fields ──────────────────────────────────────────────────────
        "Variant Title",
        "Variant Sku",
        "Variant Manage Inventory", // FALSE = no stock tracking
        "Variant Allow Backorder",
        "Variant Weight",
        "Variant Cost",
        // ── Options (must be prefixed with "Variant") ────────────────────────
        "Variant Option 1 Name",
        "Variant Option 1 Value",
        // ── Prices ──────────────────────────────────────────────────────────────
        ...priceHeaders,
    ];
    const exampleRow = headers.map((h) => {
        switch (h) {
            case "Product Handle": return "my-product-handle";
            case "Product Title": return "My Product Title";
            case "Product Status": return "draft";
            case "Product Discountable": return "TRUE";
            case "Variant Title": return "Default Title";
            case "Variant Sku": return "MY-SKU-001";
            case "Variant Manage Inventory": return "FALSE";
            case "Variant Allow Backorder": return "FALSE";
            case "Variant Option 1 Name": return "Title";
            case "Variant Option 1 Value": return "Default Title";
            default: return "";
        }
    });
    const escape = (v) => v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = "﻿" + [
        headers.map(escape).join(","),
        exampleRow.map(escape).join(","),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=product-import-template.csv");
    res.send(csv);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3QtaW1wb3J0LXRlbXBsYXRlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esa0JBOEVDO0FBaEZELHFEQUFtRDtBQUU1QyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUU7UUFDbEQsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUM7S0FDeEMsQ0FBQyxDQUFBO0lBRUYsNENBQTRDO0lBQzVDLDBFQUEwRTtJQUMxRSx5RUFBeUU7SUFDekUsOEVBQThFO0lBQzlFLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUE7SUFDeEMsTUFBTSxZQUFZLEdBQUcsT0FBTztTQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNaLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUE7UUFDckQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDbkMsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLENBQUM7U0FDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRTNFLE1BQU0sT0FBTyxHQUFHO1FBQ2QsMkVBQTJFO1FBQzNFLGdCQUFnQixFQUFVLFdBQVc7UUFDckMsZUFBZTtRQUNmLGtCQUFrQjtRQUNsQixxQkFBcUI7UUFDckIsZ0JBQWdCLEVBQVUsb0JBQW9CO1FBQzlDLG1CQUFtQjtRQUNuQixnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZixnQkFBZ0I7UUFDaEIsd0JBQXdCO1FBQ3hCLGtCQUFrQjtRQUNsQixzQkFBc0IsRUFBSSxlQUFlO1FBQ3pDLDJFQUEyRTtRQUMzRSxlQUFlO1FBQ2YsYUFBYTtRQUNiLDBCQUEwQixFQUFFLDRCQUE0QjtRQUN4RCx5QkFBeUI7UUFDekIsZ0JBQWdCO1FBQ2hCLGNBQWM7UUFDZCx3RUFBd0U7UUFDeEUsdUJBQXVCO1FBQ3ZCLHdCQUF3QjtRQUN4QiwyRUFBMkU7UUFDM0UsR0FBRyxZQUFZO0tBQ2hCLENBQUE7SUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNWLEtBQUssZ0JBQWdCLENBQUMsQ0FBWSxPQUFPLG1CQUFtQixDQUFBO1lBQzVELEtBQUssZUFBZSxDQUFDLENBQWEsT0FBTyxrQkFBa0IsQ0FBQTtZQUMzRCxLQUFLLGdCQUFnQixDQUFDLENBQVksT0FBTyxPQUFPLENBQUE7WUFDaEQsS0FBSyxzQkFBc0IsQ0FBQyxDQUFNLE9BQU8sTUFBTSxDQUFBO1lBQy9DLEtBQUssZUFBZSxDQUFDLENBQWEsT0FBTyxlQUFlLENBQUE7WUFDeEQsS0FBSyxhQUFhLENBQUMsQ0FBZSxPQUFPLFlBQVksQ0FBQTtZQUNyRCxLQUFLLDBCQUEwQixDQUFDLENBQUUsT0FBTyxPQUFPLENBQUE7WUFDaEQsS0FBSyx5QkFBeUIsQ0FBQyxDQUFHLE9BQU8sT0FBTyxDQUFBO1lBQ2hELEtBQUssdUJBQXVCLENBQUMsQ0FBSyxPQUFPLE9BQU8sQ0FBQTtZQUNoRCxLQUFLLHdCQUF3QixDQUFDLENBQUksT0FBTyxlQUFlLENBQUE7WUFDeEQsT0FBTyxDQUFDLENBQTBCLE9BQU8sRUFBRSxDQUFBO1FBQzdDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVGLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FDM0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUV2RSxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQzdCLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUNqQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVaLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLENBQUE7SUFDeEQsR0FBRyxDQUFDLFNBQVMsQ0FDWCxxQkFBcUIsRUFDckIsa0RBQWtELENBQ25ELENBQUE7SUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2YsQ0FBQyJ9
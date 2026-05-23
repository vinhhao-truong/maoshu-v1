"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const busboy_1 = __importDefault(require("busboy"));
const csv_parse_1 = require("csv-parse");
const variant_cost_1 = require("../../../modules/variant-cost");
// Parse the multipart file upload, return CSV string
function readUploadedCSV(req) {
    return new Promise((resolve, reject) => {
        const bb = (0, busboy_1.default)({ headers: req.headers });
        let csvContent = "";
        let found = false;
        bb.on("file", (_field, stream, _info) => {
            found = true;
            const chunks = [];
            stream.on("data", (d) => chunks.push(d));
            stream.on("end", () => {
                csvContent = Buffer.concat(chunks).toString("utf-8");
            });
        });
        bb.on("finish", () => {
            if (!found)
                return reject(new Error("No file uploaded"));
            resolve(csvContent);
        });
        bb.on("error", reject);
        req.pipe(bb);
    });
}
// Parse a price column name: "Variant Price [Region] VND" → "vnd"
function parsePriceISO(colName) {
    const iso = colName.split(" ").pop();
    return iso ? iso.toLowerCase() : null;
}
// Build the variant object from a CSV row
function buildVariant(row, isUpdate) {
    const variant = {};
    const variantId = row["Variant Id"]?.trim();
    if (variantId && isUpdate)
        variant.id = variantId;
    const title = row["Variant Title"]?.trim();
    if (title)
        variant.title = title;
    const sku = row["Variant Sku"]?.trim();
    if (sku)
        variant.sku = sku;
    const mi = row["Variant Manage Inventory"]?.trim();
    if (mi)
        variant.manage_inventory = mi.toUpperCase() === "TRUE";
    const ab = row["Variant Allow Backorder"]?.trim();
    if (ab)
        variant.allow_backorder = ab.toUpperCase() === "TRUE";
    const w = row["Variant Weight"]?.trim();
    if (w && !isNaN(Number(w)))
        variant.weight = Number(w);
    // Options: Variant Option 1 Name / Value, 2, 3 ...
    const options = {};
    for (let i = 1; i <= 10; i++) {
        const name = row[`Variant Option ${i} Name`]?.trim();
        const value = row[`Variant Option ${i} Value`]?.trim();
        if (!name)
            break;
        if (value)
            options[name] = value;
    }
    if (Object.keys(options).length > 0)
        variant.options = options;
    // Prices: any column starting with "Variant Price "
    const prices = [];
    for (const [col, val] of Object.entries(row)) {
        if (!col.startsWith("Variant Price ") || !val?.trim())
            continue;
        const iso = parsePriceISO(col);
        const amount = Number(val.trim());
        if (iso && !isNaN(amount) && amount > 0) {
            prices.push({ currency_code: iso, amount });
        }
    }
    variant.prices = prices;
    return variant;
}
// Extract sku→cost pairs from all rows for post-workflow cost saving
function extractSkuCosts(allRows) {
    const map = new Map();
    for (const row of allRows) {
        const sku = row["Variant Sku"]?.trim();
        const costStr = row["Variant Cost"]?.trim();
        if (sku && costStr && !isNaN(Number(costStr))) {
            map.set(sku, Number(costStr));
        }
    }
    return map;
}
// Build the product object from a group of rows (one row per variant)
function buildProduct(rows, isUpdate) {
    const first = rows[0];
    const product = {};
    const handle = first["Product Handle"]?.trim();
    if (handle)
        product.handle = handle;
    const title = first["Product Title"]?.trim();
    if (title)
        product.title = title;
    const subtitle = first["Product Subtitle"]?.trim();
    if (subtitle)
        product.subtitle = subtitle;
    const description = first["Product Description"]?.trim();
    if (description)
        product.description = description;
    const status = first["Product Status"]?.trim().toLowerCase();
    if (status)
        product.status = status;
    const thumbnail = first["Product Thumbnail"]?.trim();
    if (thumbnail)
        product.thumbnail = thumbnail;
    const weight = first["Product Weight"]?.trim();
    if (weight && !isNaN(Number(weight)))
        product.weight = Number(weight);
    const length = first["Product Length"]?.trim();
    if (length && !isNaN(Number(length)))
        product.length = Number(length);
    const width = first["Product Width"]?.trim();
    if (width && !isNaN(Number(width)))
        product.width = Number(width);
    const height = first["Product Height"]?.trim();
    if (height && !isNaN(Number(height)))
        product.height = Number(height);
    const origin = first["Product Origin Country"]?.trim();
    if (origin)
        product.origin_country = origin;
    const material = first["Product Material"]?.trim();
    if (material)
        product.material = material;
    const disc = first["Product Discountable"]?.trim();
    if (disc)
        product.discountable = disc.toUpperCase() === "TRUE";
    // Build options list from all rows
    const optionMap = new Map();
    for (const row of rows) {
        for (let i = 1; i <= 10; i++) {
            const name = row[`Variant Option ${i} Name`]?.trim();
            const value = row[`Variant Option ${i} Value`]?.trim();
            if (!name)
                break;
            if (!optionMap.has(name))
                optionMap.set(name, new Set());
            if (value)
                optionMap.get(name).add(value);
        }
    }
    if (optionMap.size > 0) {
        product.options = [...optionMap.entries()].map(([title, values]) => ({
            title,
            values: [...values],
        }));
    }
    // Build variants
    product.variants = rows
        .filter((r) => r["Variant Title"]?.trim())
        .map((r) => buildVariant(r, isUpdate));
    return product;
}
async function POST(req, res) {
    // 1. Read uploaded CSV
    let csvContent;
    try {
        csvContent = await readUploadedCSV(req);
    }
    catch {
        return res.status(400).json({ message: "No CSV file found in request" });
    }
    // 2. Parse CSV rows (csv-parse handles UTF-8 BOM with bom: true)
    let allRows;
    try {
        allRows = await new Promise((resolve, reject) => {
            (0, csv_parse_1.parse)(csvContent, { columns: true, skip_empty_lines: true, bom: true, trim: true, relax_column_count: true }, (err, records) => {
                if (err)
                    reject(err);
                else
                    resolve(records);
            });
        });
    }
    catch (err) {
        return res.status(400).json({ message: `CSV parse error: ${err.message}` });
    }
    if (allRows.length === 0) {
        return res.status(400).json({ message: "CSV is empty" });
    }
    // 3. Group rows by product key (Product Id takes priority, then Handle)
    const productGroups = new Map();
    for (const row of allRows) {
        const key = row["Product Id"]?.trim() || row["Product Handle"]?.trim();
        if (!key)
            continue;
        if (!productGroups.has(key))
            productGroups.set(key, []);
        productGroups.get(key).push(row);
    }
    // 4. Look up existing products by ID or handle
    const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
    const toCreate = [];
    const toUpdate = [];
    const errors = [];
    for (const [_key, rows] of productGroups) {
        try {
            const first = rows[0];
            const productId = first["Product Id"]?.trim();
            const handle = first["Product Handle"]?.trim();
            let existingId;
            if (productId) {
                const [found] = await productService.listProducts({ id: productId }, { select: ["id"], take: 1 });
                if (found)
                    existingId = found.id;
            }
            if (!existingId && handle) {
                const [found] = await productService.listProducts({ handle }, { select: ["id"], take: 1 });
                if (found)
                    existingId = found.id;
            }
            if (existingId) {
                const product = buildProduct(rows, true);
                toUpdate.push({ id: existingId, ...product });
            }
            else {
                const product = buildProduct(rows, false);
                if (!product.title) {
                    errors.push(`Row skipped: no title for handle "${handle}"`);
                    continue;
                }
                toCreate.push(product);
            }
        }
        catch (err) {
            errors.push(err.message);
        }
    }
    // 5. Build sku→cost map before running workflow
    const skuCostMap = extractSkuCosts(allRows);
    // 6. Run batch workflow
    let workflowResult;
    try {
        const { result } = await (0, core_flows_1.batchProductsWorkflow)(req.scope).run({
            input: {
                create: toCreate,
                update: toUpdate,
                delete: [],
            },
        });
        workflowResult = result;
    }
    catch (err) {
        return res.status(500).json({ message: err.message, errors });
    }
    // 7. Save costs for variants that have a SKU in the CSV
    if (skuCostMap.size > 0) {
        try {
            const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
            const variantCostService = req.scope.resolve(variant_cost_1.VARIANT_COST_MODULE);
            const skus = [...skuCostMap.keys()];
            const variants = await productService.listProductVariants({ sku: skus }, { select: ["id", "sku"], take: skus.length });
            for (const variant of variants) {
                const cost = skuCostMap.get(variant.sku);
                if (cost == null)
                    continue;
                const [existing] = await variantCostService.listVariantCosts({
                    variant_id: variant.id,
                });
                if (existing) {
                    await variantCostService.updateVariantCosts([{ id: existing.id, cost }]);
                }
                else {
                    await variantCostService.createVariantCosts({
                        variant_id: variant.id,
                        cost,
                    });
                }
            }
        }
        catch (err) {
            errors.push(`Cost save failed: ${err.message}`);
        }
    }
    res.json({
        created: toCreate.length,
        updated: toUpdate.length,
        errors,
        result: workflowResult,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3QtaW1wb3J0L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBMktBLG9CQThJQztBQXhURCxxREFBbUQ7QUFDbkQscURBQTREO0FBQzVELG9EQUEyQjtBQUMzQix5Q0FBaUM7QUFDakMsZ0VBQW1FO0FBRW5FLHFEQUFxRDtBQUNyRCxTQUFTLGVBQWUsQ0FBQyxHQUFrQjtJQUN6QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sRUFBRSxHQUFHLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBYyxFQUFFLENBQUMsQ0FBQTtRQUNsRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBRWpCLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN0QyxLQUFLLEdBQUcsSUFBSSxDQUFBO1lBQ1osTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFBO1lBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO2dCQUNwQixVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDdEQsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtRQUVGLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7WUFDeEQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNkLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxTQUFTLGFBQWEsQ0FBQyxPQUFlO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDcEMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0FBQ3ZDLENBQUM7QUFFRCwwQ0FBMEM7QUFDMUMsU0FBUyxZQUFZLENBQUMsR0FBMkIsRUFBRSxRQUFpQjtJQUNsRSxNQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFBO0lBRXZDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUMzQyxJQUFJLFNBQVMsSUFBSSxRQUFRO1FBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUE7SUFFakQsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQzFDLElBQUksS0FBSztRQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBRWhDLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUN0QyxJQUFJLEdBQUc7UUFBRSxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUUxQixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUNsRCxJQUFJLEVBQUU7UUFBRSxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQTtJQUU5RCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUNqRCxJQUFJLEVBQUU7UUFBRSxPQUFPLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUE7SUFFN0QsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFdEQsbURBQW1EO0lBQ25ELE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUE7SUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtRQUNwRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7UUFDdEQsSUFBSSxDQUFDLElBQUk7WUFBRSxNQUFLO1FBQ2hCLElBQUksS0FBSztZQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUE7SUFDbEMsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0lBRTlELG9EQUFvRDtJQUNwRCxNQUFNLE1BQU0sR0FBZ0QsRUFBRSxDQUFBO0lBQzlELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7WUFBRSxTQUFRO1FBQy9ELE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7UUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDN0MsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUV2QixPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQscUVBQXFFO0FBQ3JFLFNBQVMsZUFBZSxDQUN0QixPQUFpQztJQUVqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQTtJQUNyQyxLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzFCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtRQUN0QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7UUFDM0MsSUFBSSxHQUFHLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUM7QUFFRCxzRUFBc0U7QUFDdEUsU0FBUyxZQUFZLENBQUMsSUFBOEIsRUFBRSxRQUFpQjtJQUNyRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckIsTUFBTSxPQUFPLEdBQXdCLEVBQUUsQ0FBQTtJQUV2QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUM5QyxJQUFJLE1BQU07UUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUVuQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDNUMsSUFBSSxLQUFLO1FBQUUsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7SUFFaEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDbEQsSUFBSSxRQUFRO1FBQUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFFekMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDeEQsSUFBSSxXQUFXO1FBQUUsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7SUFFbEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDNUQsSUFBSSxNQUFNO1FBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFFbkMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDcEQsSUFBSSxTQUFTO1FBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7SUFFNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDOUMsSUFBSSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFckUsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDOUMsSUFBSSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFckUsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQzVDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWpFLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQzlDLElBQUksTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRXJFLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQ3RELElBQUksTUFBTTtRQUFFLE9BQU8sQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFBO0lBRTNDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQ2xELElBQUksUUFBUTtRQUFFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0lBRXpDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQ2xELElBQUksSUFBSTtRQUFFLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQTtJQUU5RCxtQ0FBbUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUE7SUFDaEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO1lBQ3BELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtZQUN0RCxJQUFJLENBQUMsSUFBSTtnQkFBRSxNQUFLO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDeEQsSUFBSSxLQUFLO2dCQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzVDLENBQUM7SUFDSCxDQUFDO0lBQ0QsSUFBSSxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLEtBQUs7WUFDTCxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztTQUNwQixDQUFDLENBQUMsQ0FBQTtJQUNMLENBQUM7SUFFRCxpQkFBaUI7SUFDakIsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJO1NBQ3BCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3pDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBO0lBRXhDLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFFTSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsdUJBQXVCO0lBQ3ZCLElBQUksVUFBa0IsQ0FBQTtJQUN0QixJQUFJLENBQUM7UUFDSCxVQUFVLEdBQUcsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsOEJBQThCLEVBQUUsQ0FBQyxDQUFBO0lBQzFFLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsSUFBSSxPQUFpQyxDQUFBO0lBQ3JDLElBQUksQ0FBQztRQUNILE9BQU8sR0FBRyxNQUFNLElBQUksT0FBTyxDQUEyQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN4RSxJQUFBLGlCQUFLLEVBQ0gsVUFBVSxFQUNWLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxFQUMxRixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDZixJQUFJLEdBQUc7b0JBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztvQkFDZixPQUFPLENBQUMsT0FBbUMsQ0FBQyxDQUFBO1lBQ25ELENBQUMsQ0FDRixDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQzdFLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBO0lBQzFELENBQUM7SUFFRCx3RUFBd0U7SUFDeEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUE7SUFDakUsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUMxQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7UUFDdEUsSUFBSSxDQUFDLEdBQUc7WUFBRSxTQUFRO1FBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZELGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXpELE1BQU0sUUFBUSxHQUFVLEVBQUUsQ0FBQTtJQUMxQixNQUFNLFFBQVEsR0FBVSxFQUFFLENBQUE7SUFDMUIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFBO0lBRTNCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUM7WUFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDckIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO1lBQzdDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFBO1lBRTlDLElBQUksVUFBOEIsQ0FBQTtZQUVsQyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQy9DLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUNqQixFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FDNUIsQ0FBQTtnQkFDRCxJQUFJLEtBQUs7b0JBQUUsVUFBVSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUE7WUFDbEMsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQy9DLEVBQUUsTUFBTSxFQUFFLEVBQ1YsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQzVCLENBQUE7Z0JBQ0QsSUFBSSxLQUFLO29CQUFFLFVBQVUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFBO1lBQ2xDLENBQUM7WUFFRCxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNmLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7Z0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUMvQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtnQkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtvQkFDM0QsU0FBUTtnQkFDVixDQUFDO2dCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDeEIsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzFCLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUUzQyx3QkFBd0I7SUFDeEIsSUFBSSxjQUFtQixDQUFBO0lBQ3ZCLElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsa0NBQXFCLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUM1RCxLQUFLLEVBQUU7Z0JBQ0wsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixNQUFNLEVBQUUsRUFBRTthQUNYO1NBQ0YsQ0FBQyxDQUFBO1FBQ0YsY0FBYyxHQUFHLE1BQU0sQ0FBQTtJQUN6QixDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUM7WUFDSCxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDekQsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQ0FBbUIsQ0FBQyxDQUFBO1lBQ2pFLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUVuQyxNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsQ0FDdkQsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQ2IsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FDN0MsQ0FBQTtZQUVELEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUksQ0FBQyxDQUFBO2dCQUN6QyxJQUFJLElBQUksSUFBSSxJQUFJO29CQUFFLFNBQVE7Z0JBQzFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO29CQUMzRCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7aUJBQ3ZCLENBQUMsQ0FBQTtnQkFDRixJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNiLE1BQU0sa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDMUUsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE1BQU0sa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7d0JBQzFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDdEIsSUFBSTtxQkFDTCxDQUFDLENBQUE7Z0JBQ0osQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUNqRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU07UUFDeEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxNQUFNO1FBQ3hCLE1BQU07UUFDTixNQUFNLEVBQUUsY0FBYztLQUN2QixDQUFDLENBQUE7QUFDSixDQUFDIn0=
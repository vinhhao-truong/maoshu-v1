"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const medusa_1 = require("@medusajs/medusa");
const BRAND_FIELDS = [
    "brand.id",
    "brand.name",
    "brand.handle",
    "brand.description",
    "brand.logo_url",
    "brand.is_active",
];
function injectBrandFields(req, res, next) {
    if (req.remoteQueryConfig?.fields) {
        // validateAndTransformQuery already ran — append directly to the resolved fields list
        req.remoteQueryConfig.fields.push(...BRAND_FIELDS);
    }
    else {
        // validateAndTransformQuery hasn't run yet — use req.allowed so it picks them up
        req.allowed = [...(req.allowed ?? []), ...BRAND_FIELDS];
        const existing = req.query.fields ?? "";
        const additions = BRAND_FIELDS.map((f) => `+${f}`).join(",");
        req.query = {
            ...req.query,
            fields: existing ? `${existing},${additions}` : additions,
        };
    }
    next();
}
exports.default = (0, medusa_1.defineMiddlewares)({
    routes: [
        {
            matcher: "/admin/uploads",
            method: ["POST"],
            bodyParser: { sizeLimit: "10mb" },
        },
        {
            matcher: "/store/products",
            method: ["GET"],
            middlewares: [injectBrandFields],
        },
        {
            matcher: "/store/products/:id",
            method: ["GET"],
            middlewares: [injectBrandFields],
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21pZGRsZXdhcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW9EO0FBT3BELE1BQU0sWUFBWSxHQUFHO0lBQ25CLFVBQVU7SUFDVixZQUFZO0lBQ1osY0FBYztJQUNkLG1CQUFtQjtJQUNuQixnQkFBZ0I7SUFDaEIsaUJBQWlCO0NBQ2xCLENBQUE7QUFFRCxTQUFTLGlCQUFpQixDQUN4QixHQUFrQixFQUNsQixHQUFtQixFQUNuQixJQUF3QjtJQUV4QixJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUNsQyxzRkFBc0Y7UUFDdEYsR0FBRyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQTtJQUNwRCxDQUFDO1NBQU0sQ0FBQztRQUNOLGlGQUFpRjtRQUNqRixHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQTtRQUN2RCxNQUFNLFFBQVEsR0FBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQWlCLElBQUksRUFBRSxDQUFBO1FBQ25ELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDNUQsR0FBRyxDQUFDLEtBQUssR0FBRztZQUNWLEdBQUcsR0FBRyxDQUFDLEtBQUs7WUFDWixNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUMxRCxDQUFBO0lBQ0gsQ0FBQztJQUNELElBQUksRUFBRSxDQUFBO0FBQ1IsQ0FBQztBQUVELGtCQUFlLElBQUEsMEJBQWlCLEVBQUM7SUFDL0IsTUFBTSxFQUFFO1FBQ047WUFDRSxPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNoQixVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO1NBQ2xDO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLFdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1NBQ2pDO1FBQ0Q7WUFDRSxPQUFPLEVBQUUscUJBQXFCO1lBQzlCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLFdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1NBQ2pDO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==
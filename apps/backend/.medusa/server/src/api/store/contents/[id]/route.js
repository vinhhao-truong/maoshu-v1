"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const content_1 = require("../../../../modules/content");
async function GET(req, res) {
    const contentService = req.scope.resolve(content_1.CONTENT_MODULE);
    // Support lookup by handle (storefront) or by ID (direct)
    const param = req.params.id;
    const byHandle = await contentService.listContents({
        handle: param,
        status: "published",
        is_active: true,
    });
    const content = byHandle[0] ??
        (await contentService.listContents({ id: param, status: "published", is_active: true }).then((r) => r[0] ?? null));
    if (!content) {
        return res.status(404).json({ message: "Content not found" });
    }
    res.json({ content });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NvbnRlbnRzL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFvQkM7QUF2QkQseURBQTREO0FBR3JELEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLGNBQWMsR0FBeUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQWMsQ0FBQyxDQUFBO0lBRTlFLDBEQUEwRDtJQUMxRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQTtJQUMzQixNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUM7UUFDakQsTUFBTSxFQUFFLEtBQUs7UUFDYixNQUFNLEVBQUUsV0FBVztRQUNuQixTQUFTLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUE7SUFFRixNQUFNLE9BQU8sR0FDWCxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUVwSCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDYixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkIsQ0FBQyJ9
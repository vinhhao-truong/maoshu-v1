"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const business_info_1 = require("../../../modules/business-info");
async function GET(req, res) {
    const service = req.scope.resolve(business_info_1.BUSINESS_INFO_MODULE);
    const { root_category_id } = req.query;
    const filter = root_category_id ? { root_category_id } : {};
    const [info] = await service.listBusinessInfoes(filter, { take: 1 });
    res.json({ business_info: info ?? null });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2J1c2luZXNzLWluZm8vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFNQztBQVRELGtFQUFxRTtBQUc5RCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxPQUFPLEdBQThCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9DQUFvQixDQUFDLENBQUE7SUFDbEYsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQXNDLENBQUE7SUFDdkUsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzNDLENBQUMifQ==
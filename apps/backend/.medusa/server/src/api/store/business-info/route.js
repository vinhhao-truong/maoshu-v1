"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const business_info_1 = require("../../../modules/business-info");
async function GET(req, res) {
    const service = req.scope.resolve(business_info_1.BUSINESS_INFO_MODULE);
    const [info] = await service.listBusinessInfoes({}, { take: 1 });
    res.json({ business_info: info ?? null });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2J1c2luZXNzLWluZm8vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFJQztBQVBELGtFQUFxRTtBQUc5RCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxPQUFPLEdBQThCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9DQUFvQixDQUFDLENBQUE7SUFDbEYsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUE7QUFDM0MsQ0FBQyJ9
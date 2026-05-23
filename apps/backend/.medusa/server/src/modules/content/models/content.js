"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const Content = utils_1.model.define("content", {
    id: utils_1.model.id({ prefix: "cnt" }).primaryKey(),
    title: utils_1.model.text(),
    handle: utils_1.model.text(),
    // "news" | "terms" | "privacy" | "return_policy" | "faq" | "announcement"
    type: utils_1.model.text(),
    body: utils_1.model.text().nullable(),
    excerpt: utils_1.model.text().nullable(),
    thumbnail_url: utils_1.model.text().nullable(),
    author: utils_1.model.text().nullable(),
    // "draft" | "published" | "archived"
    status: utils_1.model.text().default("draft"),
    published_at: utils_1.model.dateTime().nullable(),
    seo_title: utils_1.model.text().nullable(),
    seo_description: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    is_active: utils_1.model.boolean().default(true),
    in_footer: utils_1.model.boolean().default(false),
});
exports.default = Content;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2NvbnRlbnQvbW9kZWxzL2NvbnRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7SUFDdEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDNUMsS0FBSyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDbkIsTUFBTSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDcEIsMEVBQTBFO0lBQzFFLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ2xCLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdCLE9BQU8sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2hDLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3RDLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQy9CLHFDQUFxQztJQUNyQyxNQUFNLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDckMsWUFBWSxFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDekMsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbEMsZUFBZSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDeEMsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDakMsU0FBUyxFQUFFLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3hDLFNBQVMsRUFBRSxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztDQUMxQyxDQUFDLENBQUE7QUFFRixrQkFBZSxPQUFPLENBQUEifQ==
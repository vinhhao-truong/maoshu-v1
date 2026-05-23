"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const VariantCost = utils_1.model.define("variant_cost", {
    id: utils_1.model.id({ prefix: "vcost" }).primaryKey(),
    variant_id: utils_1.model.text(),
    cost: utils_1.model.number().nullable(),
});
exports.default = VariantCost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFudC1jb3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvdmFyaWFudC1jb3N0L21vZGVscy92YXJpYW50LWNvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxXQUFXLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7SUFDL0MsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDOUMsVUFBVSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDeEIsSUFBSSxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDaEMsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsV0FBVyxDQUFBIn0=
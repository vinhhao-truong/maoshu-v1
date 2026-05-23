"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const SystemColor = utils_1.model.define("system_color", {
    id: utils_1.model.id({ prefix: "syscol" }).primaryKey(),
    name: utils_1.model.text(),
    hex: utils_1.model.text(),
});
exports.default = SystemColor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLWNvbG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvc3lzdGVtLWNvbG9yL21vZGVscy9zeXN0ZW0tY29sb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxXQUFXLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7SUFDL0MsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7SUFDL0MsSUFBSSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDbEIsR0FBRyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7Q0FDbEIsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsV0FBVyxDQUFBIn0=
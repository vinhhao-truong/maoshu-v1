"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_1 = __importDefault(require("@medusajs/medusa/product"));
const brand_1 = __importDefault(require("../modules/brand"));
exports.default = (0, utils_1.defineLink)(product_1.default.linkable.product, {
    linkable: brand_1.default.linkable.brand,
    deleteCascade: true,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdC1icmFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saW5rcy9wcm9kdWN0LWJyYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscURBQXNEO0FBQ3RELHVFQUFvRDtBQUNwRCw2REFBMEM7QUFFMUMsa0JBQWUsSUFBQSxrQkFBVSxFQUN2QixpQkFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQzlCO0lBQ0UsUUFBUSxFQUFFLGVBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSztJQUNwQyxhQUFhLEVBQUUsSUFBSTtDQUNwQixDQUNGLENBQUEifQ==
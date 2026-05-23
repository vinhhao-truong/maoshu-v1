"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260521000000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260521000000 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table "business_info" add column if not exists "zalo_url" text null;`);
        this.addSql(`alter table "business_info" add column if not exists "about_us" text null;`);
    }
    async down() {
        this.addSql(`alter table "business_info" drop column if exists "zalo_url";`);
        this.addSql(`alter table "business_info" drop column if exists "about_us";`);
    }
}
exports.Migration20260521000000 = Migration20260521000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MjEwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9idXNpbmVzcy1pbmZvL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNjA1MjEwMDAwMDAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQXFFO0FBRXJFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7UUFDMUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQywrREFBK0QsQ0FBQyxDQUFDO0lBQy9FLENBQUM7Q0FFRjtBQVpELDBEQVlDIn0=
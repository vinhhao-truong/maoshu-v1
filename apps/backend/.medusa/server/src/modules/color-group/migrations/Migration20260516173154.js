"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260516173154 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260516173154 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "color_group" ("id" text not null, "name" text not null, "primary" text null, "secondary" text null, "inverse" text null, "neutral" text null, "success" text null, "warning" text null, "danger" text null, "info" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "color_group_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_color_group_deleted_at" ON "color_group" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "color_group" cascade;`);
    }
}
exports.Migration20260516173154 = Migration20260516173154;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTYxNzMxNTQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9jb2xvci1ncm91cC9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjYwNTE2MTczMTU0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlFQUFxRTtBQUVyRSxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQywrYUFBK2EsQ0FBQyxDQUFDO1FBQzdiLElBQUksQ0FBQyxNQUFNLENBQUMsbUhBQW1ILENBQUMsQ0FBQztJQUNuSSxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FFRjtBQVhELDBEQVdDIn0=
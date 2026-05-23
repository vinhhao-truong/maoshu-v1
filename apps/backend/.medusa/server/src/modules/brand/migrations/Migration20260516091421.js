"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260516091421 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260516091421 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "brand" ("id" text not null, "name" text not null, "handle" text not null, "description" text null, "logo_url" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brand" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "brand" cascade;`);
    }
}
exports.Migration20260516091421 = Migration20260516091421;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTYwOTE0MjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZC9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjYwNTE2MDkxNDIxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlFQUFxRTtBQUVyRSxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQywrV0FBK1csQ0FBQyxDQUFDO1FBQzdYLElBQUksQ0FBQyxNQUFNLENBQUMsdUdBQXVHLENBQUMsQ0FBQztJQUN2SCxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FFRjtBQVhELDBEQVdDIn0=
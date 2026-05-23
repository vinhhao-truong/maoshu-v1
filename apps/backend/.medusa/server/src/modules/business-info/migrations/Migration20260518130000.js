"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260518130000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260518130000 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "business_info" ("id" text not null, "store_name" text not null, "tagline" text null, "logo_url" text null, "email" text null, "phone" text null, "address_line1" text null, "address_line2" text null, "city" text null, "state" text null, "country" text null, "postal_code" text null, "facebook_url" text null, "instagram_url" text null, "twitter_url" text null, "tiktok_url" text null, "youtube_url" text null, "business_hours" text null, "tax_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "business_info_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_business_info_deleted_at" ON "business_info" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "business_info" cascade;`);
    }
}
exports.Migration20260518130000 = Migration20260518130000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTgxMzAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9idXNpbmVzcy1pbmZvL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNjA1MTgxMzAwMDAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQXFFO0FBRXJFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLG1yQkFBbXJCLENBQUMsQ0FBQztRQUNqc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1SEFBdUgsQ0FBQyxDQUFDO0lBQ3ZJLENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLCtDQUErQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztDQUVGO0FBWEQsMERBV0MifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260518120000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260518120000 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "content" ("id" text not null, "title" text not null, "handle" text not null, "type" text not null, "body" text null, "excerpt" text null, "thumbnail_url" text null, "author" text null, "status" text not null default 'draft', "published_at" timestamptz null, "seo_title" text null, "seo_description" text null, "metadata" jsonb null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_deleted_at" ON "content" ("deleted_at") WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_type" ON "content" ("type") WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_status" ON "content" ("status") WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_handle" ON "content" ("handle") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "content" cascade;`);
    }
}
exports.Migration20260518120000 = Migration20260518120000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTgxMjAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9jb250ZW50L21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNjA1MTgxMjAwMDAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQXFFO0FBRXJFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLHFrQkFBcWtCLENBQUMsQ0FBQztRQUNubEIsSUFBSSxDQUFDLE1BQU0sQ0FBQywyR0FBMkcsQ0FBQyxDQUFDO1FBQ3pILElBQUksQ0FBQyxNQUFNLENBQUMsK0ZBQStGLENBQUMsQ0FBQztRQUM3RyxJQUFJLENBQUMsTUFBTSxDQUFDLG1HQUFtRyxDQUFDLENBQUM7UUFDakgsSUFBSSxDQUFDLE1BQU0sQ0FBQywwR0FBMEcsQ0FBQyxDQUFDO0lBQzFILENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDekQsQ0FBQztDQUVGO0FBZEQsMERBY0MifQ==
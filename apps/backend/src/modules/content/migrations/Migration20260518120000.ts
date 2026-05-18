import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260518120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "content" ("id" text not null, "title" text not null, "handle" text not null, "type" text not null, "body" text null, "excerpt" text null, "thumbnail_url" text null, "author" text null, "status" text not null default 'draft', "published_at" timestamptz null, "seo_title" text null, "seo_description" text null, "metadata" jsonb null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_deleted_at" ON "content" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_type" ON "content" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_status" ON "content" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_handle" ON "content" ("handle") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "content" cascade;`);
  }

}

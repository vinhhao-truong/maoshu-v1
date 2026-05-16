import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516173154 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "color_group" ("id" text not null, "name" text not null, "primary" text null, "secondary" text null, "inverse" text null, "neutral" text null, "success" text null, "warning" text null, "danger" text null, "info" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "color_group_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_color_group_deleted_at" ON "color_group" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "color_group" cascade;`);
  }

}

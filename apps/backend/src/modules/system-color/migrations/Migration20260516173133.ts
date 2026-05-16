import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516173133 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "system_color" ("id" text not null, "name" text not null, "hex" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "system_color_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_system_color_deleted_at" ON "system_color" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "system_color" cascade;`);
  }

}

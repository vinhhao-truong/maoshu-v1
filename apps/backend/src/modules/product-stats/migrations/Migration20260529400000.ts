import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260529400000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_stat_history" ("id" text not null, "product_id" text not null, "reset_type" text not null, "selling_amount" integer not null default 0, "view_amount" integer not null default 0, "period_end" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "product_stat_history_pkey" primary key ("id"));`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_stat_history_product_id" ON "product_stat_history" ("product_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_stat_history_reset_type" ON "product_stat_history" ("reset_type");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_stat_history" cascade;`)
  }
}

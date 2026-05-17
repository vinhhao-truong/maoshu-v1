import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260517081602 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "variant_cost" ("id" text not null, "variant_id" text not null, "cost" integer null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "variant_cost_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_cost_deleted_at" ON "variant_cost" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "variant_cost" cascade;`);
  }

}

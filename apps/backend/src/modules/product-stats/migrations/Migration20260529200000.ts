import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260529200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "product_stat" ADD COLUMN IF NOT EXISTS "monthly_selling_amount" integer not null default 0;`)
    this.addSql(`ALTER TABLE "product_stat" ADD COLUMN IF NOT EXISTS "monthly_view_amount" integer not null default 0;`)
    this.addSql(`ALTER TABLE "product_stat" ADD COLUMN IF NOT EXISTS "annual_selling_amount" integer not null default 0;`)
    this.addSql(`ALTER TABLE "product_stat" ADD COLUMN IF NOT EXISTS "annual_view_amount" integer not null default 0;`)
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "product_stat" DROP COLUMN IF EXISTS "monthly_selling_amount";`)
    this.addSql(`ALTER TABLE "product_stat" DROP COLUMN IF EXISTS "monthly_view_amount";`)
    this.addSql(`ALTER TABLE "product_stat" DROP COLUMN IF EXISTS "annual_selling_amount";`)
    this.addSql(`ALTER TABLE "product_stat" DROP COLUMN IF EXISTS "annual_view_amount";`)
  }
}

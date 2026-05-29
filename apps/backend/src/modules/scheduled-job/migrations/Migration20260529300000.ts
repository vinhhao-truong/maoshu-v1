import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260529300000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "scheduled_job" ADD COLUMN IF NOT EXISTS "is_system" boolean NOT NULL DEFAULT false;`)
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "scheduled_job" DROP COLUMN IF EXISTS "is_system";`)
  }
}

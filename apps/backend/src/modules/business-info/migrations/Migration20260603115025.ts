import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260603115025 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "business_info" add column if not exists "root_category_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "business_info" drop column if exists "root_category_id";`);
  }

}

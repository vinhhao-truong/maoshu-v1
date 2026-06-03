import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260603120348 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "business_info" add column if not exists "logo_white_url" text null, add column if not exists "logo_black_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "business_info" drop column if exists "logo_white_url", drop column if exists "logo_black_url";`);
  }

}

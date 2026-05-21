import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260521000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "business_info" add column if not exists "zalo_url" text null;`);
    this.addSql(`alter table "business_info" add column if not exists "about_us" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "business_info" drop column if exists "zalo_url";`);
    this.addSql(`alter table "business_info" drop column if exists "about_us";`);
  }

}

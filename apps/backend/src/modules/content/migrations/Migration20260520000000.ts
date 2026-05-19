import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260520000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "content" add column if not exists "in_footer" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "content" drop column if exists "in_footer";`);
  }

}

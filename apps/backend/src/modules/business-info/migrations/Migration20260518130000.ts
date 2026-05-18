import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260518130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "business_info" ("id" text not null, "store_name" text not null, "tagline" text null, "logo_url" text null, "email" text null, "phone" text null, "address_line1" text null, "address_line2" text null, "city" text null, "state" text null, "country" text null, "postal_code" text null, "facebook_url" text null, "instagram_url" text null, "twitter_url" text null, "tiktok_url" text null, "youtube_url" text null, "business_hours" text null, "tax_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "business_info_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_business_info_deleted_at" ON "business_info" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "business_info" cascade;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260529000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "scheduled_job_log" ("id" text not null, "job_id" text not null, "ran_at" timestamptz not null, "status" text not null, "error_message" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "scheduled_job_log_pkey" primary key ("id"));`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scheduled_job_log_job_id" ON "scheduled_job_log" ("job_id");`)

    this.addSql(`create table if not exists "scheduled_job" ("id" text not null, "function_key" text not null, "label" text null, "schedule_type" text not null default 'recurring', "cron_expression" text null, "run_at" timestamptz null, "enabled" boolean not null default true, "last_run_at" timestamptz null, "last_run_status" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "scheduled_job_pkey" primary key ("id"));`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scheduled_job_deleted_at" ON "scheduled_job" ("deleted_at") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scheduled_job_enabled" ON "scheduled_job" ("enabled") WHERE deleted_at IS NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "scheduled_job_log" cascade;`)
    this.addSql(`drop table if exists "scheduled_job" cascade;`)
  }
}

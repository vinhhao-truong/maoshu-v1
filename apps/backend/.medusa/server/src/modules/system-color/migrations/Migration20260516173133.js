"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260516173133 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260516173133 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "system_color" ("id" text not null, "name" text not null, "hex" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "system_color_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_system_color_deleted_at" ON "system_color" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "system_color" cascade;`);
    }
}
exports.Migration20260516173133 = Migration20260516173133;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTYxNzMxMzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9zeXN0ZW0tY29sb3IvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUxNjE3MzEzMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsZ1NBQWdTLENBQUMsQ0FBQztRQUM5UyxJQUFJLENBQUMsTUFBTSxDQUFDLHFIQUFxSCxDQUFDLENBQUM7SUFDckksQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBRUY7QUFYRCwwREFXQyJ9
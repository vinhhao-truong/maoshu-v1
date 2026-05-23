"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260517081602 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260517081602 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "variant_cost" ("id" text not null, "variant_id" text not null, "cost" integer null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "variant_cost_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_cost_deleted_at" ON "variant_cost" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "variant_cost" cascade;`);
    }
}
exports.Migration20260517081602 = Migration20260517081602;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MTcwODE2MDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy92YXJpYW50LWNvc3QvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUxNzA4MTYwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsc1NBQXNTLENBQUMsQ0FBQztRQUNwVCxJQUFJLENBQUMsTUFBTSxDQUFDLHFIQUFxSCxDQUFDLENBQUM7SUFDckksQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBRUY7QUFYRCwwREFXQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260520000000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260520000000 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "content" add column if not exists "in_footer" boolean not null default false;`);
    }
    async down() {
        this.addSql(`alter table if exists "content" drop column if exists "in_footer";`);
    }
}
exports.Migration20260520000000 = Migration20260520000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MjAwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9jb250ZW50L21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNjA1MjAwMDAwMDAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUVBQXFFO0FBRXJFLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLHNHQUFzRyxDQUFDLENBQUM7SUFDdEgsQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsb0VBQW9FLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBRUY7QUFWRCwwREFVQyJ9
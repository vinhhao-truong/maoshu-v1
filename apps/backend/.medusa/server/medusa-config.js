"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const fs_1 = require("fs");
const path_1 = require("path");
// When medusa start runs from .medusa/server/, .env lives two dirs up
const cwd = process.cwd();
const envDir = (0, fs_1.existsSync)((0, path_1.join)(cwd, '.env')) ? cwd : (0, path_1.join)(cwd, '../..');
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', envDir);
module.exports = (0, utils_1.defineConfig)({
    admin: {
        disable: process.env.DISABLE_ADMIN === 'true',
    },
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        databaseDriverOptions: process.env.NODE_ENV === "production"
            ? { connection: { ssl: { rejectUnauthorized: false } } }
            : {},
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    modules: [
        ...(process.env.REDIS_URL ? [
            {
                resolve: "@medusajs/medusa/event-bus-redis",
                options: { redisUrl: process.env.REDIS_URL },
            },
            {
                resolve: "@medusajs/medusa/cache-redis",
                options: { redisUrl: process.env.REDIS_URL },
            },
            {
                resolve: "@medusajs/medusa/workflow-engine-redis",
                options: { redis: { url: process.env.REDIS_URL } },
            },
        ] : []),
        {
            resolve: "@medusajs/medusa/file",
            options: {
                providers: [
                    {
                        id: "supabase",
                        resolve: "./src/modules/supabase-file",
                        options: {
                            file_url: process.env.S3_FILE_URL,
                            access_key_id: process.env.S3_ACCESS_KEY_ID,
                            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                            region: process.env.S3_REGION,
                            bucket: process.env.S3_BUCKET,
                            endpoint: process.env.S3_ENDPOINT,
                        },
                    },
                ],
            },
        },
        {
            resolve: "./src/modules/brand",
        },
        {
            resolve: "./src/modules/system-color",
        },
        {
            resolve: "./src/modules/color-group",
        },
        {
            resolve: "./src/modules/variant-cost",
        },
        {
            resolve: "./src/modules/content",
        },
        {
            resolve: "./src/modules/business-info",
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFDakUsMkJBQStCO0FBQy9CLCtCQUEyQjtBQUUzQixzRUFBc0U7QUFDdEUsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUEsZUFBVSxFQUFDLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN2RSxJQUFBLGVBQU8sRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFdEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFBLG9CQUFZLEVBQUM7SUFDNUIsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLE1BQU07S0FDOUM7SUFDRCxhQUFhLEVBQUU7UUFDYixXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO1FBQ3JDLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVk7WUFDMUQsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtZQUN4RCxDQUFDLENBQUMsRUFBRTtRQUNOLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFCO2dCQUNFLE9BQU8sRUFBRSxrQ0FBa0M7Z0JBQzNDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRTthQUM3QztZQUNEO2dCQUNFLE9BQU8sRUFBRSw4QkFBOEI7Z0JBQ3ZDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRTthQUM3QztZQUNEO2dCQUNFLE9BQU8sRUFBRSx3Q0FBd0M7Z0JBQ2pELE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFO2FBQ25EO1NBQ0YsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1A7WUFDRSxPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsRUFBRSxFQUFFLFVBQVU7d0JBQ2QsT0FBTyxFQUFFLDZCQUE2Qjt3QkFDdEMsT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NEJBQ2pDLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDM0MsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7NEJBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7eUJBQ2xDO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtRQUNEO1lBQ0UsT0FBTyxFQUFFLHFCQUFxQjtTQUMvQjtRQUNEO1lBQ0UsT0FBTyxFQUFFLDRCQUE0QjtTQUN0QztRQUNEO1lBQ0UsT0FBTyxFQUFFLDJCQUEyQjtTQUNyQztRQUNEO1lBQ0UsT0FBTyxFQUFFLDRCQUE0QjtTQUN0QztRQUNEO1lBQ0UsT0FBTyxFQUFFLHVCQUF1QjtTQUNqQztRQUNEO1lBQ0UsT0FBTyxFQUFFLDZCQUE2QjtTQUN2QztLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=
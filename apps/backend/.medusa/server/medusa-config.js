"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const dotenv_1 = require("dotenv");
const dotenv_expand_1 = require("dotenv-expand");
const path_1 = require("path");
const env = process.env.NODE_ENV || 'development';
// loadEnv only handles staging/production/test — load development (or any custom env) manually first
const MEDUSA_KNOWN_ENVS = ["staging", "production", "test"];
if (!MEDUSA_KNOWN_ENVS.includes(env)) {
    (0, dotenv_expand_1.expand)((0, dotenv_1.config)({ path: (0, path_1.join)(process.cwd(), `.env.${env}`) }));
}
(0, utils_1.loadEnv)(env, process.cwd());
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
        ...(process.env.S3_ENDPOINT ? [{
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
            }] : []),
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
        {
            resolve: "./src/modules/product-stats",
        },
        {
            resolve: "./src/modules/scheduled-job",
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFDakUsbUNBQStCO0FBQy9CLGlEQUFzQztBQUN0QywrQkFBMkI7QUFFM0IsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFBO0FBRWpELHFHQUFxRztBQUNyRyxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUMzRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDckMsSUFBQSxzQkFBTSxFQUFDLElBQUEsZUFBTSxFQUFDLEVBQUUsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUQsQ0FBQztBQUVELElBQUEsZUFBTyxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUUzQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssTUFBTTtLQUM5QztJQUNELGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDckMscUJBQXFCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWTtZQUMxRCxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO1lBQ3hELENBQUMsQ0FBQyxFQUFFO1FBQ04sSUFBSSxFQUFFO1lBQ0osU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7WUFDaEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGFBQWE7WUFDbEQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWE7U0FDekQ7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUI7Z0JBQ0UsT0FBTyxFQUFFLGtDQUFrQztnQkFDM0MsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFO2FBQzdDO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLDhCQUE4QjtnQkFDdkMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFO2FBQzdDO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLHdDQUF3QztnQkFDakQsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUU7YUFDbkQ7U0FDRixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSx1QkFBdUI7Z0JBQ2hDLE9BQU8sRUFBRTtvQkFDUCxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsRUFBRSxFQUFFLFVBQVU7NEJBQ2QsT0FBTyxFQUFFLDZCQUE2Qjs0QkFDdEMsT0FBTyxFQUFFO2dDQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7Z0NBQ2pDLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtnQ0FDM0MsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7Z0NBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7Z0NBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7Z0NBQzdCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NkJBQ2xDO3lCQUNGO3FCQUNGO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUjtZQUNFLE9BQU8sRUFBRSxxQkFBcUI7U0FDL0I7UUFDRDtZQUNFLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEM7UUFDRDtZQUNFLE9BQU8sRUFBRSwyQkFBMkI7U0FDckM7UUFDRDtZQUNFLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEM7UUFDRDtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7U0FDakM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9
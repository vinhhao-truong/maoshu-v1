"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
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
        {
            resolve: "./src/modules/product-stats",
        },
        {
            resolve: "./src/modules/scheduled-job",
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBQSxvQkFBWSxFQUFDO0lBQzVCLEtBQUssRUFBRTtRQUNMLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO0tBQzlDO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZO1lBQzFELENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7WUFDeEQsQ0FBQyxDQUFDLEVBQUU7UUFDTixJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVTtZQUNoQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxQjtnQkFDRSxPQUFPLEVBQUUsa0NBQWtDO2dCQUMzQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUU7YUFDN0M7WUFDRDtnQkFDRSxPQUFPLEVBQUUsOEJBQThCO2dCQUN2QyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUU7YUFDN0M7WUFDRDtnQkFDRSxPQUFPLEVBQUUsd0NBQXdDO2dCQUNqRCxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRTthQUNuRDtTQUNGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNQO1lBQ0UsT0FBTyxFQUFFLHVCQUF1QjtZQUNoQyxPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFO29CQUNUO3dCQUNFLEVBQUUsRUFBRSxVQUFVO3dCQUNkLE9BQU8sRUFBRSw2QkFBNkI7d0JBQ3RDLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXOzRCQUNqQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7NEJBQzNDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9COzRCQUNuRCxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTOzRCQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTOzRCQUM3QixRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXO3lCQUNsQztxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSxxQkFBcUI7U0FDL0I7UUFDRDtZQUNFLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEM7UUFDRDtZQUNFLE9BQU8sRUFBRSwyQkFBMkI7U0FDckM7UUFDRDtZQUNFLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEM7UUFDRDtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7U0FDakM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7UUFDRDtZQUNFLE9BQU8sRUFBRSw2QkFBNkI7U0FDdkM7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    disable: process.env.DISABLE_ADMIN === 'true',
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.NODE_ENV === "production"
      ? { connection: { ssl: { rejectUnauthorized: false } } }
      : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
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
})

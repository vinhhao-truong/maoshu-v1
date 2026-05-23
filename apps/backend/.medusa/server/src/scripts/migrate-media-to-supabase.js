"use strict";
/**
 * One-off script: uploads all files from apps/backend/static/ to Supabase Storage
 * and patches every database row that references the old local URL.
 *
 * Run from apps/backend/:
 *   npx ts-node --esm src/scripts/migrate-media-to-supabase.ts
 *
 * Required env vars (loaded from .env automatically):
 *   DATABASE_URL, S3_ENDPOINT, S3_REGION, S3_BUCKET,
 *   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_FILE_URL,
 *   OLD_FILE_BASE_URL  (default: http://localhost:9000/static)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = require("fs");
const path_1 = require("path");
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const STATIC_DIR = (0, path_1.join)(process.cwd(), "static");
const OLD_BASE = (process.env.OLD_FILE_BASE_URL || "http://localhost:9000/static").replace(/\/$/, "");
const NEW_BASE = process.env.S3_FILE_URL.replace(/\/$/, "");
const CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".csv": "text/csv",
    ".json": "application/json",
};
const s3 = new client_s3_1.S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});
async function fileExistsInS3(key) {
    try {
        await s3.send(new client_s3_1.HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
        return true;
    }
    catch {
        return false;
    }
}
async function uploadFile(filename) {
    const ext = (0, path_1.extname)(filename).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const body = (0, fs_1.readFileSync)((0, path_1.join)(STATIC_DIR, filename));
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: filename,
        Body: body,
        ContentType: contentType,
    }));
    return `${NEW_BASE}/${filename}`;
}
async function patchDatabase(fileMap) {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    try {
        // --- product images ---
        for (const [filename, newUrl] of fileMap) {
            const oldUrl = `${OLD_BASE}/${filename}`;
            const { rowCount } = await pool.query(`UPDATE image SET url = $1 WHERE url = $2`, [newUrl, oldUrl]);
            if ((rowCount ?? 0) > 0) {
                console.log(`  image table: ${filename} → updated ${rowCount} row(s)`);
            }
        }
        // --- product thumbnails ---
        for (const [filename, newUrl] of fileMap) {
            const oldUrl = `${OLD_BASE}/${filename}`;
            const { rowCount } = await pool.query(`UPDATE product SET thumbnail = $1 WHERE thumbnail = $2`, [newUrl, oldUrl]);
            if ((rowCount ?? 0) > 0) {
                console.log(`  product.thumbnail: ${filename} → updated ${rowCount} row(s)`);
            }
        }
        // --- JSONB metadata (product_category, etc.) ---
        // Replace old base URL in all jsonb metadata columns across key tables.
        const jsonbTargets = [
            { table: "product_category", column: "metadata" },
            { table: "product_collection", column: "metadata" },
        ];
        for (const { table, column } of jsonbTargets) {
            const { rowCount } = await pool.query(`UPDATE ${table}
         SET ${column} = REPLACE(${column}::text, $1, $2)::jsonb
         WHERE ${column}::text LIKE $3`, [OLD_BASE, NEW_BASE, `%${OLD_BASE}%`]);
            if ((rowCount ?? 0) > 0) {
                console.log(`  ${table}.${column}: updated ${rowCount} row(s)`);
            }
        }
    }
    finally {
        await pool.end();
    }
}
async function main() {
    const required = ["DATABASE_URL", "S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_FILE_URL"];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        console.error("Missing env vars:", missing.join(", "));
        process.exit(1);
    }
    const allFiles = (0, fs_1.readdirSync)(STATIC_DIR);
    const publicFiles = allFiles.filter((f) => !f.startsWith("private-"));
    console.log(`Found ${publicFiles.length} public file(s) in static/ (${allFiles.length - publicFiles.length} private skipped)\n`);
    const fileMap = new Map();
    for (const filename of publicFiles) {
        const alreadyUploaded = await fileExistsInS3(filename);
        if (alreadyUploaded) {
            console.log(`[skip] ${filename} (already in bucket)`);
            fileMap.set(filename, `${NEW_BASE}/${filename}`);
            continue;
        }
        process.stdout.write(`[upload] ${filename} ... `);
        const newUrl = await uploadFile(filename);
        fileMap.set(filename, newUrl);
        console.log("done");
    }
    console.log("\nPatching database URLs...");
    await patchDatabase(fileMap);
    console.log("\nDone. You can now remove apps/backend/static/ public files if desired.");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZS1tZWRpYS10by1zdXBhYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21pZ3JhdGUtbWVkaWEtdG8tc3VwYWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7OztHQVdHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILGtEQUFrRjtBQUNsRiwyQkFBOEM7QUFDOUMsK0JBQW9DO0FBQ3BDLDJCQUF5QjtBQUN6QiwrQ0FBZ0M7QUFFaEMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRWYsTUFBTSxVQUFVLEdBQUcsSUFBQSxXQUFJLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ2hELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDckcsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUU1RCxNQUFNLGFBQWEsR0FBMkI7SUFDNUMsTUFBTSxFQUFFLFlBQVk7SUFDcEIsT0FBTyxFQUFFLFlBQVk7SUFDckIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsT0FBTyxFQUFFLFlBQVk7SUFDckIsTUFBTSxFQUFFLGVBQWU7SUFDdkIsTUFBTSxFQUFFLGlCQUFpQjtJQUN6QixNQUFNLEVBQUUsVUFBVTtJQUNsQixPQUFPLEVBQUUsa0JBQWtCO0NBQzVCLENBQUE7QUFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDdEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBWTtJQUNsQyxNQUFNLEVBQUUsT0FB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
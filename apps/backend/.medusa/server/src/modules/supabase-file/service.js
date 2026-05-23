"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseFileService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const utils_1 = require("@medusajs/framework/utils");
const stream_1 = require("stream");
const path_1 = require("path");
const ulid_1 = require("ulid");
class SupabaseFileService extends utils_1.AbstractFileProviderService {
    constructor({ logger }, options) {
        super();
        if (!options.access_key_id || !options.secret_access_key) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Supabase file provider requires access_key_id and secret_access_key");
        }
        this.config_ = {
            fileUrl: options.file_url.replace(/\/$/, ""),
            region: options.region,
            bucket: options.bucket,
            cacheControl: options.cache_control ?? "public, max-age=31536000",
            downloadFileDuration: options.download_file_duration ?? 3600,
        };
        this.logger_ = logger;
        // Supabase Storage S3 endpoint requires forcePathStyle — no ACL support
        this.client_ = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: options.access_key_id,
                secretAccessKey: options.secret_access_key,
            },
            region: options.region,
            endpoint: options.endpoint,
            forcePathStyle: true,
        });
    }
    fileKey(filename) {
        const lastSlash = filename.lastIndexOf("/");
        if (lastSlash >= 0) {
            const dir = filename.slice(0, lastSlash);
            const base = filename.slice(lastSlash + 1);
            const lastDot = base.lastIndexOf(".");
            const name = lastDot >= 0 ? base.slice(0, lastDot) : base;
            const ext = lastDot >= 0 ? base.slice(lastDot) : "";
            return `${dir}/${name}-${(0, ulid_1.ulid)()}${ext}`;
        }
        const { name, ext } = (0, path_1.parse)(filename);
        return `${name}-${(0, ulid_1.ulid)()}${ext}`;
    }
    async upload(file) {
        if (!file?.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No filename provided");
        }
        const key = this.fileKey(file.filename);
        let content;
        try {
            const decoded = Buffer.from(file.content, "base64");
            content = decoded.toString("base64") === file.content
                ? decoded
                : Buffer.from(file.content, "utf8");
        }
        catch {
            content = Buffer.from(file.content, "binary");
        }
        try {
            await this.client_.send(new client_s3_1.PutObjectCommand({
                Bucket: this.config_.bucket,
                Key: key,
                Body: content,
                ContentType: file.mimeType,
                CacheControl: this.config_.cacheControl,
                Metadata: { "original-filename": encodeURIComponent(file.filename) },
                // No ACL — Supabase uses bucket-level access policies instead
            }));
        }
        catch (e) {
            this.logger_.error(e);
            throw e;
        }
        return { url: `${this.config_.fileUrl}/${key}`, key };
    }
    async getUploadStream(fileData) {
        if (!fileData?.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No filename provided");
        }
        const key = this.fileKey(fileData.filename);
        const pass = new stream_1.PassThrough();
        const upload = new lib_storage_1.Upload({
            client: this.client_,
            params: {
                Bucket: this.config_.bucket,
                Key: key,
                Body: pass,
                ContentType: fileData.mimeType,
                CacheControl: this.config_.cacheControl,
                Metadata: { "original-filename": encodeURIComponent(fileData.filename) },
            },
        });
        const promise = upload.done().then(() => ({
            url: `${this.config_.fileUrl}/${key}`,
            key,
        }));
        return { writeStream: pass, promise, url: `${this.config_.fileUrl}/${key}`, fileKey: key };
    }
    async delete(files) {
        try {
            if (Array.isArray(files)) {
                await this.client_.send(new client_s3_1.DeleteObjectsCommand({
                    Bucket: this.config_.bucket,
                    Delete: {
                        Objects: files.map((f) => ({ Key: f.fileKey })),
                        Quiet: true,
                    },
                }));
            }
            else {
                await this.client_.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.config_.bucket, Key: files.fileKey }));
            }
        }
        catch (e) {
            this.logger_.error(e);
        }
    }
    async getPresignedDownloadUrl(fileData) {
        return (0, s3_request_presigner_1.getSignedUrl)(this.client_, new client_s3_1.GetObjectCommand({ Bucket: this.config_.bucket, Key: fileData.fileKey }), { expiresIn: this.config_.downloadFileDuration });
    }
    async getPresignedUploadUrl(fileData) {
        if (!fileData?.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No filename provided");
        }
        const key = fileData.filename;
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client_, new client_s3_1.PutObjectCommand({ Bucket: this.config_.bucket, ContentType: fileData.mimeType, Key: key }), { expiresIn: fileData.expiresIn ?? 3600 });
        return { url: signedUrl, key };
    }
    async getDownloadStream(file) {
        if (!file?.fileKey) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No fileKey provided");
        }
        const response = await this.client_.send(new client_s3_1.GetObjectCommand({ Key: file.fileKey, Bucket: this.config_.bucket }));
        if (!response.Body) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "File not found");
        }
        return response.Body;
    }
    async getAsBuffer(file) {
        if (!file?.fileKey) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No fileKey provided");
        }
        const response = await this.client_.send(new client_s3_1.GetObjectCommand({ Key: file.fileKey, Bucket: this.config_.bucket }));
        return Buffer.from(await response.Body.transformToByteArray());
    }
}
exports.SupabaseFileService = SupabaseFileService;
SupabaseFileService.identifier = "supabase";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3N1cGFiYXNlLWZpbGUvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFNMkI7QUFDM0Isc0RBQTZDO0FBQzdDLHdFQUE0RDtBQUM1RCxxREFBb0Y7QUFDcEYsbUNBQThDO0FBQzlDLCtCQUE0QjtBQUM1QiwrQkFBMkI7QUFjM0IsTUFBYSxtQkFBb0IsU0FBUSxtQ0FBMkI7SUFhbEUsWUFBWSxFQUFFLE1BQU0sRUFBc0IsRUFBRSxPQUFnQjtRQUMxRCxLQUFLLEVBQUUsQ0FBQTtRQUVQLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekQsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFDOUIscUVBQXFFLENBQ3RFLENBQUE7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNiLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzVDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxhQUFhLElBQUksMEJBQTBCO1lBQ2pFLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxJQUFJO1NBQzdELENBQUE7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtRQUVyQix3RUFBd0U7UUFDeEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG9CQUFRLENBQUM7WUFDMUIsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxPQUFPLENBQUMsYUFBYTtnQkFDbEMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUI7YUFD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
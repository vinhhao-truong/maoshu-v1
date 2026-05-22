import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import { PassThrough, Readable } from "stream"
import { parse } from "path"
import { ulid } from "ulid"
import type { Logger } from "@medusajs/framework/types"

type Options = {
  file_url: string
  access_key_id: string
  secret_access_key: string
  region: string
  bucket: string
  endpoint: string
  cache_control?: string
  download_file_duration?: number
}

export class SupabaseFileService extends AbstractFileProviderService {
  static identifier = "supabase"

  private client_: S3Client
  private config_: {
    fileUrl: string
    region: string
    bucket: string
    cacheControl: string
    downloadFileDuration: number
  }
  private logger_: Logger

  constructor({ logger }: { logger: Logger }, options: Options) {
    super()

    if (!options.access_key_id || !options.secret_access_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Supabase file provider requires access_key_id and secret_access_key"
      )
    }

    this.config_ = {
      fileUrl: options.file_url.replace(/\/$/, ""),
      region: options.region,
      bucket: options.bucket,
      cacheControl: options.cache_control ?? "public, max-age=31536000",
      downloadFileDuration: options.download_file_duration ?? 3600,
    }

    this.logger_ = logger

    // Supabase Storage S3 endpoint requires forcePathStyle — no ACL support
    this.client_ = new S3Client({
      credentials: {
        accessKeyId: options.access_key_id,
        secretAccessKey: options.secret_access_key,
      },
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: true,
    })
  }

  private fileKey(filename: string): string {
    const lastSlash = filename.lastIndexOf("/")
    if (lastSlash >= 0) {
      const dir = filename.slice(0, lastSlash)
      const base = filename.slice(lastSlash + 1)
      const lastDot = base.lastIndexOf(".")
      const name = lastDot >= 0 ? base.slice(0, lastDot) : base
      const ext = lastDot >= 0 ? base.slice(lastDot) : ""
      return `${dir}/${name}-${ulid()}${ext}`
    }
    const { name, ext } = parse(filename)
    return `${name}-${ulid()}${ext}`
  }

  async upload(file: any) {
    if (!file?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const key = this.fileKey(file.filename)

    let content: Buffer
    try {
      const decoded = Buffer.from(file.content, "base64")
      content = decoded.toString("base64") === file.content
        ? decoded
        : Buffer.from(file.content, "utf8")
    } catch {
      content = Buffer.from(file.content, "binary")
    }

    try {
      await this.client_.send(
        new PutObjectCommand({
          Bucket: this.config_.bucket,
          Key: key,
          Body: content,
          ContentType: file.mimeType,
          CacheControl: this.config_.cacheControl,
          Metadata: { "original-filename": encodeURIComponent(file.filename) },
          // No ACL — Supabase uses bucket-level access policies instead
        })
      )
    } catch (e) {
      this.logger_.error(e)
      throw e
    }

    return { url: `${this.config_.fileUrl}/${key}`, key }
  }

  async getUploadStream(fileData: any) {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const key = this.fileKey(fileData.filename)
    const pass = new PassThrough()

    const upload = new Upload({
      client: this.client_,
      params: {
        Bucket: this.config_.bucket,
        Key: key,
        Body: pass,
        ContentType: fileData.mimeType,
        CacheControl: this.config_.cacheControl,
        Metadata: { "original-filename": encodeURIComponent(fileData.filename) },
      },
    })

    const promise = upload.done().then(() => ({
      url: `${this.config_.fileUrl}/${key}`,
      key,
    }))

    return { writeStream: pass, promise, url: `${this.config_.fileUrl}/${key}`, fileKey: key }
  }

  async delete(files: any | any[]) {
    try {
      if (Array.isArray(files)) {
        await this.client_.send(
          new DeleteObjectsCommand({
            Bucket: this.config_.bucket,
            Delete: {
              Objects: files.map((f) => ({ Key: f.fileKey })),
              Quiet: true,
            },
          })
        )
      } else {
        await this.client_.send(
          new DeleteObjectCommand({ Bucket: this.config_.bucket, Key: files.fileKey })
        )
      }
    } catch (e) {
      this.logger_.error(e)
    }
  }

  async getPresignedDownloadUrl(fileData: any) {
    return getSignedUrl(
      this.client_,
      new GetObjectCommand({ Bucket: this.config_.bucket, Key: fileData.fileKey }),
      { expiresIn: this.config_.downloadFileDuration }
    )
  }

  async getPresignedUploadUrl(fileData: any) {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const key = fileData.filename
    const signedUrl = await getSignedUrl(
      this.client_,
      new PutObjectCommand({ Bucket: this.config_.bucket, ContentType: fileData.mimeType, Key: key }),
      { expiresIn: fileData.expiresIn ?? 3600 }
    )

    return { url: signedUrl, key }
  }

  async getDownloadStream(file: any): Promise<Readable> {
    if (!file?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No fileKey provided")
    }
    const response = await this.client_.send(
      new GetObjectCommand({ Key: file.fileKey, Bucket: this.config_.bucket })
    )
    if (!response.Body) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "File not found")
    }
    return response.Body as unknown as Readable
  }

  async getAsBuffer(file: any) {
    if (!file?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No fileKey provided")
    }
    const response = await this.client_.send(
      new GetObjectCommand({ Key: file.fileKey, Bucket: this.config_.bucket })
    )
    return Buffer.from(await (response.Body as any).transformToByteArray())
  }
}

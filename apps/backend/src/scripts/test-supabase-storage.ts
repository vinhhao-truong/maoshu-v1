import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import * as dotenv from "dotenv"
import { join } from "path"

dotenv.config({ path: join(process.cwd(), ".env") })

const endpoint = process.env.S3_ENDPOINT!
const region = process.env.S3_REGION!
const bucket = process.env.S3_BUCKET!
const accessKeyId = process.env.S3_ACCESS_KEY_ID!
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY!

console.log("--- Config ---")
console.log("Endpoint :", endpoint)
console.log("Region   :", region)
console.log("Bucket   :", bucket)
console.log("Key ID   :", accessKeyId?.slice(0, 8) + "...")
console.log()

const client = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
})

async function run() {
  // 1. List bucket
  console.log("1. Listing bucket contents...")
  try {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }))
    console.log("   OK — objects found:", res.KeyCount)
  } catch (e: any) {
    console.error("   FAILED:", e.name, e.message)
    if (e.$metadata) console.error("   HTTP status:", e.$metadata.httpStatusCode)
  }

  // 2. Upload a test file
  console.log("\n2. Uploading test object...")
  const testKey = `__connection-test-${Date.now()}.txt`
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: Buffer.from("supabase connection test"),
      ContentType: "text/plain",
    }))
    console.log("   OK — uploaded as:", testKey)

    // 3. Clean up
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }))
    console.log("   Cleaned up test object.")
  } catch (e: any) {
    console.error("   FAILED:", e.name, e.message)
    if (e.$metadata) console.error("   HTTP status:", e.$metadata.httpStatusCode)
    if (e.Code) console.error("   S3 error code:", e.Code)
  }
}

run()

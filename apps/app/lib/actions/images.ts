"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { sanitizeFileName } from "@/lib/utils"
import { z } from "zod"

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { unauthorized } from "next/navigation"

const envSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_DOMAIN: z.string().optional(),
})

const getEnv = () => {
  const parsed = envSchema.safeParse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
  })

  if (!parsed.success) {
    throw new Error("R2 environment variables are not configured correctly")
  }

  return parsed.data
}

export const createR2Client = async () => {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = getEnv()

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
}

export const buildBannerKey = async (params: { projectId: string; postId: string; originalFileName: string }) => {
  const { projectId, postId, originalFileName } = params
  const cleanedName = sanitizeFileName(originalFileName)
  const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : undefined
  const safeExt = ext ? ext.toLowerCase() : "bin"
  const timestamp = Date.now()
  return `public/${projectId}/${postId}/b/banner-${timestamp}.${safeExt}`
}

export const getPublicUrlForKey = async (key: string) => {
  const { R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } = getEnv()
  if (R2_PUBLIC_DOMAIN && R2_PUBLIC_DOMAIN.trim() !== "") {
    const base = R2_PUBLIC_DOMAIN.endsWith("/") ? R2_PUBLIC_DOMAIN.slice(0, -1) : R2_PUBLIC_DOMAIN
    return `${base}/${key}`
  }
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`
}

// Try to determine if the object is an image via ContentType and/or magic numbers
const detectObjectMime = async (
  bucket: string,
  key: string
): Promise<{ mime: string | null; isImage: boolean }> => {
  const s3 = await createR2Client()

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    const ct = head.ContentType || null
    if (ct && ct.startsWith("image/")) {
      return { mime: ct, isImage: true }
    }
  } catch {
    // ignore and fallback to range fetch
  }

  try {
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-511" })
    )
    const body = await obj.Body?.transformToByteArray()
    if (body && body.length > 4) {
      // JPEG: FF D8 FF
      if (body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff) {
        return { mime: "image/jpeg", isImage: true }
      }
      // PNG: 89 50 4E 47
      if (
        body[0] === 0x89 && body[1] === 0x50 && body[2] === 0x4e && body[3] === 0x47
      ) {
        return { mime: "image/png", isImage: true }
      }
      // GIF: 47 49 46 38
      if (
        body[0] === 0x47 && body[1] === 0x49 && body[2] === 0x46 && body[3] === 0x38
      ) {
        return { mime: "image/gif", isImage: true }
      }
      // WEBP: RIFF....WEBP
      if (
        body[0] === 0x52 && body[1] === 0x49 && body[2] === 0x46 && body[3] === 0x46 &&
        body[8] === 0x57 && body[9] === 0x45 && body[10] === 0x42 && body[11] === 0x50
      ) {
        return { mime: "image/webp", isImage: true }
      }
      // AVIF: ftypavif/avis/avif brand in first 12 bytes
      const ascii = String.fromCharCode(...body.slice(4, 12))
      if (ascii.includes("avif") || ascii.includes("avis")) {
        return { mime: "image/avif", isImage: true }
      }
    }
  } catch {
    // ignore
  }

  return { mime: null, isImage: false }
}

export const assertR2ObjectIsImage = async (key: string) => {
  const user = await getCurrentUser()
  if (!user) {
    unauthorized()
  }

  const { R2_BUCKET_NAME } = getEnv()
  const result = await detectObjectMime(R2_BUCKET_NAME, key)
  if (!result.isImage) {
    throw new Error("Invalid image upload: object is not a recognized image type")
  }

  return { mime: result.mime }
}

export const getR2PublicUrl = async (key: string) => {
  return await getPublicUrlForKey(key)
}

/**
 * Extract R2 object key from public URL (internal helper)
 */
const extractKeyFromUrl = (url: string): string | null => {
  try {
    const { R2_PUBLIC_DOMAIN } = getEnv()

    // Try custom domain first
    if (R2_PUBLIC_DOMAIN && url.startsWith(R2_PUBLIC_DOMAIN)) {
      const base = R2_PUBLIC_DOMAIN.endsWith("/") ? R2_PUBLIC_DOMAIN.slice(0, -1) : R2_PUBLIC_DOMAIN
      return url.replace(`${base}/`, "")
    }

    // Try R2 default URL pattern: https://{accountId}.r2.cloudflarestorage.com/{bucket}/{key}
    const r2Pattern = /^https:\/\/[^.]+\.r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/
    const match = url.match(r2Pattern)
    if (match) {
      return match[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Delete banner from R2 storage
 * This function validates ownership through project access
 */
export const deleteBannerFromR2 = async (params: { coverImageUrl: string; projectId: string }) => {
  const { coverImageUrl, projectId } = params
  const { R2_BUCKET_NAME } = getEnv()

  // Extract key from URL
  const key = extractKeyFromUrl(coverImageUrl)
  if (!key) {
    throw new Error("Invalid R2 URL")
  }

  // Security: verify the key is a banner in the user's project
  const expectedPrefix = `public/${projectId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error("Unauthorized: Banner does not belong to this project")
  }

  // Delete from R2
  const s3 = await createR2Client()
  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  )

  return { ok: true, deletedKey: key }
}

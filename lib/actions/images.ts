"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { z } from "zod"
import { sanitizeFileName } from "@/lib/utils"
import { prisma } from "@simplist/db"

import { S3Client, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { forbidden, unauthorized } from "next/navigation"

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

const buildObjectKey = (params: { userId: string; originalFileName: string }) => {
  const { userId, originalFileName } = params
  const cleanedName = sanitizeFileName(originalFileName)
  const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : undefined
  const safeExt = ext ? ext.toLowerCase() : "bin"
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  return `users/${userId}/images/${timestamp}-${random}.${safeExt}`
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

const getUploadUrlInput = z.object({
  fileName: z.string().min(1),
  contentType: z
    .string()
    .min(1)
    .refine(v => v.startsWith("image/"), "Only image content types are allowed"),
  maxSizeBytes: z.number().int().positive().max(25 * 1024 * 1024).optional(),
  expiresInSeconds: z.number().int().positive().max(60 * 10).default(60),
})

export const getR2UploadUrl = async (input: z.infer<typeof getUploadUrlInput>) => {
  const user = await getCurrentUser()
  if (!user) {
    unauthorized()
  }

  const data = getUploadUrlInput.parse(input)
  const { R2_BUCKET_NAME } = getEnv()
  const s3 = await createR2Client()

  const key = buildObjectKey({ userId: user.id, originalFileName: data.fileName })

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: data.contentType,
    // R2 ignores ACLs; bucket should be made public via policy if needed
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: data.expiresInSeconds })

  return {
    key,
    uploadUrl,
    publicUrl: await getPublicUrlForKey(key),
  }
}

const getBannerUploadUrlInput = z.object({
  projectId: z.string().min(1),
  postId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z
    .string()
    .min(1)
    .refine(v => v.startsWith("image/"), "Only image content types are allowed"),
  expiresInSeconds: z.number().int().positive().max(60 * 10).default(60),
})

// Generate a presigned URL for the banner using the key layout:
// public/[projectId]/[postId]/b/banner-[timestamp].[extension]
export const getR2BannerUploadUrl = async (input: z.infer<typeof getBannerUploadUrlInput>) => {
  const user = await getCurrentUser()
  if (!user) {
    unauthorized()
  }

  const data = getBannerUploadUrlInput.parse(input)

  // Authorization: ensure the article belongs to the current user's project
  const article = await prisma.article.findFirst({
    where: { id: data.postId },
    include: { project: true },
  })

  if (!article || article.project.id !== data.projectId || article.project.userId !== user.id) {
    forbidden()
  }

  const { R2_BUCKET_NAME } = getEnv()
  const s3 = await createR2Client()

  const key = await buildBannerKey({
    projectId: data.projectId,
    postId: data.postId,
    originalFileName: data.fileName,
  })

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: data.contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: data.expiresInSeconds })

  return {
    key,
    uploadUrl,
    publicUrl: await getPublicUrlForKey(key),
  }
}

// Sanitize a filename: remove diacritics, lowercase, replace spaces with '-', keep [a-z0-9._-]
// sanitizeFileName is provided by lib/utils

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

const deleteInput = z.object({ key: z.string().min(1) })

export const deleteR2Object = async (input: z.infer<typeof deleteInput>) => {
  const user = await getCurrentUser()
  if (!user) {
    unauthorized()
  }

  const { key } = deleteInput.parse(input)
  const { R2_BUCKET_NAME } = getEnv()
  const s3 = await createR2Client()

  // Basic ownership guard: restrict deletion to keys under the user's prefix
  const allowedPrefix = `users/${user.id}/`
  if (!key.startsWith(allowedPrefix)) {
    forbidden()
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  )

  return { ok: true }
}

export const getR2PublicUrl = async (key: string) => {
  return await getPublicUrlForKey(key)
}
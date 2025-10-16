"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { forbidden, redirect } from "next/navigation"
import sharp from "sharp"
import { z } from "zod"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

const getEnv = () => {
  return {
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
  }
}

export const getProjectStorageInfo = async (projectId: string) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) forbidden()

  return {
    used: Number(project.storageUsed),
    limit: Number(project.storageLimit),
    available: Number(project.storageLimit) - Number(project.storageUsed),
    percentage: (Number(project.storageUsed) / Number(project.storageLimit)) * 100,
  }
}

export const uploadAsset = async (formData: FormData) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const file = formData.get("file") as File
  const projectId = formData.get("projectId") as string

  if (!file || !projectId) {
    throw new Error("File and projectId are required")
  }

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) forbidden()

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Check storage quota
  const storageInfo = await getProjectStorageInfo(projectId)
  if (storageInfo.available < file.size) {
    throw new Error(`Insufficient storage. Available: ${(storageInfo.available / 1024 / 1024).toFixed(2)}MB`)
  }

  // Process image with Sharp
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let processedBuffer: Buffer
  let metadata: sharp.Metadata
  let finalMimeType = file.type

  try {
    const image = sharp(buffer)
    metadata = await image.metadata()

    // Compress and optimize based on type
    if (file.type === "image/png") {
      processedBuffer = await image
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer()
    } else if (file.type === "image/webp") {
      processedBuffer = await image
        .webp({ quality: 85 })
        .toBuffer()
    } else if (file.type === "image/gif") {
      // Don't compress GIFs (to preserve animation)
      processedBuffer = buffer
    } else {
      // JPEG by default
      processedBuffer = await image
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
      finalMimeType = "image/jpeg"
    }
  } catch (error) {
    throw new Error("Failed to process image")
  }

  // Generate unique filename
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  const ext = file.name.split(".").pop() || "jpg"
  const filename = `${timestamp}-${random}.${ext}`
  const key = `public/${projectId}/assets/${filename}`

  // Upload to R2
  const s3 = await createR2Client()
  const { R2_BUCKET_NAME } = getEnv()

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: finalMimeType,
    })
  )

  const url = await getPublicUrlForKey(key)

  // Save asset to database
  const asset = await prisma.asset.create({
    data: {
      filename,
      originalName: file.name,
      key,
      url,
      mimeType: finalMimeType,
      size: BigInt(processedBuffer.length),
      width: metadata.width,
      height: metadata.height,
      projectId,
    },
  })

  // Update project storage
  await prisma.project.update({
    where: { id: projectId },
    data: {
      storageUsed: {
        increment: BigInt(processedBuffer.length),
      },
    },
  })

  return {
    id: asset.id,
    filename: asset.filename,
    url: asset.url,
    mimeType: asset.mimeType,
    size: Number(asset.size),
    width: asset.width,
    height: asset.height,
  }
}

export const getProjectAssets = async (projectId: string) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) forbidden()

  const assets = await prisma.asset.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  })

  return assets.map((asset) => ({
    id: asset.id,
    filename: asset.filename,
    originalName: asset.originalName,
    url: asset.url,
    mimeType: asset.mimeType,
    size: Number(asset.size),
    width: asset.width,
    height: asset.height,
    createdAt: asset.createdAt,
  }))
}

export const deleteAsset = async (assetId: string) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const asset = await prisma.asset.findFirst({
    where: { id: assetId },
    include: { project: true },
  })

  if (!asset || asset.project.userId !== user.id) {
    forbidden()
  }

  // Delete from R2 (optional, could keep for safety)
  // const s3 = await createR2Client()
  // await s3.send(new DeleteObjectCommand({ Bucket: getEnv().R2_BUCKET_NAME, Key: asset.key }))

  // Update project storage
  await prisma.project.update({
    where: { id: asset.projectId },
    data: {
      storageUsed: {
        decrement: asset.size,
      },
    },
  })

  // Delete asset record
  await prisma.asset.delete({
    where: { id: assetId },
  })

  return { success: true }
}


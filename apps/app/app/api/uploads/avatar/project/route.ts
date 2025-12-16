import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { requirePermission } from "@/lib/auth/permissions"
import { sanitizeFileName } from "@/lib/utils"
import { prisma } from "@simplist/db"
import { checkStorageQuota, updateStorageUsage } from "@/lib/subscription/quota-check"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for project avatars
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const projectId = formData.get("projectId") as string | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // Check permissions - project avatar uploads require canManageProject permission
    try {
      await requirePermission(projectId, "canManageProject")
    } catch {
      return NextResponse.json({ error: "Insufficient permissions to upload project avatar" }, { status: 403 })
    }

    // Get project for quota checks
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check storage quota
    const quotaCheck = await checkStorageQuota(project.id, file.size)
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 })
    }

    // Build key for project avatar
    const cleanedName = sanitizeFileName(file.name)
    const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : undefined
    const safeExt = ext ? ext.toLowerCase() : "bin"
    const timestamp = Date.now()

    const key = `public/${projectId}/avatar/avatar-${timestamp}.${safeExt}`

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    const processedBuffer = Buffer.from(arrayBuffer)

    const s3 = await createR2Client()
    const { R2_BUCKET_NAME } = {
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: file.type,
      })
    )

    // Update storage usage
    await updateStorageUsage(project.id, file.size)

    const publicUrl = await getPublicUrlForKey(key)

    return NextResponse.json({ key, publicUrl })
  } catch (error) {
    console.error("Project avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

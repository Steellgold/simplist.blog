import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { requirePermission } from "@/lib/auth/permissions"
import { sanitizeFileName } from "@/lib/utils"
import { prisma } from "@simplist/db"
import { checkStorageQuota, updateStorageUsage } from "@/lib/subscription/quota-check"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
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
    const type = formData.get("type") as string | null // "avatar" | "banner"
    const postId = formData.get("postId") as string | null // Only for banner

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }
    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
      }, { status: 400 })
    }

    // Validate file size
    const maxSize = type === "avatar" ? 2 * 1024 * 1024 : MAX_FILE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // Check permissions based on upload type
    if (type === "avatar") {
      // Avatar uploads require canManageProject permission
      try {
        await requirePermission(projectId, "canManageProject")
      } catch {
        return NextResponse.json({ error: "Insufficient permissions to upload project avatar" }, { status: 403 })
      }
    } else if (type === "banner") {
      // Banner uploads require canManageArticles permission
      if (!postId) {
        return NextResponse.json({ error: "postId is required for banner uploads" }, { status: 400 })
      }

      try {
        await requirePermission(projectId, "canManageArticles")
      } catch {
        return NextResponse.json({ error: "Insufficient permissions to upload article banner" }, { status: 403 })
      }

      // Verify article exists in this project
      const article = await prisma.article.findFirst({
        where: {
          id: postId,
          projectId: projectId,
        },
      })

      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
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

    // Build key based on type
    const cleanedName = sanitizeFileName(file.name)
    const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : undefined
    const safeExt = ext ? ext.toLowerCase() : "bin"
    const timestamp = Date.now()

    let key: string
    if (type === "avatar") {
      key = `public/${projectId}/avatar/avatar-${timestamp}.${safeExt}`
    } else {
      // type === "banner" (already validated above)
      key = `public/${projectId}/${postId}/b/banner-${timestamp}.${safeExt}`
    }

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
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

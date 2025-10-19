import { buildBannerKey, createR2Client, getPublicUrlForKey } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
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
    const postId = formData.get("postId") as string | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }
    if (!projectId || !postId) {
      return NextResponse.json({ error: "projectId and postId are required" }, { status: 400 })
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

    const article = await prisma.article.findFirst({
      where: { id: postId },
      include: { project: true },
    })

    if (!article || article.project.id !== projectId || article.project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Upload image without compression (Sharp removed to avoid Vercel issues)
    const arrayBuffer = await file.arrayBuffer()
    const processedBuffer = Buffer.from(arrayBuffer)
    const finalMimeType = file.type

    const key = await buildBannerKey({
      projectId,
      postId,
      originalFileName: file.name,
    })

    const s3 = await createR2Client()
    const { R2_BUCKET_NAME } = {
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: finalMimeType,
      })
    )

    const publicUrl = await getPublicUrlForKey(key)

    return NextResponse.json({ key, publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}



import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { createR2Client, buildBannerKey, getPublicUrlForKey } from "@/lib/actions/images"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import sharp from "sharp"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
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

    // Process image with compression
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let processedBuffer: Buffer
    let finalMimeType = file.type

    try {
      const image = sharp(buffer)

      // Compress based on type
      if (file.type === "image/png") {
        processedBuffer = await image.png({ quality: 90, compressionLevel: 9 }).toBuffer()
      } else if (file.type === "image/webp") {
        processedBuffer = await image.webp({ quality: 85 }).toBuffer()
      } else if (file.type === "image/gif") {
        processedBuffer = buffer // Don't compress GIFs
      } else {
        processedBuffer = await image.jpeg({ quality: 85, progressive: true }).toBuffer()
        finalMimeType = "image/jpeg"
      }
    } catch {
      return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }

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



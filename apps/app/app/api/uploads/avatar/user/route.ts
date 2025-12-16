import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { sanitizeFileName } from "@/lib/utils"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for user avatars
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
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

    // Build key for user avatar
    const cleanedName = sanitizeFileName(file.name)
    const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : undefined
    const safeExt = ext ? ext.toLowerCase() : "bin"
    const timestamp = Date.now()

    const key = `public/users/${user.id}/avatar/avatar-${timestamp}.${safeExt}`

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

    const publicUrl = await getPublicUrlForKey(key)

    return NextResponse.json({ key, publicUrl })
  } catch (error) {
    console.error("User avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

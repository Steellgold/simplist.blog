import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { createR2Client, buildBannerKey, getPublicUrlForKey } from "@/lib/actions/images"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export async function POST(req: Request) {
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

    const article = await prisma.article.findFirst({
      where: { id: postId },
      include: { project: true },
    })

    if (!article || article.project.id !== projectId || article.project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

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
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    )

    const publicUrl = await getPublicUrlForKey(key)

    return NextResponse.json({ key, publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}



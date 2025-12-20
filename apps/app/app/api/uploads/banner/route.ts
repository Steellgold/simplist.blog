import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images";
import { getCurrentUser } from "@/lib/auth-helper";
import { requirePermission } from "@/lib/auth/permissions";
import {
  checkStorageQuota,
  updateStorageUsage,
} from "@/lib/subscription/quota-check";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  FILE_SIZE_LIMITS,
  formatFileSizeLimit,
  isAllowedImageType,
} from "@/lib/uploads/constants";
import { sanitizeFileName } from "@/lib/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@simplist/db";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const postId = formData.get("postId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }
    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.ARTICLE_BANNER) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${formatFileSizeLimit(FILE_SIZE_LIMITS.ARTICLE_BANNER)}`,
        },
        { status: 400 },
      );
    }

    // Check permissions - banner uploads require canManageArticles permission
    try {
      await requirePermission(projectId, "canManageArticles");
    } catch {
      return NextResponse.json(
        { error: "Insufficient permissions to upload article banner" },
        { status: 403 },
      );
    }

    // Verify article exists in this project
    const article = await prisma.article.findFirst({
      where: {
        id: postId,
        projectId: projectId,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Get project for quota checks
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check storage quota
    const quotaCheck = await checkStorageQuota(project.id, file.size);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    // Build key for article banner
    const cleanedName = sanitizeFileName(file.name);
    const ext = cleanedName.includes(".")
      ? cleanedName.split(".").pop()
      : undefined;

    const safeExt = ext ? ext.toLowerCase() : "bin";
    const mediaId = randomUUID();

    const key = `public/${projectId}/${postId}/b/${mediaId}.${safeExt}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    const processedBuffer = Buffer.from(arrayBuffer);

    const s3 = await createR2Client();
    const { R2_BUCKET_NAME } = {
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: file.type,
      }),
    );

    // Get public URL
    const publicUrl = await getPublicUrlForKey(key);

    // Create media record in database
    await prisma.media.create({
      data: {
        id: mediaId,
        projectId: project.id,
        filename: cleanedName,
        key,
        url: publicUrl,
        mimeType: file.type,
        size: file.size,
        type: "BANNER",
        uploadedById: user.id,
      },
    });

    // Update storage usage
    await updateStorageUsage(project.id, file.size);

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    console.error("Article banner upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};

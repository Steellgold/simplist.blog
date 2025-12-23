import { createR2Client, getPublicUrlForKey } from "@/lib/actions/images";
import { getCurrentUser } from "@/lib/auth-helper";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  FILE_SIZE_LIMITS,
  formatFileSizeLimit,
  isAllowedImageType,
} from "@/lib/uploads/constants";
import { sanitizeFileName } from "@/lib/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
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
    if (file.size > FILE_SIZE_LIMITS.USER_AVATAR) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${formatFileSizeLimit(FILE_SIZE_LIMITS.USER_AVATAR)}`,
        },
        { status: 400 },
      );
    }

    // Build key for user avatar
    const cleanedName = sanitizeFileName(file.name);
    const ext = cleanedName.includes(".")
      ? cleanedName.split(".").pop()
      : undefined;

    const safeExt = ext ? ext.toLowerCase() : "bin";
    const timestamp = Date.now();

    const key = `public/users/${user.id}/avatar/avatar-${timestamp}.${safeExt}`;

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

    const publicUrl = await getPublicUrlForKey(key);

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    console.error("User avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};

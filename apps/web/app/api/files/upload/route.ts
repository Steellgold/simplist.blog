import { auth } from "@/lib/auth";
import R2, { FileType } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("fileType") as FileType | null;
    
    const organizationId = formData.get("organizationId") as string | null;
    const userId = formData.get("userId") as string | null;
    const postId = formData.get("postId") as string | null;
    const customPath = formData.get("customPath") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json({ error: "Missing file type" }, { status: 400 });
    }

    if (fileType === "organization-logo" && !organizationId) {
      return NextResponse.json({ error: "Missing organization ID for organization logo" }, { status: 400 });
    }
    
    if (fileType === "post-image" && (!organizationId || !postId)) {
      return NextResponse.json({ error: "Missing organization ID or post ID for post image" }, { status: 400 });
    }

    if (fileType === "user-avatar" && !userId) {
      return NextResponse.json({ error: "Missing user ID for user avatar" }, { status: 400 });
    }

    if (fileType === "custom" && !customPath) {
      return NextResponse.json({ error: "Missing custom path for custom file type" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File must not exceed 2MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split(".").pop() || "png";

    const fileUrl = await R2.uploadFile(buffer, fileType, {
      organizationId: organizationId || undefined,
      userId: userId || undefined,
      postId: postId || undefined,
      customPath: customPath || undefined,
      contentType: file.type,
      extension: fileExtension
    });

    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage = error instanceof Error ? error.message : "Server error while uploading file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const fileType = searchParams.get("fileType") as FileType;
    const organizationId = searchParams.get("organizationId");
    const userId = searchParams.get("userId");
    const postId = searchParams.get("postId");
    const customPath = searchParams.get("customPath");
    
    if (!fileType) {
      return NextResponse.json({ error: "Missing file type" }, { status: 400 });
    }

    let fileKey: string;
    
    switch (fileType) {
      case "organization-logo":
        if (!organizationId) {
          return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
        }
        fileKey = `organizations/${organizationId}/logo.png`;
        break;
        
      case "post-image":
        if (!organizationId || !postId) {
          return NextResponse.json({ error: "Missing organization ID or post ID" }, { status: 400 });
        }
        fileKey = `organizations/${organizationId}/posts/${postId}/image.png`;
        break;
        
      case "user-avatar":
        if (!userId) {
          return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }
        fileKey = `users/${userId}/avatar.png`;
        break;
        
      case "custom":
        if (!customPath) {
          return NextResponse.json({ error: "Missing custom path" }, { status: 400 });
        }
        fileKey = customPath;
        break;
        
      default:
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    
    try {
      const fileUrl = await R2.getFileUrl(fileKey);
      return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
      console.error("Error retrieving file:", error);
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving file:", error);
    return NextResponse.json({ error: "Server error while retrieving file" }, { status: 500 });
  }
};
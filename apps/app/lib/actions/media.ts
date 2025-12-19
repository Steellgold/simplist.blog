"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { requirePermission } from "@/lib/auth/permissions";
import { MediaType, prisma } from "@simplist/db";
import { getPlanLimits } from "@simplist/limits";
import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import { createR2Client } from "./images";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { decrementStorageUsage } from "@/lib/subscription/quota-check";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: MediaType;
  createdAt: Date;
  uploadedBy?: { id: string; name: string | null; image: string | null } | null;
};

export type StorageStats = {
  used: number;
  limit: number;
  byType: { type: MediaType; count: number; size: number }[];
};

interface GetProjectMediaOptions {
  page?: number;
  limit?: number;
  type?: MediaType;
  search?: string;
}

/**
 * Get paginated media for a project
 */
export async function getProjectMedia(
  projectId: string,
  options: GetProjectMediaOptions = {},
): Promise<{
  media: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const { page = 1, limit = 24, type, search } = options;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    projectId: string;
    type?: MediaType;
    filename?: { contains: string; mode: "insensitive" };
  } = {
    projectId,
  };

  if (type) {
    where.type = type;
  }

  if (search) {
    where.filename = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media: media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      size: m.size,
      mimeType: m.mimeType,
      type: m.type,
      createdAt: m.createdAt,
      uploadedBy: m.uploadedBy,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get storage statistics for a project
 */
export async function getStorageStats(
  projectId: string,
): Promise<StorageStats> {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  // Get project with subscription info
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      totalStorageUsed: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Determine effective tier
  const isPro =
    project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    project.subscriptionExpiresAt > new Date();

  const tier = isPro ? "PRO" : "STARTER";
  const limits = getPlanLimits(tier);

  // Get storage breakdown by type
  const byType = await prisma.media.groupBy({
    by: ["type"],
    where: { projectId },
    _count: { id: true },
    _sum: { size: true },
  });

  return {
    used: project.totalStorageUsed,
    limit: limits.maxStorageBytes,
    byType: byType.map((item) => ({
      type: item.type,
      count: item._count.id,
      size: item._sum.size || 0,
    })),
  };
}

/**
 * Create a media record after upload
 */
export async function createMedia(
  projectId: string,
  data: {
    id: string;
    filename: string;
    key: string;
    url: string;
    size: number;
    mimeType: string;
    type?: MediaType;
  },
): Promise<MediaItem> {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  // Check permissions
  await requirePermission(projectId, "canManageArticles");

  const media = await prisma.media.create({
    data: {
      id: data.id,
      projectId,
      filename: data.filename,
      key: data.key,
      url: data.url,
      size: data.size,
      mimeType: data.mimeType,
      type: data.type || "CONTENT",
      uploadedById: user.id,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    id: media.id,
    filename: media.filename,
    url: media.url,
    size: media.size,
    mimeType: media.mimeType,
    type: media.type,
    createdAt: media.createdAt,
    uploadedBy: media.uploadedBy,
  };
}

/**
 * Delete a single media item
 */
export async function deleteMedia(
  mediaId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get media with project info
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      projectId: true,
      key: true,
      size: true,
      url: true,
    },
  });

  if (!media) {
    return { error: "Media not found" };
  }

  // Check permissions
  try {
    await requirePermission(media.projectId, "canManageArticles");
  } catch {
    return { error: "Insufficient permissions" };
  }

  // Delete from R2
  try {
    const s3 = await createR2Client();
    const bucketName = process.env.R2_BUCKET_NAME as string;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: media.key,
      }),
    );
  } catch (error) {
    console.error("Failed to delete from R2:", error);
    // Continue with database deletion even if R2 fails
  }

  // Clear coverImage from any articles using this media
  await prisma.article.updateMany({
    where: {
      projectId: media.projectId,
      coverImage: media.url,
    },
    data: {
      coverImage: null,
    },
  });

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId },
  });

  // Update storage usage
  await decrementStorageUsage(media.projectId, media.size);

  return { success: true };
}

/**
 * Delete multiple media items (PRO feature)
 */
export async function deleteMultipleMedia(
  ids: string[],
): Promise<{ success: true; deleted: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  if (ids.length === 0) {
    return { success: true, deleted: 0 };
  }

  // Get all media items
  const mediaItems = await prisma.media.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      projectId: true,
      key: true,
      size: true,
      url: true,
    },
  });

  if (mediaItems.length === 0) {
    return { error: "No media found" };
  }

  // Verify all items belong to same project and check permissions
  const projectId = mediaItems[0]?.projectId;
  if (!projectId) {
    return { error: "Invalid media" };
  }

  const allSameProject = mediaItems.every((m) => m.projectId === projectId);
  if (!allSameProject) {
    return { error: "Cannot delete media from different projects" };
  }

  // Check permissions
  try {
    await requirePermission(projectId, "canManageArticles");
  } catch {
    return { error: "Insufficient permissions" };
  }

  // Check if project has PRO tier for bulk delete
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  const isPro =
    project?.subscriptionTier === "PRO" &&
    project?.subscriptionExpiresAt &&
    project.subscriptionExpiresAt > new Date();

  if (!isPro) {
    return { error: "Bulk delete is a PRO feature" };
  }

  // Delete from R2
  const s3 = await createR2Client();
  const bucketName = process.env.R2_BUCKET_NAME as string;

  let totalSize = 0;
  const mediaUrls = mediaItems.map((m) => m.url);

  for (const media of mediaItems) {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: media.key,
        }),
      );
      totalSize += media.size;
    } catch (error) {
      console.error(`Failed to delete ${media.key} from R2:`, error);
      // Continue with other deletions
    }
  }

  // Clear coverImage from any articles using these media files
  await prisma.article.updateMany({
    where: {
      projectId,
      coverImage: { in: mediaUrls },
    },
    data: {
      coverImage: null,
    },
  });

  // Delete from database
  await prisma.media.deleteMany({
    where: { id: { in: ids } },
  });

  // Update storage usage
  await decrementStorageUsage(projectId, totalSize);

  return { success: true, deleted: mediaItems.length };
}

/**
 * Get articles for applying banner
 */
export async function getProjectArticles(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const articles = await prisma.article.findMany({
    where: {
      projectId,
      status: { not: "deleted" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return articles;
}

/**
 * Apply a media item as article banner
 */
export async function applyMediaAsBanner(
  mediaId: string,
  articleId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get media
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      projectId: true,
      url: true,
    },
  });

  if (!media) {
    return { error: "Media not found" };
  }

  // Get article and verify it belongs to same project
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!article) {
    return { error: "Article not found" };
  }

  if (article.projectId !== media.projectId) {
    return { error: "Media and article must belong to the same project" };
  }

  // Check permissions
  try {
    await requirePermission(media.projectId, "canManageArticles");
  } catch {
    return { error: "Insufficient permissions" };
  }

  // Update article with new cover image
  await prisma.article.update({
    where: { id: articleId },
    data: { coverImage: media.url },
  });

  // Update media type to BANNER
  await prisma.media.update({
    where: { id: mediaId },
    data: { type: "BANNER" },
  });

  revalidatePath(`/[project-slug]/articles/${article.id}`);

  return { success: true };
}

"use server"

import { assertR2ObjectIsImage, getR2PublicUrl } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { checkArticleQuota, checkFeatureAccess } from "@/lib/subscription/quota-check"
import { generateSlug } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { forbidden, redirect } from "next/navigation"


// Calculate content statistics
const calculateStats = (content: string) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const lines = content.split("\n").length;
  const readTimeMinutes = Math.ceil(words / 200); // Average reading speed: 200 words/min

  return {
    wordCount: words,
    characterCount: characters,
    lineCount: lines,
    readTimeMinutes,
  };
}

export const createArticle = async (formData: {
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  coverImage?: string;
  scheduledPublishAt?: Date;
}) => {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");

  // Get user's first project (single project mode)
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!project) redirect("/create-project");

  // Check article quota
  const quotaCheck = await checkArticleQuota(user.id, project.id);
  if (!quotaCheck.allowed) {
    throw new Error(quotaCheck.reason);
  }

  // Validate scheduled publishing
  if (formData.status === "scheduled") {
    if (!formData.scheduledPublishAt) {
      throw new Error("Scheduled publish date is required for scheduled articles");
    }
    if (formData.scheduledPublishAt <= new Date()) {
      throw new Error("Scheduled publish date must be in the future");
    }
  }

  // Use transaction to ensure atomicity
  const article = await prisma.$transaction(async (tx) => {
    // Generate slug from title
    const baseSlug = generateSlug(formData.title);

    // Generate unique slug within transaction
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await tx.article.findFirst({
        where: {
          slug,
          projectId: project.id,
        },
      });

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate content statistics
    const stats = calculateStats(formData.content);

    // Create article within transaction
    return await tx.article.create({
      data: {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        status: formData.status,
        published: formData.status === "published",
        publishedAt: formData.status === "published" ? new Date() : null,
        scheduledPublishAt: formData.scheduledPublishAt || null,
        projectId: project.id,
        ...stats,
      },
    });
  });

  // Revalidate all relevant paths
  revalidatePath(`/${project.slug}`, "layout");
  revalidatePath(`/${project.slug}/articles`, "page");
  return article;
}

export const updateArticleCoverImage = async (params: { articleId: string; objectKey: string }) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: { id: params.articleId },
    include: { project: true },
  })

  if (!article || article.project.userId !== user.id) {
    forbidden()
  }

  // Validate the uploaded object is an image
  await assertR2ObjectIsImage(params.objectKey)

  const coverImageUrl = await getR2PublicUrl(params.objectKey)

  const updated = await prisma.article.update({
    where: { id: params.articleId },
    data: { coverImage: coverImageUrl },
  })

  revalidatePath(`/${article.project.slug}`, "layout")
  revalidatePath(`/${article.project.slug}/articles`, "page")
  return updated
}

export const removeArticleCoverImage = async (articleId: string) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId },
    include: { project: true },
  })

  if (!article || article.project.userId !== user.id) {
    forbidden()
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { coverImage: null },
  })

  revalidatePath(`/${article.project.slug}`, "layout")
  revalidatePath(`/${article.project.slug}/articles`, "page")
  return updated
}

export const getProjectArticles = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the project belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) forbidden();

  const articles = await prisma.article.findMany({
    where: {
      projectId,
      status: {
        not: "deleted", // Exclude soft-deleted articles
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return articles
}

export const getUserProjectWithArticles = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      articles: {
        where: {
          status: {
            not: "deleted",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!project) {
    return null
  }

  // Calculate view counts for each article
  const articlesWithViewCount = await Promise.all(
    project.articles.map(async (article) => {
      const viewCount = await prisma.pageView.count({
        where: {
          articleId: article.id,
        },
      })
      
      return {
        ...article,
        viewCount,
      }
    })
  )

  return {
    ...project,
    articles: articlesWithViewCount,
  }
}

export const getArticle = async (articleId: string) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: {
        not: "deleted",
      },
    },
    include: {
      project: true,
    },
  })

  if (!article || article.project.userId !== user.id) {
    return null
  }

  return article
}

export const getArticleBySlug = async (slug: string) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: {
      slug,
      project: {
        userId: user.id, // Ensure user owns the project
      },
    },
    include: {
      project: true,
    },
  })

  return article
}

export const getDeletedArticleBySlug = async (slug: string) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: "deleted",
      project: {
        userId: user.id, // Ensure user owns the project
      },
    },
    include: {
      project: true,
    },
  })

  return article
}

export const updateArticle = async (articleId: string, formData: {
  title: string
  excerpt: string
  content: string
  status: "draft" | "published" | "scheduled"
  scheduledPublishAt?: Date | null
}) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId },
    include: { project: true },
  })

  if (!article || article.project.userId !== user.id) {
    forbidden()
  }

  // Validate scheduled publishing
  if (formData.status === "scheduled") {
    if (!formData.scheduledPublishAt) {
      throw new Error("Scheduled publish date is required for scheduled articles");
    }
    if (formData.scheduledPublishAt <= new Date()) {
      throw new Error("Scheduled publish date must be in the future");
    }
  }

  // Calculate content statistics
  const stats = calculateStats(formData.content)

  // Update article
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      published: formData.status === "published",
      publishedAt: formData.status === "published" && !article.publishedAt ? new Date() : article.publishedAt,
      scheduledPublishAt: formData.scheduledPublishAt,
      ...stats,
    },
  })

  revalidatePath(`/${article.project.slug}`, "layout")
  revalidatePath(`/${article.project.slug}/articles`, "page")
  return updated
}

export const deleteArticle = async (articleId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the article belongs to the user's project
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
    },
    include: {
      project: true,
    },
  })

  if (!article || article.project.userId !== user.id) {
    throw new Error("Article not found or you don't have permission")
  }

  // Soft delete: update status and deletedAt instead of deleting
  await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      status: "deleted",
      deletedAt: new Date(),
    },
  })

  revalidatePath(`/${article.project.slug}`, "layout")
  revalidatePath(`/${article.project.slug}/articles`, "page")
}

export const bulkDeleteArticles = async (articleIds: string[]) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get project ID from first article
  const firstArticle = await prisma.article.findFirst({
    where: { id: articleIds[0] },
    select: { projectId: true },
  });

  if (!firstArticle) {
    throw new Error("Article not found");
  }

  // Check if user has access to bulk operations
  const hasBulkAccess = await checkFeatureAccess(user.id, firstArticle.projectId, "bulkOperations");
  if (!hasBulkAccess) {
    throw new Error("Bulk operations are only available on Pro plan. Upgrade to delete multiple articles at once.");
  }

  if (!articleIds || articleIds.length === 0) {
    throw new Error("No articles to delete")
  }

  // Verify all articles belong to the user's projects
  const articles = await prisma.article.findMany({
    where: {
      id: {
        in: articleIds,
      },
    },
    include: {
      project: true,
    },
  })

  // Check if all articles belong to user
  const unauthorizedArticles = articles.filter(
    (article) => article.project.userId !== user.id
  )

  if (unauthorizedArticles.length > 0) {
    throw new Error("You don't have permission to delete some of these articles")
  }

  // Verify count matches (no missing articles)
  if (articles.length !== articleIds.length) {
    throw new Error("Some articles were not found")
  }

  // Soft delete all articles
  await prisma.article.updateMany({
    where: {
      id: {
        in: articleIds,
      },
    },
    data: {
      status: "deleted",
      deletedAt: new Date(),
    },
  })

  // Get project slug for revalidation
  const projectSlug = articles[0].project.slug
  revalidatePath(`/${projectSlug}`, "layout")
  revalidatePath(`/${projectSlug}/articles`, "page")
}

export const restoreArticle = async (articleId: string) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Verify the article belongs to the user's project and is deleted
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "deleted",
    },
    include: {
      project: true,
    },
  })

  if (!article || article.project.userId !== user.id) {
    throw new Error("Article not found or you don't have permission to restore it")
  }

  // Restore the article by updating its status and clearing deletedAt
  const restored = await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      status: "draft", // Restore as draft by default
      deletedAt: null,
    },
  })

  revalidatePath(`/${article.project.slug}`, "layout")
  revalidatePath(`/${article.project.slug}/articles`, "page")
  return restored
}

export const getScheduledArticles = async () => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's first project (single project mode)
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
    },
  })

  if (!project) return []

  // Get articles that are scheduled and ready to publish
  const now = new Date()
  const scheduledArticles = await prisma.article.findMany({
    where: {
      projectId: project.id,
      status: "scheduled",
      scheduledPublishAt: {
        lte: now,
      },
    },
    include: {
      project: true,
    },
  })

  return scheduledArticles
}

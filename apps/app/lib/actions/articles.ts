"use server"

import { assertR2ObjectIsImage, getR2PublicUrl } from "@/lib/actions/images"
import { getCurrentUser } from "@/lib/auth-helper"
import { checkArticleQuota, checkFeatureAccess, checkVariantQuota } from "@/lib/subscription/quota-check"
import { type LanguageCode, isValidLanguageCode } from "@/lib/types/languages"
import { generateSlug } from "@/lib/utils"
import { prisma } from "@simplist/db"
import { revalidatePath } from "next/cache"
import { forbidden, notFound, redirect } from "next/navigation"

// Types for article variants
export interface ArticleVariantInput {
  lang: LanguageCode;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
}

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
  projectId?: string;
  variants?: ArticleVariantInput[];
}) => {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");

  // Get the specified project or user's first project (single project mode)
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
      ...(formData.projectId ? { id: formData.projectId } : {}),
    },
  });

  if (!project) redirect("/create-project");

  // Check article quota
  const quotaCheck = await checkArticleQuota(user.id, project.id);
  if (!quotaCheck.allowed) {
    throw new Error(quotaCheck.reason);
  }

  // Validate and check quota for variants
  if (formData.variants && formData.variants.length > 0) {
    // Validate language codes
    for (const variant of formData.variants) {
      if (!isValidLanguageCode(variant.lang)) {
        throw new Error(`Invalid language code: ${variant.lang}`);
      }
    }

    // Check variant quota
    const variantQuotaCheck = await checkVariantQuota(user.id, project.id);
    if (!variantQuotaCheck.allowed) {
      throw new Error(variantQuotaCheck.reason);
    }

    // Ensure we don't exceed the per-article variant limit
    if (variantQuotaCheck.limit && variantQuotaCheck.limit !== -1 && formData.variants.length > variantQuotaCheck.limit) {
      throw new Error(`Cannot create ${formData.variants.length} variants. Your plan allows up to ${variantQuotaCheck.limit} variants per article.`);
    }

    // Check for duplicate languages
    const langs = formData.variants.map(v => v.lang);
    const duplicates = langs.filter((lang, index) => langs.indexOf(lang) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate language variants found: ${duplicates.join(', ')}`);
    }
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
    const existingSlugs = await tx.article.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
        projectId: project.id,
      },
      select: {
        slug: true,
      },
    });

    let slug = baseSlug;
    if (existingSlugs.length > 0) {
      const slugSet = new Set(existingSlugs.map(a => a.slug));

      if (slugSet.has(baseSlug)) {
        let counter = 1;
        while (slugSet.has(`${baseSlug}-${counter}`)) {
          counter++;
        }
        slug = `${baseSlug}-${counter}`;
      }
    }

    // Calculate content statistics
    const stats = calculateStats(formData.content);

    // Create article within transaction
    const newArticle = await tx.article.create({
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

    // Create article variants if provided
    if (formData.variants && formData.variants.length > 0) {
      const variantData = formData.variants.map(variant => {
        const variantStats = calculateStats(variant.content);
        return {
          articleId: newArticle.id,
          lang: variant.lang,
          title: variant.title,
          excerpt: variant.excerpt,
          content: variant.content,
          coverImage: variant.coverImage,
          ...variantStats,
        };
      });

      await tx.articleVariant.createMany({
        data: variantData,
      });
    }

    return newArticle;
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
    select: {
      id: true,
      coverImage: true,
      project: {
        select: {
          userId: true,
          id: true,
          slug: true
        }
      }
    },
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
    select: {
      id: true,
      coverImage: true,
      project: {
        select: {
          userId: true,
          slug: true
        }
      }
    },
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

export const getProjectArticles = async (projectId: string, userId?: string) => {
  if (!userId) {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth/login")
    }

    userId = user.id

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })

    if (!project) forbidden();
  }

  const articles = await prisma.article.findMany({
    where: {
      projectId,
      status: {
        not: "deleted", // Exclude soft-deleted articles
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      status: true,
      viewCount: true,
      wordCount: true,
      characterCount: true,
      lineCount: true,
      readTimeMinutes: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      scheduledPublishAt: true,
      deletedAt: true,
      projectId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100
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
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      articles: {
        where: {
          status: {
            not: "deleted",
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          published: true,
          status: true,
          viewCount: true,
          wordCount: true,
          characterCount: true,
          lineCount: true,
          readTimeMinutes: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          scheduledPublishAt: true,
          deletedAt: true,
          projectId: true,
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

  // Calculate view counts for all articles in a single query using groupBy
  const articleIds = project.articles.map((a) => a.id)

  const viewCounts = articleIds.length > 0
    ? await prisma.pageView.groupBy({
        by: ['articleId'],
        where: {
          articleId: { in: articleIds },
        },
        _count: {
          id: true,
        },
      })
    : []

  // Create a map for O(1) lookup
  const viewCountMap = new Map(
    viewCounts.map((vc) => [vc.articleId, vc._count.id])
  )

  // Merge view counts with articles
  const articlesWithViewCount = project.articles.map((article) => ({
    ...article,
    viewCount: viewCountMap.get(article.id) ?? 0,
  }))

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
  variants?: ArticleVariantInput[]
}) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId },
    select: {
      id: true,
      projectId: true,
      publishedAt: true,
      project: {
        select: {
          id: true,
          userId: true,
          subscriptionTier: true,
          slug: true
        }
      }
    },
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

  // Validate and check quota for variants
  if (formData.variants && formData.variants.length > 0) {
    // Validate language codes
    for (const variant of formData.variants) {
      if (!isValidLanguageCode(variant.lang)) {
        throw new Error(`Invalid language code: ${variant.lang}`);
      }
    }

    // Check variant quota for the existing article
    const variantQuotaCheck = await checkVariantQuota(user.id, article.project.id, articleId);
    if (!variantQuotaCheck.allowed) {
      throw new Error(variantQuotaCheck.reason);
    }

    // Check for duplicate languages
    const langs = formData.variants.map(v => v.lang);
    const duplicates = langs.filter((lang, index) => langs.indexOf(lang) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate language variants found: ${duplicates.join(', ')}`);
    }
  }

  // Use transaction to ensure atomicity
  const updated = await prisma.$transaction(async (tx) => {
    // Calculate content statistics
    const stats = calculateStats(formData.content);

    // Update article
    const updatedArticle = await tx.article.update({
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
    });

    // Handle variants if provided
    if (formData.variants) {
      // Delete all existing variants
      await tx.articleVariant.deleteMany({
        where: { articleId },
      });

      // Create new variants
      if (formData.variants.length > 0) {
        const variantData = formData.variants.map(variant => {
          const variantStats = calculateStats(variant.content);
          return {
            articleId,
            lang: variant.lang,
            title: variant.title,
            excerpt: variant.excerpt,
            content: variant.content,
            coverImage: variant.coverImage,
            ...variantStats,
          };
        });

        await tx.articleVariant.createMany({
          data: variantData,
        });
      }
    }

    return updatedArticle;
  });

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
    select: {
      id: true,
      project: {
        select: {
          userId: true,
          slug: true,
        },
      },
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

  if (!firstArticle) notFound();

  // Check if user has access to bulk operations
  const hasBulkAccess = await checkFeatureAccess(user.id, firstArticle.projectId, "bulkOperations");
  if (!hasBulkAccess) {
    throw new Error("Bulk delete is a Pro feature. Upgrade to Pro to delete multiple articles at once.");
  }

  if (!articleIds || articleIds.length === 0) forbidden();

  // Verify all articles belong to the user's projects
  const articles = await prisma.article.findMany({
    where: {
      id: {
        in: articleIds,
      },
    },
    select: {
      id: true,
      project: {
        select: {
          userId: true,
          slug: true,
        },
      },
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
    select: {
      id: true,
      status: true,
      project: {
        select: {
          userId: true,
          slug: true,
        },
      },
    },
  })

  if (!article || article.project.userId !== user.id) forbidden();

  // Restore the article by updating its status and clearing deletedAt
  await prisma.article.update({
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
  return true
}

export const getScheduledArticles = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  // Get user's first project (single project mode)
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
    },
  })

  if (!project) notFound();

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

export const getArticleWithVariants = async (articleId: string) => {
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
      project: {
        select: {
          userId: true,
          slug: true,
          defaultLanguage: true,
        },
      },
      variants: {
        orderBy: {
          lang: "asc",
        },
      },
    },
  })

  if (!article || article.project.userId !== user.id) {
    return null
  }

  return article
}

export const getArticleBySlugWithVariants = async (slug: string) => {
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
      project: {
        select: {
          userId: true,
          slug: true,
          defaultLanguage: true,
        },
      },
      variants: {
        orderBy: {
          lang: "asc",
        },
      },
    },
  })

  return article
}

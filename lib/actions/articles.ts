"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { generateSlug } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { getR2PublicUrl, assertR2ObjectIsImage } from "@/lib/actions/images"
import { forbidden, redirect } from "next/navigation"

// Helper function to ensure unique slug
const generateUniqueSlug = async (baseSlug: string, projectId: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: {
        slug,
        projectId,
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Calculate content statistics
const calculateStats = (content: string) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const lines = content.split('\n').length;
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
  status: "draft" | "published";
  coverImage?: string;
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

  // Generate slug from title
  const baseSlug = generateSlug(formData.title);
  const slug = await generateUniqueSlug(baseSlug, project.id);

  // Calculate content statistics
  const stats = calculateStats(formData.content);

  // Create article
  const article = await prisma.article.create({
    data: {
      title: formData.title,
      slug,
      excerpt: formData.excerpt,
      content: formData.content,
      coverImage: formData.coverImage,
      status: formData.status,
      published: formData.status === "published",
      publishedAt: formData.status === "published" ? new Date() : null,
      projectId: project.id,
      ...stats,
    },
  });

  revalidatePath("/articles");
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

  revalidatePath("/articles")
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

  revalidatePath("/articles")
}

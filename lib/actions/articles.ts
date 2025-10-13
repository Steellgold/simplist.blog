"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-helper"
import { prisma } from "../db"

export async function getProjectArticles(projectId: string) {
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

  if (!project) {
    throw new Error("Project not found or you don't have permission")
  }

  const articles = await prisma.article.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return articles
}

export async function deleteArticle(articleId: string) {
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

  await prisma.article.delete({
    where: {
      id: articleId,
    },
  })

  revalidatePath("/articles")
}

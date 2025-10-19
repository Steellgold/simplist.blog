"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createProjectSchema } from "../validations/project"
import { getCurrentUser } from "../auth-helper"
import { prisma } from "../db"

export const getUserProjects = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return projects
}

export const createProject = async (input: { name: string; slug: string; description?: string }) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Validate input with Zod
  const validatedData = createProjectSchema.parse({
    name: input.name,
    description: input.description || "",
  })

  // Check if user already has a project (single project mode)
  const existingProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
  })

  if (existingProjects.length > 0) {
    throw new Error("You already have a project. Only one project per user is allowed.")
  }

  // Check if slug already exists for this user and make it unique if needed
  let finalSlug = input.slug
  let counter = 1

  while (true) {
    const existingProject = await prisma.project.findFirst({
      where: {
        slug: finalSlug,
        userId: user.id,
      },
    })

    if (!existingProject) {
      break
    }

    finalSlug = `${input.slug}-${counter}`
    counter++
  }

  const project = await prisma.project.create({
    data: {
      name: validatedData.name,
      slug: finalSlug,
      description: validatedData.description || null,
      userId: user.id,
    },
  })

  revalidatePath("/")
  return project
}

export const deleteProject = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) {
    throw new Error("Project not found or you don't have permission")
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  })

  revalidatePath("/")
}

export const updateProject = async (
  projectId: string,
  input: { name: string; description?: string }
) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) {
    throw new Error("Project not found or you don't have permission")
  }

  // Generate a slug from the new name and ensure uniqueness per user
  const baseSlug = input.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  let finalSlug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.project.findFirst({
      where: {
        slug: finalSlug,
        userId: user.id,
        NOT: { id: projectId },
      },
    })

    if (!existing) break
    finalSlug = `${baseSlug}-${counter}`
    counter++
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      slug: finalSlug,
      description: input.description ?? project.description,
    },
  })

  // Revalidate dashboard pages that show project info
  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/settings")
  return updated
}

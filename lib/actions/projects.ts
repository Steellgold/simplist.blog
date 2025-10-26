"use server"

import { revalidatePath } from "next/cache"
import { forbidden, notFound, redirect } from "next/navigation"
import { getCurrentUser } from "../auth-helper"
import { prisma } from "../db"
import { CreateProjectActionInput, createProjectSchema, UpdateProjectSettingsInput } from "../validations/project"

export const getUserProjects = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      timezone: true,
      defaultLanguage: true,
      createdAt: true,
      updatedAt: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      stripeCustomerId: true,
      allowedOrigins: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return projects
}

export const createProject = async (input: CreateProjectActionInput) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  // Check if user has reached the project limit (2 projects max)
  const existingProjects = await prisma.project.count({
    where: {
      userId: user.id,
    },
  })

  if (existingProjects >= 2) forbidden();

  // Validate input with Zod
  const validatedData = createProjectSchema.parse({
    name: input.name,
    description: input.description || "",
    timezone: input.timezone || "UTC",
    allowedOrigins: input.allowedOrigins || [],
  })

  // Extract string values from the validated data
  const allowedOriginStrings = validatedData.allowedOrigins.map(origin => origin.value)

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
      timezone: validatedData.timezone,
      subscriptionTier: "STARTER",
      allowedOrigins: allowedOriginStrings,
      userId: user.id,
    },
  })

  revalidatePath("/")
  return project
}

export const deleteProject = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) forbidden();

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

  if (!user) redirect("/auth/login");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) forbidden();

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

export const updateProjectSettings = async (projectId: string, input: UpdateProjectSettingsInput) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) forbidden();

  // Use the provided slug and ensure uniqueness per user
  let finalSlug = input.slug
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
    finalSlug = `${input.slug}-${counter}`
    counter++
  }

  // Extract string values from allowedOrigins
  const allowedOriginStrings = input.allowedOrigins?.map(origin => origin.value).filter(value => value?.trim() !== "")

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      slug: finalSlug,
      description: input.description || null,
      timezone: input.timezone,
      defaultLanguage: input.defaultLanguage,
      allowedOrigins: allowedOriginStrings,
    },
  })

  // Revalidate dashboard pages that show project info
  revalidatePath("/")
  revalidatePath(`/${project.slug}/settings`)
  return updated
}

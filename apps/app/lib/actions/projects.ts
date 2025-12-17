"use server"

import { ProjectDeletedEmail } from "@/components/emails/project-deleted"
import { render } from "@react-email/render"
import { prisma } from "@simplist/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-helper"
import { requirePermission } from "../auth/permissions"
import { sendEmail } from "../ses"
import { CreateProjectActionInput, createProjectSchema, isReservedSlug, UpdateProjectSettingsInput } from "../validations/project"

export const getUserProjects = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  const memberships = await prisma.projectMember.findMany({
    where: {
      userId: user.id,
      joinedAt: { not: null },
    },
    include: {
      project: true,
      role: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return memberships.map((m) => ({
    ...m.project,
    memberRole: m.role,
    isOwner: m.role.isOwner,
  }));
}

export const createProject = async (input: CreateProjectActionInput) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login");

  // Check if user has reached the project limit (2 owned projects max)
  const ownedProjectsCount = await prisma.projectMember.count({
    where: {
      userId: user.id,
      role: {
        isOwner: true,
      },
    },
  });

  if (ownedProjectsCount >= 2) {
    throw new Error("You have reached the maximum number of projects (2). Delete a project to create a new one.");
  }

  // Validate input with Zod
  const validatedData = createProjectSchema.parse({
    name: input.name,
    icon: input.icon || "building-2",
    color: input.color || "YELLOW",
    avatarUrl: input.avatarUrl ?? null,
    allowedOrigins: input.allowedOrigins || [],
    baseUrl: input.baseUrl ?? null,
    articleUrlPattern: input.articleUrlPattern || "/posts/{slug}",
  })

  // Extract string values from the validated data
  const allowedOriginStrings = validatedData.allowedOrigins.map(origin => origin.value)

  // Check if slug is reserved
  if (isReservedSlug(input.slug)) {
    throw new Error("This slug is reserved and cannot be used")
  }

  // Check if slug already exists globally and make it unique if needed
  const existingSlugs = await prisma.project.findMany({
    where: {
      slug: {
        startsWith: input.slug,
      },
    },
    select: {
      slug: true,
    },
  });

  let finalSlug = input.slug;
  if (existingSlugs.length > 0) {
    const slugSet = new Set(existingSlugs.map((p) => p.slug));

    if (slugSet.has(input.slug)) {
      let counter = 1;
      while (slugSet.has(`${input.slug}-${counter}`)) {
        counter++;
      }
      finalSlug = `${input.slug}-${counter}`;
    }
  }

  // Create project with default roles and owner membership in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the project
    const project = await tx.project.create({
      data: {
        name: validatedData.name,
        slug: finalSlug,
        icon: validatedData.icon,
        color: validatedData.color,
        timezone: "UTC",
        subscriptionTier: "STARTER",
        allowedOrigins: allowedOriginStrings,
        baseUrl: validatedData.baseUrl ?? null,
        articleUrlPattern: validatedData.articleUrlPattern || "/posts/{slug}",
        userId: user.id,
      },
    });

    // 2. Create default roles for the project
    const ownerRole = await tx.projectRole.create({
      data: {
        projectId: project.id,
        slug: "owner",
        name: "Owner",
        isOwner: true,
        isDefault: true,
        canManageProject: true,
        canManageMembers: true,
        canManageRoles: true,
        canManageArticles: true,
        canManageApiKeys: true,
        canManageWebhooks: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canDeleteProject: true,
      },
    });

    await tx.projectRole.create({
      data: {
        projectId: project.id,
        slug: "admin",
        name: "Administrator",
        isDefault: true,
        canManageProject: true,
        canManageMembers: true,
        canManageRoles: true,
        canManageArticles: true,
        canManageApiKeys: true,
        canManageWebhooks: true,
        canViewAnalytics: true,
      },
    });

    await tx.projectRole.create({
      data: {
        projectId: project.id,
        slug: "editor",
        name: "Editor",
        isDefault: true,
        canManageArticles: true,
        canManageApiKeys: true,
        canManageWebhooks: false,
        canViewAnalytics: true,
      },
    });

    await tx.projectRole.create({
      data: {
        projectId: project.id,
        slug: "viewer",
        name: "Viewer",
        isDefault: true,
        canViewAnalytics: true,
      },
    });

    // 3. Create owner membership for the creator
    await tx.projectMember.create({
      data: {
        userId: user.id,
        projectId: project.id,
        roleId: ownerRole.id,
        joinedAt: new Date(),
      },
    });

    return project;
  });

  revalidatePath("/")
  return result
}

export const deleteProject = async (projectId: string) => {
  const { user } = await requirePermission(projectId, "canDeleteProject");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, slug: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Hard delete the project (cascades) and mark API keys as deleted before removal
  await prisma.$transaction([
    prisma.apiKey.updateMany({
      where: { projectId },
      data: { status: "deleted", deletedAt: new Date() },
    }),
    prisma.project.delete({
      where: { id: projectId },
    }),
  ]);

  // Send confirmation email
  try {
    const html = await render(
      ProjectDeletedEmail({
        name: user.name || user.email,
        projectName: project.name,
      })
    );

    await sendEmail({
      to: user.email,
      subject: `Project "${project.name}" deleted`,
      html,
    });
  } catch (error) {
    // Non-blocking for user flow
    console.error("Failed to send project deletion email", error);
  }

  // Revalidate dashboard
  revalidatePath("/");
}

export const updateProject = async (
  projectId: string,
  input: { name: string }
) => {
  await requirePermission(projectId, "canManageProject");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Generate a slug from the new name and ensure global uniqueness
  const baseSlug = input.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if slug is reserved
  if (isReservedSlug(baseSlug)) {
    throw new Error("This slug is reserved and cannot be used");
  }

  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findFirst({
      where: {
        slug: finalSlug,
        NOT: { id: projectId },
      },
    });

    if (!existing) break;
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      slug: finalSlug,
    },
  });

  // Revalidate pages that depend on the project slug/name
  revalidatePath("/");
  revalidatePath(`/${project.slug}`, "layout");
  revalidatePath(`/${updated.slug}`, "layout");
  revalidatePath(`/${updated.slug}/settings`, "page");

  if (project.slug !== updated.slug) {
    revalidatePath(`/${project.slug}/settings`, "page");
  }
  return updated;
}

export const updateProjectSettings = async (projectId: string, input: UpdateProjectSettingsInput) => {
  await requirePermission(projectId, "canManageProject");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true, defaultLanguage: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Check if slug is reserved
  if (isReservedSlug(input.slug)) {
    throw new Error("This slug is reserved and cannot be used");
  }

  // Use the provided slug and ensure global uniqueness
  let finalSlug = input.slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findFirst({
      where: {
        slug: finalSlug,
        NOT: { id: projectId },
      },
    });

    if (!existing) break;
    finalSlug = `${input.slug}-${counter}`;
    counter++;
  }

  // Extract string values from allowedOrigins
  const allowedOriginStrings = input.allowedOrigins?.map(origin => origin.value).filter(value => value?.trim() !== "");

  // Detect if default language has changed
  const languageChanged = project.defaultLanguage !== input.defaultLanguage;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      slug: finalSlug,
      icon: input.icon,
      color: input.color,
      avatarUrl: input.avatarUrl ?? null,
      defaultLanguage: input.defaultLanguage,
      allowedOrigins: allowedOriginStrings,
      baseUrl: input.baseUrl ?? null,
      articleUrlPattern: input.articleUrlPattern,
    },
  });

  // If default language changed, migrate article variants
  if (languageChanged) {
    const { migrateArticleVariantsOnLanguageChange } = await import("../migrations/migrate-article-variants");
    await migrateArticleVariantsOnLanguageChange(
      projectId,
      project.defaultLanguage,
      input.defaultLanguage
    );
  }

  // Revalidate dashboard pages that show project info
  revalidatePath("/");
  revalidatePath(`/${project.slug}`, "layout");
  revalidatePath(`/${updated.slug}`, "layout");
  revalidatePath(`/${updated.slug}/settings`, "page");

  if (project.slug !== updated.slug) {
    revalidatePath(`/${project.slug}/settings`, "page");
  }
  return updated;
}
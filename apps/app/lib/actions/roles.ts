"use server";

import { prisma } from "@simplist/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "../auth/permissions";
import { createRoleSchema, updateRoleSchema } from "../validations/role";

/**
 * Gets all roles of a project (without the OWNER role)
 */
export const getProjectRoles = async (projectId: string) => {
  await requirePermission(projectId, "canManageRoles");

  const roles = await prisma.projectRole.findMany({
    where: {
      projectId,
      isOwner: false, // Exclude the phantom OWNER role
    },
    include: {
      _count: {
        select: { members: true }
      }
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return roles;
};

/**
 * Creates a custom role
 */
export const createProjectRole = async (
  projectId: string,
  input: {
    name: string;
    slug: string;
    permissions: {
      canManageProject?: boolean;
      canManageMembers?: boolean;
      canManageRoles?: boolean;
      canManageArticles?: boolean;
      canManageApiKeys?: boolean;
      canManageWebhooks?: boolean;
      canViewAnalytics?: boolean;
    };
  }
) => {
  await requirePermission(projectId, "canManageRoles");

  // Validate input
  const validatedData = createRoleSchema.parse(input);

  // Check if slug already exists for this project
  const existingRole = await prisma.projectRole.findUnique({
    where: {
      projectId_slug: {
        projectId,
        slug: validatedData.slug,
      },
    },
  });

  if (existingRole) {
    throw new Error("A role with this slug already exists for this project");
  }

  const role = await prisma.projectRole.create({
    data: {
      projectId,
      name: validatedData.name,
      slug: validatedData.slug,
      canManageProject: validatedData.permissions.canManageProject ?? false,
      canManageMembers: validatedData.permissions.canManageMembers ?? false,
      canManageRoles: validatedData.permissions.canManageRoles ?? false,
      canManageArticles: validatedData.permissions.canManageArticles ?? false,
      canManageApiKeys: validatedData.permissions.canManageApiKeys ?? false,
      canManageWebhooks: validatedData.permissions.canManageWebhooks ?? false,
      canViewAnalytics: validatedData.permissions.canViewAnalytics ?? true,
      canManageBilling: false, // Always false (reserved for OWNER)
      canDeleteProject: false, // Always false (reserved for OWNER)
      isOwner: false,
      isDefault: false,
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/roles`);
  return role;
};

/**
 * Updates a role (name and/or permissions)
 */
export const updateProjectRole = async (
  projectId: string,
  roleId: string,
  input: {
    name?: string;
    permissions?: {
      canManageProject?: boolean;
      canManageMembers?: boolean;
      canManageRoles?: boolean;
      canManageArticles?: boolean;
      canManageApiKeys?: boolean;
      canManageWebhooks?: boolean;
      canViewAnalytics?: boolean;
    };
  }
) => {
  await requirePermission(projectId, "canManageRoles");

  // Validate input
  const validatedData = updateRoleSchema.parse(input);

  const role = await prisma.projectRole.findUnique({
    where: { id: roleId },
  });

  if (!role || role.projectId !== projectId) {
    throw new Error("Role not found");
  }

  // Cannot modify OWNER role
  if (role.isOwner) {
    throw new Error("Cannot modify the OWNER role");
  }

  // Build update data
  const updateData: {
    name?: string;
    canManageProject?: boolean;
    canManageMembers?: boolean;
    canManageRoles?: boolean;
    canManageArticles?: boolean;
    canManageApiKeys?: boolean;
    canManageWebhooks?: boolean;
    canViewAnalytics?: boolean;
  } = {};

  if (validatedData.name !== undefined) {
    updateData.name = validatedData.name;
  }

  if (validatedData.permissions) {
    if (validatedData.permissions.canManageProject !== undefined) {
      updateData.canManageProject = validatedData.permissions.canManageProject;
    }

    if (validatedData.permissions.canManageMembers !== undefined) {
      updateData.canManageMembers = validatedData.permissions.canManageMembers;
    }

    if (validatedData.permissions.canManageRoles !== undefined) {
      updateData.canManageRoles = validatedData.permissions.canManageRoles;
    }

    if (validatedData.permissions.canManageArticles !== undefined) {
      updateData.canManageArticles = validatedData.permissions.canManageArticles;
    }

    if (validatedData.permissions.canManageApiKeys !== undefined) {
      updateData.canManageApiKeys = validatedData.permissions.canManageApiKeys;
    }

    if (validatedData.permissions.canManageWebhooks !== undefined) {
      updateData.canManageWebhooks = validatedData.permissions.canManageWebhooks;
    }

    if (validatedData.permissions.canViewAnalytics !== undefined) {
      updateData.canViewAnalytics = validatedData.permissions.canViewAnalytics;
    }
  }

  // canManageBilling and canDeleteProject cannot be modified (always reserved for OWNER)
  const updatedRole = await prisma.projectRole.update({
    where: { id: roleId },
    data: updateData,
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/roles`);
  return updatedRole;
};

/**
 * Deletes a custom role
 */
export const deleteProjectRole = async (projectId: string, roleId: string) => {
  await requirePermission(projectId, "canManageRoles");

  const role = await prisma.projectRole.findUnique({
    where: { id: roleId },
    include: {
      members: true,
    },
  });

  if (!role || role.projectId !== projectId) {
    throw new Error("Role not found");
  }

  // Cannot delete OWNER role
  if (role.isOwner) {
    throw new Error("Cannot delete the OWNER role");
  }

  // Cannot delete default roles
  if (role.isDefault) {
    throw new Error(
      "Cannot delete default roles. You can only modify their name and permissions."
    );
  }

  // Cannot delete role if members are assigned to it
  if (role.members.length > 0) {
    throw new Error(
      `Cannot delete this role because ${role.members.length} member${role.members.length > 1 ? "s are" : " is"} currently assigned to it. Reassign them first.`
    );
  }

  await prisma.projectRole.delete({
    where: { id: roleId },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/roles`);
};

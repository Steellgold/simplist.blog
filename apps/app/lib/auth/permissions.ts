"use server";

import type { ProjectMember, ProjectRole } from "@simplist/db";
import { prisma } from "@simplist/db";
import { forbidden, redirect } from "next/navigation";
import { getCurrentUser } from "../auth-helper";

/**
 * Type for available permissions on a role
 */
export type RolePermission = keyof Pick<
  ProjectRole,
  | "canManageProject"
  | "canManageMembers"
  | "canManageRoles"
  | "canManageArticles"
  | "canManageTags"
  | "canManageApiKeys"
  | "canManageWebhooks"
  | "canViewAnalytics"
  | "canManageBilling"
  | "canDeleteProject"
>;

/**
 * Extended type for membership with role included
 */
export type MembershipWithRole = ProjectMember & {
  role: ProjectRole;
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    subscriptionExpiresAt: Date | null;
  };
};

/**
 * Gets user's membership and role for a project
 * @param projectId - Project ID
 * @param userId - User ID
 * @returns Membership with role or null if not a member
 */
export const getUserProjectMembership = async (
  projectId: string,
  userId: string,
): Promise<MembershipWithRole | null> => {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    include: {
      role: true,
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionTier: true,
          subscriptionExpiresAt: true,
        },
      },
    },
  });

  if (!membership) return null;
  if (!membership.joinedAt) return null; // Invitation not accepted

  return membership as MembershipWithRole;
};

/**
 * Requires a permission or throws forbidden()
 * Use in ALL server actions that require authorization
 * @param projectId - Project ID
 * @param permission - Required permission
 * @returns User, role, and membership
 */
export const requirePermission = async (
  projectId: string,
  permission: RolePermission,
) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const membership = await getUserProjectMembership(projectId, user.id);

  if (!membership) {
    forbidden(); // Not a project member
  }

  const hasPermission = membership.role[permission] === true;

  if (!hasPermission) {
    forbidden(); // Insufficient permission
  }

  return {
    user,
    role: membership.role,
    membership,
  };
};

/**
 * Gets all projects where user is a member
 * @param userId - User ID
 * @returns List of projects with user's role
 */
export const getUserProjectsAsMember = async (userId: string) => {
  const memberships = await prisma.projectMember.findMany({
    where: {
      userId,
      joinedAt: { not: null }, // Only accepted invitations
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
    memberSince: m.joinedAt,
    isOwner: m.role.isOwner,
  }));
};

/**
 * Checks if user is the project OWNER (phantom role)
 * @param projectId - Project ID
 * @param userId - User ID
 * @returns true if user is OWNER
 */
export const isProjectOwner = async (
  projectId: string,
  userId: string,
): Promise<boolean> => {
  const membership = await getUserProjectMembership(projectId, userId);
  if (!membership) return false;
  return membership.role.isOwner === true;
};

/**
 * Gets project roles
 * @param projectId - Project ID
 * @param includeOwner - Include OWNER role (default false)
 * @returns List of project roles
 */
export const getProjectRoles = async (
  projectId: string,
  includeOwner = false,
) => {
  const roles = await prisma.projectRole.findMany({
    where: {
      projectId,
      ...(includeOwner ? {} : { isOwner: false }),
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return roles;
};

/**
 * Checks if user has access to a project (either as owner or member)
 * @param projectId - Project ID
 * @param userId - User ID
 * @returns true if user has access, false otherwise
 */
export const hasProjectAccess = async (
  projectId: string,
  userId: string,
): Promise<boolean> => {
  const membership = await getUserProjectMembership(projectId, userId);
  return membership !== null;
};

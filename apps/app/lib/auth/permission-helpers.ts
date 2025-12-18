import type { ProjectRole } from "@simplist/db";
import type { RolePermission } from "./permissions";

/**
 * Checks if a role has a specific permission
 * @param role - The role to check
 * @param permission - The required permission
 * @returns true if the role has the permission
 */
export const hasPermission = (
  role: ProjectRole | null,
  permission: RolePermission,
): boolean => {
  if (!role) return false;
  return role[permission] === true;
};

/** Helper: Check if user can manage project (settings, etc.) */
export const canManageProject = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageProject");
};

/** Helper: Check if user can manage members */
export const canManageMembers = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageMembers");
};

/** Helper: Check if user can manage roles and permissions */
export const canManageRoles = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageRoles");
};

/** Helper: Check if user can manage articles */
export const canManageArticles = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageArticles");
};

/** Helper: Check if user can manage tags */
export const canManageTags = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageTags");
};

/** Helper: Check if user can manage API keys */
export const canManageApiKeys = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageApiKeys");
};

/** * Helper: Check if user can manage webhooks */
export const canManageWebhooks = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageWebhooks");
};

/** Helper: Check if user can view analytics */
export const canViewAnalytics = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canViewAnalytics");
};

/** Helper: Check if user can manage billing (OWNER only) */
export const canManageBilling = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canManageBilling");
};

/** Helper: Check if user can delete project (OWNER only) */
export const canDeleteProject = (role: ProjectRole | null): boolean => {
  return hasPermission(role, "canDeleteProject");
};

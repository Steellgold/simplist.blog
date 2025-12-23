import type { ProjectRole, ProjectInvitation } from "@simplist/db";

/**
 * Re-export Prisma types for roles and invitations
 */
export type { ProjectRole, ProjectInvitation };

/**
 * Role type used in client components
 */
export type RoleListItem = ProjectRole;

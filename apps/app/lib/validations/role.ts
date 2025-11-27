import { z } from "zod";

/**
 * Schema for the permissions of a role
 */
export const rolePermissionsSchema = z.object({
  canManageProject: z.boolean().optional(),
  canManageMembers: z.boolean().optional(),
  canManageRoles: z.boolean().optional(),
  canManageArticles: z.boolean().optional(),
  canManageApiKeys: z.boolean().optional(),
  canViewAnalytics: z.boolean().optional(),
  // canManageBilling and canDeleteProject are reserved for the OWNER
  // and cannot be modified via the UI
});

export type RolePermissionsInput = z.infer<typeof rolePermissionsSchema>;

/**
 * Schema for creating a custom role
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot be longer than 50 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug cannot be longer than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and dashes"
    ),
  permissions: rolePermissionsSchema,
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

/**
 * Schema for updating a role
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot be longer than 50 characters")
    .optional(),
  permissions: rolePermissionsSchema.optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

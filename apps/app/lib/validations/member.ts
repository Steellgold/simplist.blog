import { z } from "zod";

/**
 * Schema for inviting a member
 */
export const inviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/**
 * Schema for updating a member's role
 */
export const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  roleId: z.string().min(1),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

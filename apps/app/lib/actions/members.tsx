"use server";

import { prisma } from "@simplist/db";
import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import { getCurrentUser } from "../auth-helper";
import { requirePermission, isProjectOwner } from "../auth/permissions";
import { inviteMemberSchema } from "../validations/member";
import { ProjectInvitation } from "@/components/emails";
import { render } from "@react-email/render";
import { sendEmail } from "../ses";
import crypto from "crypto";

/**
 * Gets all members of a project
 */
export const getProjectMembers = async (projectId: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Check if user is a member of the project (any role can see members)
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (!membership || !membership.joinedAt) forbidden();

  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
      joinedAt: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      role: true,
    },
    orderBy: [{ role: { isOwner: "desc" } }, { joinedAt: "asc" }],
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
};

/**
 * Gets pending invitations for a project
 */
export const getProjectInvitations = async (projectId: string) => {
  await requirePermission(projectId, "canManageMembers");

  const invitations = await prisma.projectInvitation.findMany({
    where: {
      projectId,
      status: "PENDING",
    },
    orderBy: {
      invitedAt: "desc",
    },
  });

  return invitations;
};

/**
 * Invites a member to join the project
 */
export const inviteProjectMember = async (
  projectId: string,
  input: { email: string; roleId: string }
) => {
  const { user, membership } = await requirePermission(
    projectId,
    "canManageMembers"
  );

  // Validate input
  const validatedData = inviteMemberSchema.parse(input);

  // Check if email is already a member
  const existingMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      user: {
        email: validatedData.email,
      },
    },
  });

  if (existingMember) {
    throw new Error("This user is already a member of the project");
  }

  // Check if there's already a pending invitation
  const existingInvitation = await prisma.projectInvitation.findFirst({
    where: {
      email: validatedData.email,
      projectId,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    throw new Error(
      "An invitation has already been sent to this email address"
    );
  }

  // Check member quota based on subscription
  const project = membership.project;
  const isPro =
    project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    project.subscriptionExpiresAt > new Date();

  const currentMemberCount = await prisma.projectMember.count({
    where: {
      projectId,
      joinedAt: { not: null },
    },
  });

  const maxMembers = isPro ? 10 : 1;

  if (currentMemberCount >= maxMembers) {
    throw new Error(
      `Member limit reached. Your ${project.subscriptionTier} plan allows up to ${maxMembers} member${maxMembers > 1 ? "s" : ""}.`
    );
  }

  // Verify that the role exists and is not the OWNER role
  const role = await prisma.projectRole.findUnique({
    where: {
      id: validatedData.roleId,
    },
  });

  if (!role || role.projectId !== projectId) {
    throw new Error("Invalid role");
  }

  if (role.isOwner) {
    throw new Error("Cannot invite a member with the OWNER role");
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create invitation
  const invitation = await prisma.projectInvitation.create({
    data: {
      email: validatedData.email,
      projectId,
      roleId: validatedData.roleId,
      token,
      expiresAt,
      invitedBy: user.id,
      status: "PENDING",
    },
  });

  // Send invitation email
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invitations/${token}`;

  try {
    const emailHtml = await render(
      <ProjectInvitation
        email={validatedData.email}
        projectName={project.name}
        inviterName={user.name}
        roleName={role.name}
        invitationUrl={invitationUrl}
      />
    );

    await sendEmail({
      to: validatedData.email,
      subject: `${user.name} invited you to join "${project.name}" on Simplist`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // Delete the invitation if email fails
    await prisma.projectInvitation.delete({
      where: { id: invitation.id },
    });
    throw new Error("Failed to send invitation email. Please try again.");
  }

  revalidatePath(`/${project.slug}/settings/members`);
  return invitation;
};

/**
 * Gets invitation details without accepting it
 */
export const getInvitationDetails = async (token: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?redirect=/invitations/${token}`);
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("This invitation has already been used or expired");
  }

  if (invitation.expiresAt < new Date()) {
    // Update invitation status to EXPIRED
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("This invitation has expired");
  }

  if (invitation.email !== user.email) {
    throw new Error("This invitation is for a different email address");
  }

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: invitation.projectId,
      },
    },
  });

  if (existingMember) {
    throw new Error("You are already a member of this project");
  }

  // Fetch related data separately
  const [project, role, inviter] = await Promise.all([
    prisma.project.findUnique({
      where: { id: invitation.projectId },
      select: { name: true, slug: true, icon: true },
    }),
    prisma.projectRole.findUnique({
      where: { id: invitation.roleId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: invitation.invitedBy },
      select: { name: true, image: true },
    }),
  ]);

  if (!project || !role || !inviter) {
    throw new Error("Invitation data is incomplete");
  }

  return {
    projectName: project.name,
    projectSlug: project.slug,
    projectIcon: project.icon,
    roleName: role.name,
    inviterName: inviter.name,
    inviterImage: inviter.image,
    invitedUserName: user.name,
    invitedUserImage: user.image,
    expiresAt: invitation.expiresAt,
  };
};

/**
 * Accepts an invitation to join a project
 */
export const acceptProjectInvitation = async (token: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?redirect=/invitations/${token}`);
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: { token },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("This invitation has already been used or expired");
  }

  if (invitation.expiresAt < new Date()) {
    // Update invitation status to EXPIRED
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("This invitation has expired");
  }

  if (invitation.email !== user.email) {
    throw new Error("This invitation is for a different email address");
  }

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: invitation.projectId,
      },
    },
  });

  if (existingMember) {
    throw new Error("You are already a member of this project");
  }

  // First, set any other invitations for this email+project to DECLINED to avoid unique constraint violations
  await prisma.projectInvitation.updateMany({
    where: {
      email: user.email,
      projectId: invitation.projectId,
      id: { not: invitation.id },
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    data: {
      status: "DECLINED",
    },
  });

  // Create membership and update invitation in a transaction
  await prisma.$transaction([
    prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: invitation.projectId,
        roleId: invitation.roleId,
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
      },
    }),
    prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/");
  return { projectSlug: invitation.project.slug };
};

/**
 * Updates a member's role
 */
export const updateMemberRole = async (
  projectId: string,
  memberId: string,
  newRoleId: string
) => {
  await requirePermission(projectId, "canManageMembers");

  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: { role: true },
  });

  if (!member || member.projectId !== projectId) {
    throw new Error("Member not found");
  }

  // Cannot change the role of the OWNER
  if (member.role.isOwner) {
    throw new Error(
      "Cannot change the role of the project owner. Transfer ownership first."
    );
  }

  // Verify new role exists and is not OWNER
  const newRole = await prisma.projectRole.findUnique({
    where: { id: newRoleId },
  });

  if (!newRole || newRole.projectId !== projectId) {
    throw new Error("Invalid role");
  }

  if (newRole.isOwner) {
    throw new Error("Cannot assign OWNER role. Use transfer ownership instead.");
  }

  await prisma.projectMember.update({
    where: { id: memberId },
    data: { roleId: newRoleId },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/members`);
};

/**
 * Removes a member from the project
 */
export const removeProjectMember = async (
  projectId: string,
  memberId: string
) => {
  await requirePermission(projectId, "canManageMembers");

  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: { role: true },
  });

  if (!member || member.projectId !== projectId) {
    throw new Error("Member not found");
  }

  // Cannot remove the OWNER
  if (member.role.isOwner) {
    throw new Error("Cannot remove the project owner");
  }

  await prisma.projectMember.delete({
    where: { id: memberId },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/members`);
};

/**
 * Leaves a project (self-service)
 */
export const leaveProject = async (projectId: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
    include: { role: true },
  });

  if (!membership) {
    throw new Error("You are not a member of this project");
  }

  // OWNER cannot leave without transferring ownership
  if (membership.role.isOwner) {
    throw new Error(
      "As the project owner, you must transfer ownership before leaving"
    );
  }

  await prisma.projectMember.delete({
    where: { id: membership.id },
  });

  revalidatePath("/");
};

/**
 * Transfers project ownership to another member
 */
export const transferProjectOwnership = async (
  projectId: string,
  newOwnerId: string
) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Only OWNER can transfer ownership
  const isOwner = await isProjectOwner(projectId, user.id);
  if (!isOwner) {
    forbidden();
  }

  // Verify new owner is an existing member
  const newOwnerMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: newOwnerId,
        projectId,
      },
    },
    include: { role: true },
  });

  if (!newOwnerMembership || !newOwnerMembership.joinedAt) {
    throw new Error("The new owner must be an existing member of the project");
  }

  // Get current owner membership
  const currentOwnerMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (!currentOwnerMembership) {
    throw new Error("Current owner membership not found");
  }

  // Get OWNER and ADMIN roles
  const [ownerRole, adminRole] = await Promise.all([
    prisma.projectRole.findFirst({
      where: {
        projectId,
        isOwner: true,
      },
    }),
    prisma.projectRole.findFirst({
      where: {
        projectId,
        slug: "admin",
      },
    }),
  ]);

  if (!ownerRole || !adminRole) {
    throw new Error("Required roles not found");
  }

  // Transfer ownership in a transaction
  await prisma.$transaction([
    // Downgrade current owner to ADMIN
    prisma.projectMember.update({
      where: { id: currentOwnerMembership.id },
      data: { roleId: adminRole.id },
    }),

    // Upgrade new owner to OWNER
    prisma.projectMember.update({
      where: { id: newOwnerMembership.id },
      data: { roleId: ownerRole.id },
    }),

    // Update legacy userId field for backward compatibility
    prisma.project.update({
      where: { id: projectId },
      data: { userId: newOwnerId },
    }),
  ]);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/members`);
  revalidatePath("/");
};

/**
 * Revokes a pending invitation
 */
export const revokeProjectInvitation = async (
  projectId: string,
  invitationId: string
) => {
  await requirePermission(projectId, "canManageMembers");

  const invitation = await prisma.projectInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.projectId !== projectId) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Only pending invitations can be revoked");
  }

  await prisma.projectInvitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath(`/${project?.slug}/settings/members`);
};

/**
 * Declines an invitation to join a project
 */
export const declineProjectInvitation = async (token: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?redirect=/invitations/${token}`);
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: { token },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("This invitation has already been used or expired");
  }

  if (invitation.expiresAt < new Date()) {
    // Update invitation status to EXPIRED
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("This invitation has expired");
  }

  if (invitation.email !== user.email) {
    throw new Error("This invitation is for a different email address");
  }

  // Update invitation status to DECLINED
  await prisma.projectInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "DECLINED",
      acceptedAt: new Date(), // Track when it was declined
    },
  });

  revalidatePath("/");
  return { projectName: invitation.project.name };
};

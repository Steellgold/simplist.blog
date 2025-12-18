"use server"

import { AccountDeletionRequestedEmail } from "@/components/emails/account-deletion-requested"
import { getCurrentUser } from "@/lib/auth-helper"
import { RequestAccountDeletionInput, requestAccountDeletionSchema } from "@/lib/validations/user"
import { prisma } from "@simplist/db"
import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { sendEmail } from "../ses"

const DELETION_GRACE_DAYS = 14

const addDays = (date: Date, days: number) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

const buildUserName = (user: { firstName?: string | null; lastName?: string | null; email: string }) => {
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim()
  return name || user.email
}

export const findOwnedProjects = async (userId: string) => {
  const [projectOwners, ownerMemberships] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, slug: true },
    }),
    prisma.projectMember.findMany({
      where: {
        userId,
        role: {
          isOwner: true,
        },
      },
      select: {
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
  ])

  const memberships = ownerMemberships.map((m) => m.project)
  const merged = [...projectOwners, ...memberships]
  const uniqueById = new Map<string, typeof merged[number]>()
  merged.forEach((project) => uniqueById.set(project.id, project))
  return Array.from(uniqueById.values())
}

export const requestAccountDeletion = async (input: RequestAccountDeletionInput) => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const now = new Date()
  const parsedInput = requestAccountDeletionSchema.parse(input)

  if (user.deletionScheduledAt && new Date(user.deletionScheduledAt) > now) {
    throw new Error("An account deletion request is already scheduled")
  }

  const ownedProjects = await findOwnedProjects(user.id)
  if (ownedProjects.length > 0) {
    const projectNames = ownedProjects.map((p) => p.name).join(", ")
    throw new Error(
      `You are the owner of ${ownedProjects.length} project(s): ${projectNames}. Transfer ownership before deleting your account.`
    )
  }

  const scheduledAt = addDays(now, DELETION_GRACE_DAYS)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletionRequestedAt: now,
      deletionScheduledAt: scheduledAt,
      deletionCanceledAt: null,
      deletionReminder7Sent: false,
      deletionReminder10Sent: false,
      deletionReminder1hSent: false,
    },
  })

  const userName = buildUserName(user)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const manageUrl = `${appUrl}/account/settings/account`

  // TODO: Store the reason deletion for user experience feedback

  const html = await render(
    AccountDeletionRequestedEmail({
      name: userName,
      scheduledAt,
      manageUrl
    })
  )

  await sendEmail({
    to: user.email,
    subject: "Your Simplist account deletion request",
    html
  })

  revalidatePath("/account/settings/account", "page")
  revalidatePath("/account", "layout")

  return { scheduledAt }
}

export const cancelAccountDeletion = async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletionRequestedAt: null,
      deletionScheduledAt: null,
      deletionCanceledAt: new Date(),
      deletionReminder7Sent: false,
      deletionReminder10Sent: false,
      deletionReminder1hSent: false,
    },
  })

  revalidatePath("/account/settings/account", "page")
  revalidatePath("/account", "layout")

  return { cancelledAt: new Date() }
}
import { MembersClientPage } from "@/components/members/members-client-page"
import { getCurrentUser } from "@/lib/auth-helper"
import { getUserProjectMembership } from "@/lib/auth/permissions"
import { getProjectMembers, getProjectInvitations } from "@/lib/actions/members"
import { getProjectRoles } from "@/lib/actions/roles"
import { prisma } from "@simplist/db"
import { redirect } from "next/navigation"

const MembersPage = async ({ params }: { params: Promise<{ "project-slug": string }> }) => {
  const resolvedParams = await params
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  // Get project by slug
  const project = await prisma.project.findUnique({
    where: {
      slug: resolvedParams["project-slug"],
    },
  })

  if (!project) redirect("/create-project")

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id)
  if (!membership) redirect("/create-project")

  // Fetch data in parallel
  const [members, invitations, roles] = await Promise.all([
    getProjectMembers(project.id),
    getProjectInvitations(project.id),
    getProjectRoles(project.id)
  ])

  return (
    <MembersClientPage
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        subscriptionTier: project.subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      }}
      currentMember={{
        id: membership.id,
        roleId: membership.roleId,
        isOwner: membership.role.isOwner,
      }}
      members={members}
      invitations={invitations}
      roles={roles}
    />
  )
}

export default MembersPage

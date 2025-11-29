import { BillingClientPage } from "@/components/billing/billing-client-page"
import { getCurrentUser } from "@/lib/auth-helper"
import { getUserProjectMembership } from "@/lib/auth/permissions"
import { getProjectBillingHistory, getProjectSubscription } from "@/lib/stripe/actions"
import { prisma, SubscriptionTier } from "@simplist/db"
import { redirect } from "next/navigation"

const BillingPage = async ({ params }: { params: Promise<{ "project-slug": string }> }) => {
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
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) redirect("/create-project")

  // Fetch billing data in parallel
  const [billingEntries, subscriptionInfo] = await Promise.all([
    getProjectBillingHistory(project.id),
    getProjectSubscription(project.id),
  ])

  return (
    <BillingClientPage
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        subscriptionTier: project.subscriptionTier || SubscriptionTier.STARTER,
      }}
      billingEntries={billingEntries}
      subscriptionInfo={subscriptionInfo}
    />
  )
}

export default BillingPage

import { BillingClientPage } from "@/components/billing/billing-client-page"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma, SubscriptionTier } from "@simplist/db"
import { getProjectBillingHistory, getProjectSubscription } from "@/lib/stripe/actions"
import { redirect } from "next/navigation"

const BillingPage = async ({ params }: { params: Promise<{ "project-slug": string }> }) => {
  const resolvedParams = await params
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  // Get user's project
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
      slug: resolvedParams."project-slug",
    },
  })

  if (!project) redirect("/create-project")

  // Fetch billing data in parallel
  const [billingEntries, subscriptionInfo] = await Promise.all([
    getProjectBillingHistory(project.id), // Commented out for testing
    // Promise.resolve(fakeBillingEntries),
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

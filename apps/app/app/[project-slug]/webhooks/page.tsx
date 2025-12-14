import { WebhooksClientPage } from "@/components/webhooks/webhooks-client-page"
import { getProjectWebhooks } from "@/lib/actions/webhooks"
import { getCurrentUser } from "@/lib/auth-helper"
import { getUserProjectMembership } from "@/lib/auth/permissions"
import { prisma } from "@simplist/db"
import { getPlanLimits, type PlanId } from "@simplist/limits"
import { redirect } from "next/navigation"
import { FC } from "react"

type PageParams = {
  params: Promise<{
    "project-slug": string
  }>
}

const WebhooksPage: FC<PageParams> = async ({ params }) => {
  const { "project-slug": projectSlug } = await params
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  const project = await prisma.project.findUnique({ where: { slug: projectSlug } })

  if (!project) redirect("/create-project")

  const membership = await getUserProjectMembership(project.id, user.id)
  if (!membership) redirect("/create-project")

  const webhooks = (await getProjectWebhooks(project.id)).map((webhook) => ({
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    events: webhook.events,
    status: webhook.status,
    secret: webhook.secret,
    headers: webhook.headers as Record<string, string>,
    failureCount: webhook.failureCount,
    lastSentAt: webhook.lastSentAt,
    createdAt: webhook.createdAt,
    projectId: webhook.projectId
  }))

  const planLimits = getPlanLimits(project.subscriptionTier as PlanId)

  return (
    <WebhooksClientPage
      webhooks={webhooks}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        subscriptionTier: project.subscriptionTier,
      }}
      maxWebhooks={planLimits.maxWebhooks}
    />
  )
}

export default WebhooksPage
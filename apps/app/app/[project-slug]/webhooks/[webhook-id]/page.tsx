import { WebhookDashboardPage } from "@/components/webhooks/webhook-dashboard-page"
import { getWebhookDeliveries } from "@/lib/actions/webhooks"
import { getCurrentUser } from "@/lib/auth-helper"
import { requirePermission } from "@/lib/auth/permissions"
import { prisma } from "@simplist/db"
import { notFound, redirect } from "next/navigation"
import { FC } from "react"

type PageParams = {
  params: Promise<{
    "project-slug": string
    "webhook-id": string
  }>
}

const WebhookDetailPage: FC<PageParams> = async ({ params }) => {
  const { "project-slug": projectSlug, "webhook-id": webhookId } = await params

  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, slug: true, name: true },
  })

  if (!project) {
    redirect("/")
  }

  await requirePermission(project.id, "canManageWebhooks")

  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: {
      id: true,
      name: true,
      url: true,
      events: true,
      status: true,
      secret: true,
      headers: true,
      customPayload: true,
      templateId: true,
      projectId: true,
      failureCount: true,
      lastSentAt: true,
      createdAt: true,
    },
  })

  if (!webhook || webhook.projectId !== project.id) {
    notFound()
  }

  const { deliveries, total } = await getWebhookDeliveries(webhookId, {
    limit: 10,
    offset: 0,
  })

  return (
    <WebhookDashboardPage
      webhook={{
        ...webhook,
        headers: webhook.headers as Record<string, string> | null,
        customPayload: webhook.customPayload,
        templateId: webhook.templateId,
        projectId: project.id
      }}
      projectSlug={project.slug}
      initialDeliveries={deliveries.map((d) => ({
        id: d.id,
        status: d.status,
        statusCode: d.statusCode,
        error: d.error,
        response: d.response,
        attemptedAt: d.attemptedAt,
      }))}
      initialTotal={total}
    />
  )
}

export default WebhookDetailPage
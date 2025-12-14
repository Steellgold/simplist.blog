import { PageLayout } from "@/components/layout/page-layout"
import { WebhookForm } from "@/components/webhooks/form"
import { WebhookFormActions } from "@/components/webhooks/form/form-actions"
import { WebhookFormProvider } from "@/components/webhooks/form/form-context"
import { getCurrentUser } from "@/lib/auth-helper"
import { requirePermission } from "@/lib/auth/permissions"
import { checkFeatureAccess, checkWebhookQuota } from "@/lib/subscription/quota-check"
import { prisma } from "@simplist/db"
import { redirect } from "next/navigation"
import { FC } from "react"

type PageParams = {
  params: Promise<{
    "project-slug": string
  }>
}

const NewWebhookPage: FC<PageParams> = async ({ params }) => {
  const { "project-slug": projectSlug } = await params

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

  // Feature gate
  const hasFeature = await checkFeatureAccess(user.id, project.id, "webhooks")
  if (!hasFeature) {
    redirect(`/${projectSlug}/webhooks`)
  }

  // Quota check
  const quota = await checkWebhookQuota(project.id)
  if (!quota.allowed) {
    redirect(`/${projectSlug}/webhooks`)
  }

  return (
    <WebhookFormProvider>
      <PageLayout
        title="Create webhook"
        description="Configure a new webhook to receive real-time notifications."
        centered="md"
        actions={
          <WebhookFormActions
            mode="create"
            formId="webhook-form-create"
          />
        }
      >
        <WebhookForm
          projectId={project.id}
          projectSlug={project.slug}
          mode="create"
        />
      </PageLayout>
    </WebhookFormProvider>
  )
}

export default NewWebhookPage
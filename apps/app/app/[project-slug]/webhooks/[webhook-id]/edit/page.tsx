import { PageLayout } from "@/components/layout/page-layout";
import { WebhookForm } from "@/components/webhooks/form";
import { WebhookFormActions } from "@/components/webhooks/form/form-actions";
import { WebhookFormProvider } from "@/components/webhooks/form/form-context";
import { getCurrentUser } from "@/lib/auth-helper";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@simplist/db";
import { notFound, redirect } from "next/navigation";
import { FC } from "react";

type PageParams = {
  params: Promise<{
    "project-slug": string;
    "webhook-id": string;
  }>;
};

const EditWebhookPage: FC<PageParams> = async ({ params }) => {
  const { "project-slug": projectSlug, "webhook-id": webhookId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!project) {
    redirect("/");
  }

  await requirePermission(project.id, "canManageWebhooks");

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
    },
  });

  if (!webhook || webhook.projectId !== project.id) {
    notFound();
  }

  return (
    <WebhookFormProvider>
      <PageLayout
        title="Edit webhook"
        description={`Update the configuration for "${webhook.name}" webhook.`}
        centered="md"
        actions={<WebhookFormActions mode="edit" formId="webhook-form-edit" />}
      >
        <WebhookForm
          projectId={project.id}
          projectSlug={project.slug}
          webhook={{
            ...webhook,
            headers: webhook.headers as Record<string, string> | null,
            customPayload: webhook.customPayload,
            templateId: webhook.templateId,
          }}
          mode="edit"
        />
      </PageLayout>
    </WebhookFormProvider>
  );
};

export default EditWebhookPage;

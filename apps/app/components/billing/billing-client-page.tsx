"use client";

import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { InvoicesCard } from "@/components/billing/invoices-card";
import { PageLayout } from "@/components/layout/page-layout";
import type { BillingEntry, SubscriptionInfo } from "@/lib/stripe/types";
import type { SubscriptionTier } from "@simplist/db/types";

type BillingClientPageProps = {
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: SubscriptionTier;
  };
  billingEntries: BillingEntry[];
  subscriptionInfo: SubscriptionInfo | null;
};

export const BillingClientPage = ({
  project,
  billingEntries,
}: BillingClientPageProps) => {
  return (
    <PageLayout
      title="Billing"
      description={`Manage billing and subscription for ${project.name}`}
      centered="sm"
    >
      <CurrentPlanCard
        projectId={project.id}
        projectName={project.name}
        subscriptionTier={project.subscriptionTier}
      />

      <InvoicesCard billingEntries={billingEntries} />
    </PageLayout>
  );
};

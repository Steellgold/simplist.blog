"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyProject } from "@/components/projects/empty-project";
import { useProject } from "@/hooks/use-project-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { getDashboardData, type DashboardData } from "@/lib/actions/dashboard";
import { getPlanLimits } from "@/lib/subscription/plans";
import { toast } from "sonner";
import { WelcomeEmpty } from "@/components/dashboard/welcome-empty";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentArticlesCard } from "@/components/dashboard/recent-articles-card";
import { AnalyticsPreviewCard } from "@/components/dashboard/analytics-preview-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import DashboardLoading from "./loading";

const ProjectPage = () => {
  const { currentProject } = useProject();
  const { limits } = useSubscriptionLimits(currentProject?.id);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentProject?.id) return;

      setIsLoading(true);
      const result = await getDashboardData(currentProject.id);

      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.error);
      }
      setIsLoading(false);
    };

    loadDashboardData();
  }, [currentProject?.id]);

  if (!currentProject) return <EmptyProject />;
  if (isLoading || !dashboardData) return <DashboardLoading />;

  const planLimits = limits || getPlanLimits(dashboardData.project.subscriptionTier);
  const isPro = dashboardData.project.subscriptionTier === "PRO";

  // Show welcome screen if no articles
  if (dashboardData.articles.total === 0) {
    return (
      <WelcomeEmpty
        projectSlug={currentProject.slug}
        subscriptionTier={dashboardData.project.subscriptionTier}
      />
    );
  }

  return (
    <PageLayout
      title="Dashboard"
      description={`Welcome to your ${currentProject.name} blog management dashboard`}
    >
      <div className="space-y-4">
        <StatsGrid
          publishedArticles={dashboardData.articles.published}
          totalViews={dashboardData.analytics.totalViews}
          activeApiKeys={dashboardData.apiKeys.active}
          apiKeyLimit={planLimits.maxApiKeys}
          storageUsed={dashboardData.project.totalStorageUsed}
          storageLimit={planLimits.maxStorageBytes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentArticlesCard
            articles={dashboardData.articles.recent}
            projectSlug={currentProject.slug}
          />

          <AnalyticsPreviewCard
            todayViews={dashboardData.analytics.todayViews}
            todayUniqueVisitors={dashboardData.analytics.todayUniqueVisitors}
            averageBounceRate={dashboardData.analytics.averageBounceRate}
            projectSlug={currentProject.slug}
            isPro={isPro}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickActionsCard
            projectSlug={currentProject.slug}
            articlesUsed={dashboardData.articles.total}
            articlesLimit={planLimits.maxArticles}
            apiKeysUsed={dashboardData.apiKeys.active}
            apiKeysLimit={planLimits.maxApiKeys}
          />

          <SubscriptionCard
            projectId={currentProject.id}
            subscriptionTier={dashboardData.project.subscriptionTier}
            monthlyApiCalls={dashboardData.project.monthlyApiCalls}
            apiCallsLimit={planLimits.maxApiCallsPerMonth}
            apiCallsResetAt={dashboardData.project.apiCallsResetAt}
            subscriptionExpiresAt={dashboardData.project.subscriptionExpiresAt}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectPage;

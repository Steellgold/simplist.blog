"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helper";
import { notFound, unauthorized } from "next/navigation";

export interface DashboardData {
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: "STARTER" | "PRO";
    analyticsEnabled: boolean;
    monthlyApiCalls: number;
    apiCallsResetAt: Date;
    subscriptionExpiresAt: Date | null;
    totalStorageUsed: number;
  };
  articles: {
    total: number;
    published: number;
    recent: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
      updatedAt: Date;
    }>;
  };
  apiKeys: {
    active: number;
  };
  analytics: {
    totalViews: number;
    todayViews: number;
    todayUniqueVisitors: number;
    averageBounceRate: number;
  };
}

export const getDashboardData = async (
  projectId: string
): Promise<{ success: true; data: DashboardData } | { success: false; error: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) unauthorized();

    // Fetch project with ownership verification
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionTier: true,
        analyticsEnabled: true,
        monthlyApiCalls: true,
        apiCallsResetAt: true,
        subscriptionExpiresAt: true,
        totalStorageUsed: true,
      },
    });

    if (!project) return notFound();

    // Fetch articles data
    const [totalArticles, publishedArticles, recentArticles] = await Promise.all([
      prisma.article.count({
        where: {
          projectId,
          status: { not: "deleted" },
        },
      }),
      prisma.article.count({
        where: {
          projectId,
          status: "published",
        },
      }),
      prisma.article.findMany({
        where: {
          projectId,
          status: { not: "deleted" },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
    ]);

    // Fetch active API keys count
    const activeApiKeys = await prisma.apiKey.count({
      where: {
        projectId,
        status: "active",
        deletedAt: null,
      },
    });

    // Fetch analytics data if enabled
    let analyticsData = {
      totalViews: 0,
      todayViews: 0,
      todayUniqueVisitors: 0,
      averageBounceRate: 0,
    };

    if (project.analyticsEnabled) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalViews, todayStats, bouncedCount, totalCount] = await Promise.all([
        // Total views count
        prisma.pageView.count({
          where: {
            article: {
              projectId,
            },
          },
        }),
        // Today's views and unique visitors
        prisma.pageView.aggregate({
          where: {
            article: {
              projectId,
            },
            createdAt: {
              gte: today,
            },
          },
          _count: {
            id: true,
          },
        }),
        // Count bounced views
        prisma.pageView.count({
          where: {
            article: {
              projectId,
            },
            bounced: true,
          },
        }),
        // Total views for bounce rate calculation
        prisma.pageView.count({
          where: {
            article: {
              projectId,
            },
          },
        }),
      ]);

      // Count unique visitors today
      const uniqueVisitorsToday = await prisma.pageView.findMany({
        where: {
          article: {
            projectId,
          },
          createdAt: {
            gte: today,
          },
        },
        distinct: ["visitorId"],
        select: {
          visitorId: true,
        },
      });

      // Calculate average bounce rate
      const averageBounceRate = totalCount > 0 ? (bouncedCount / totalCount) * 100 : 0;

      analyticsData = {
        totalViews,
        todayViews: todayStats._count.id,
        todayUniqueVisitors: uniqueVisitorsToday.length,
        averageBounceRate,
      };
    }

    return {
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          subscriptionTier: project.subscriptionTier as "STARTER" | "PRO",
          analyticsEnabled: project.analyticsEnabled,
          monthlyApiCalls: project.monthlyApiCalls,
          apiCallsResetAt: project.apiCallsResetAt,
          subscriptionExpiresAt: project.subscriptionExpiresAt,
          totalStorageUsed: project.totalStorageUsed,
        },
        articles: {
          total: totalArticles,
          published: publishedArticles,
          recent: recentArticles,
        },
        apiKeys: {
          active: activeApiKeys,
        },
        analytics: analyticsData,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: "Failed to load dashboard data" };
  }
};

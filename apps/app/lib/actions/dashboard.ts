"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@simplist/db";
import { notFound, unauthorized } from "next/navigation";

export interface DashboardData {
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: "STARTER" | "PRO";
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

    // Fetch analytics data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalViews, todayStats, bouncedCount] = await Promise.all([
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
    ]);

    // Count unique visitors today using aggregation instead of loading all records
    const uniqueVisitorsTodayCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "visitorId") as count
      FROM "page_view" pv
      INNER JOIN "article" a ON pv."articleId" = a.id
      WHERE a."projectId" = ${projectId}
      AND pv."createdAt" >= ${today}
    `.then((result: { count: any; }[]) => Number(result[0]?.count ?? 0));

    // Calculate average bounce rate
    const averageBounceRate = totalViews > 0 ? (bouncedCount / totalViews) * 100 : 0;

    const analyticsData = {
      totalViews,
      todayViews: todayStats._count.id,
      todayUniqueVisitors: uniqueVisitorsTodayCount,
      averageBounceRate,
    };

    return {
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          subscriptionTier: project.subscriptionTier as "STARTER" | "PRO",
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

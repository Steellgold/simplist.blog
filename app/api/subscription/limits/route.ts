import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Get project subscription data
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        apiKeys: {
          where: {
            deletedAt: null, // Only count active API keys
          },
          select: {
            id: true,
          },
        },
        articles: {
          where: {
            status: { not: "deleted" }, // Only count non-deleted articles
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Count API keys and articles for this project
    const apiKeyCount = project.apiKeys.length;
    const articleCount = project.articles.length;

    // Determine subscription tier (default to free if null)
    const subscriptionTier = project.subscriptionTier || "STARTER";

    return NextResponse.json({
      subscription: {
        tier: subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      },
      apiKeyCount,
      articleCount,
    });
  } catch (error) {
    console.error("Error fetching subscription limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
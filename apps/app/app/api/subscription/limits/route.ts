import { getCurrentUser } from "@/lib/auth-helper";
import { prisma, subscriptionCache } from "@simplist/db";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // Try to get from cache first
    const cached = await subscriptionCache.get(projectId);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get project with article count and verify access in a single query
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: currentUser.id },
          { members: { some: { userId: currentUser.id } } },
        ],
      },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        _count: {
          select: {
            articles: {
              where: {
                status: { not: "deleted" },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const articleCount = project._count.articles;

    // Determine subscription tier (default to free if null)
    const subscriptionTier = project.subscriptionTier || "STARTER";

    const responseData = {
      subscription: {
        tier: subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      },
      articleCount,
    };

    // Cache the result
    await subscriptionCache.set(projectId, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching subscription limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

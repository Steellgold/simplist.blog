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
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [apiKeyCount, articleCount] = await Promise.all([
      prisma.apiKey.count({
        where: {
          projectId: project.id,
          deletedAt: null,
        },
      }),
      prisma.article.count({
        where: {
          projectId: project.id,
          status: { not: "deleted" },
        },
      }),
    ]);

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
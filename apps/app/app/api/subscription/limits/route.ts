import { getCurrentUser } from "@/lib/auth-helper";
import { hasProjectAccess } from "@/lib/auth/permissions";
import { prisma } from "@simplist/db";
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

    // Verify user has access to this project (either as owner or member)
    const hasAccess = await hasProjectAccess(projectId, currentUser.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get project subscription data
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
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

    const articleCount = await prisma.article.count({
      where: {
        projectId: project.id,
        status: { not: "deleted" },
      },
    });

    // Determine subscription tier (default to free if null)
    const subscriptionTier = project.subscriptionTier || "STARTER";

    return NextResponse.json({
      subscription: {
        tier: subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      },
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
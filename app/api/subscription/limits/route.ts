import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user subscription data
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        subscription: true,
        subscriptionExpiresAt: true,
        projects: {
          select: {
            id: true,
            apiKeys: {
              where: {
                deletedAt: null, // Only count active API keys
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count total API keys across all user projects
    const apiKeyCount = user.projects.reduce(
      (total, project) => total + project.apiKeys.length,
      0
    );

    // Determine subscription tier (default to free if null)
    const subscriptionTier = user.subscription || "free";

    return NextResponse.json({
      subscription: {
        tier: subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      },
      apiKeyCount,
    });
  } catch (error) {
    console.error("Error fetching subscription limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
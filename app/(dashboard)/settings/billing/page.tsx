import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { getUserSubscription } from "@/lib/subscription/quota-check";
import { SUBSCRIPTION_PRICING } from "@/lib/subscription/types";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BillingCard } from "@/components/billing-card";
import { UsageCard } from "@/components/usage-card";

export const metadata: Metadata = {
  title: "Billing & Subscription",
  robots: { index: false, follow: false },
};

const BillingPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's subscription info
  const subscription = await getUserSubscription(user.id);

  // If user doesn't have a pro subscription, redirect to pricing
  if (subscription.tier !== "pro") {
    redirect("/pricing");
  }

  // Get user's project
  const project = await prisma.project.findFirst({
    where: { userId: user.id },
  });

  // Get article count
  const articleCount = project
    ? await prisma.article.count({
        where: {
          projectId: project.id,
          status: { not: "deleted" },
        },
      })
    : 0;

  // Get API key count
  const apiKeyCount = project
    ? await prisma.apiKey.count({
        where: {
          projectId: project.id,
          status: "active",
        },
      })
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription plan and monitor your usage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BillingCard
          currentTier={subscription.tier}
          subscriptionExpiresAt={
            subscription.tier === "pro"
              ? await prisma.user
                  .findUnique({
                    where: { id: user.id },
                    select: { subscriptionExpiresAt: true },
                  })
                  .then((u) => u?.subscriptionExpiresAt || null)
              : null
          }
        />

        <UsageCard
          tier={subscription.tier}
          usage={{
            articles: {
              current: articleCount,
              limit: subscription.limits.maxArticles,
            },
            storage: {
              current: subscription.usage.storage,
              limit: subscription.limits.maxStorageBytes,
            },
            apiKeys: {
              current: apiKeyCount,
              limit: subscription.limits.maxApiKeys,
            },
            apiCalls: {
              current: subscription.usage.apiCalls,
              limit: subscription.limits.maxApiCallsPerMonth,
              resetDate: subscription.usage.apiCallsResetAt,
            },
          }}
        />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Plan Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                <th className="text-center py-3 px-4">Free</th>
                <th className="text-center py-3 px-4">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Projects</td>
                <td className="text-center py-3 px-4">1</td>
                <td className="text-center py-3 px-4">1</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Articles</td>
                <td className="text-center py-3 px-4">50</td>
                <td className="text-center py-3 px-4">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Storage</td>
                <td className="text-center py-3 px-4">500 MB</td>
                <td className="text-center py-3 px-4">10 GB</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">API Keys</td>
                <td className="text-center py-3 px-4">2</td>
                <td className="text-center py-3 px-4">10</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">API Calls / Month</td>
                <td className="text-center py-3 px-4">10,000</td>
                <td className="text-center py-3 px-4">500,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Analytics Dashboard</td>
                <td className="text-center py-3 px-4">✗</td>
                <td className="text-center py-3 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Bulk Operations</td>
                <td className="text-center py-3 px-4">✗</td>
                <td className="text-center py-3 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Export Data</td>
                <td className="text-center py-3 px-4">✗</td>
                <td className="text-center py-3 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Priority Support</td>
                <td className="text-center py-3 px-4">✗</td>
                <td className="text-center py-3 px-4">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Price</td>
                <td className="text-center py-3 px-4">Free</td>
                <td className="text-center py-3 px-4">
                  ${SUBSCRIPTION_PRICING.pro.monthly.amount}/mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

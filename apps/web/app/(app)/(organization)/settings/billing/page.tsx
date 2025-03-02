import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { auth } from "@/lib/auth";
import { forbidden } from "next/navigation";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { BillingCurrentPlanCard } from "./_components/current-plan.card";

const metadataSchema = z.object({
  plan: z.enum(["hobby", "pro", "business"]),
  startedAt: z.string(),
  endsAt: z.string(),
  subscriptionId: z.string(),
  checkoutId: z.string(),
  customerId: z.string(),
});

const OrganizationBilling = async(): Promise<ReactElement> => {
  const [organization] =
    await Promise.all([
      auth.api.getFullOrganization({ headers: await headers() })
    ]);

  if (!organization) {
    forbidden();
  }

  await checkPermission({
    organizationId: organization.id,
    permission: { settings: ["delete"] },
  });

  const metadata = metadataSchema.safeParse(JSON.parse(organization.metadata));
  if (!metadata.success) throw new Error("Invalid metadata");

  const subscription = await polar.subscriptions.get({ id: metadata.data.subscriptionId });
  if (!subscription) throw new Error("Subscription not found");

  return (
    <>
      <BreadcrumbSetter items={
        [
          { label: "Organization", href: "/" },
          { label: "Settings", href: "/settings" },
          { label: "Billing" }
        ]
      } />

      <div>
        <BillingCurrentPlanCard subscription={subscription} />
      </div>
    </>
  );
}

export default OrganizationBilling;
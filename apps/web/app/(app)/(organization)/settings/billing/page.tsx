import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { auth } from "@/lib/auth";
import { forbidden } from "next/navigation";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { BillingCurrentPlanCard } from "./_components/current-plan.card";
import { getPlanByName, parsePlanName } from "@/lib/pricing";

const OrganizationBilling = async(): Promise<ReactElement> => {
  const [organization] = await Promise.all([ auth.api.getFullOrganization({ headers: await headers() }) ]);

  if (!organization) forbidden();
  await checkPermission({ organizationId: organization.id,permission: { settings: ["delete"] } });

  const subscription = (await auth.api.listActiveSubscriptions({ headers: await headers(), query: { referenceId: organization.id } }))[0]
  if (!subscription || !subscription.stripeSubscriptionId) return <div>No subscriptions found</div>;

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
        <BillingCurrentPlanCard plan={getPlanByName(parsePlanName(subscription.plan))} subscription={subscription} />
      </div>
    </>
  );
}

export default OrganizationBilling;
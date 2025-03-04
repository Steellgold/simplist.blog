import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { auth, stripeClient } from "@/lib/auth";
import { forbidden, unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { BillingCurrentPlanCard } from "./_components/current-plan.card";
import { getPlanByName, parsePlanName } from "@/lib/pricing";
import { BillingInvoicesCard } from "./_components/invoices.card";

const OrganizationBilling = async(): Promise<ReactElement> => {
  const [organization, session] = await Promise.all([
    auth.api.getFullOrganization({ headers: await headers() }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!session) return unauthorized();
  if (!organization) return forbidden();
  await checkPermission({ organizationId: organization.id,permission: { settings: ["delete"] } });

  const subscription = (await auth.api.listActiveSubscriptions({ headers: await headers(), query: { referenceId: organization.id } }))[0]
  if (!subscription || !subscription.stripeSubscriptionId) return <div>No subscriptions found</div>;

  const charges = await stripeClient.charges.list({ customer: subscription.stripeCustomerId });
  if (!charges) return <div>No charges found</div>;

  return (
    <>
      <BreadcrumbSetter items={
        [
          { label: "Organization", href: "/" },
          { label: "Settings", href: "/settings" },
          { label: "Billing" }
        ]
      } />

      <>
        <BillingCurrentPlanCard plan={getPlanByName(parsePlanName(subscription.plan))} subscription={subscription} />
        <BillingInvoicesCard {...charges} />
      </>
    </>
  );
}

export default OrganizationBilling;
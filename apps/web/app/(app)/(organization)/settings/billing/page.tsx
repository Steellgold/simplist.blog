import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { auth } from "@/lib/auth";
import { forbidden } from "next/navigation";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/check-permission";
import { z } from "zod";
import { polar } from "@/lib/polar";

const metadataSchema = z.object({
  plan: z.enum(["hobby", "pro", "business"]),
  startedAt: z.string(),
  endsAt: z.string(),
  subscriptionId: z.string().nullable(),
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
  if (!metadata.success) {
    throw new Error("Invalid metadata");
  }

  const checkout = await polar.checkouts.get({ id: metadata.data.checkoutId });
  if (!checkout) {
    throw new Error("Subscription not found");
  }

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
        <h1>Organization Billing</h1>

        <pre>
          {JSON.stringify(checkout, null, 2)}
        </pre>
      </div>
    </>
  );
}

export default OrganizationBilling;
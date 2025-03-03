import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { auth } from "@/lib/auth";
import { forbidden } from "next/navigation";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/check-permission";

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
          {/* {JSON.stringify(checkout, null, 2)} */}
        </pre>
      </div>
    </>
  );
}

export default OrganizationBilling;
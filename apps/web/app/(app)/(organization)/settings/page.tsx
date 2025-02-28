import { ReactElement } from "react";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { OrganizationSettingsNameForm } from "./_components/organization.name";
import { OrganizationSettingsLogoForm } from "./_components/organization.logo";
import { OrganizationSettingsDeleteForm } from "./_components/organization.danger";
import { OrganizationSettingsLeaveForm } from "./_components/organization.leave";
import { Guard } from "@/components/guard";
import { auth } from "@/lib/auth";
import { forbidden } from "next/navigation";
import { headers } from "next/headers";
import checkPermission from "@/lib/check-permission";

const OrganizationSettings = async(): Promise<ReactElement> => {
  const [organization] =
    await Promise.all([
      auth.api.getFullOrganization({ headers: await headers() })
    ]);

  if (!organization) {
    forbidden();
  }

  await checkPermission({
    organizationId: organization.id,
    permission: { members: ["view"], },
  })

  return (
    <>
      <BreadcrumbSetter items={
        [
          { label: "Organization", href: "/" },
          { label: "Settings", href: "/settings" }
        ]
      } />

      <div className="flex flex-col space-y-6">
        <OrganizationSettingsNameForm initialName={organization.name} organizationId={organization.id} />
        {/* <OrganizationSettingsSlugForm initialSlug={activeOrganization.slug} organizationId={activeOrganization.id} /> */}
      </div>

      <OrganizationSettingsLogoForm initialLogo={organization.logo ?? ""} organizationId={organization.id} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <OrganizationSettingsLeaveForm />

        <Guard need={{ settings: ["delete"] }} elseElement={"Only organization owner can delete the organization."}>
          <OrganizationSettingsDeleteForm />
        </Guard>
      </div>
    </>
  );
}

export default OrganizationSettings;
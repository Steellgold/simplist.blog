import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { ReactElement } from "react";

const OrganizationPosts = async(): Promise<ReactElement> => {
  const [session, organization] =
  await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.getFullOrganization({ headers: await headers() })
  ]);

  if (!organization) {
    unauthorized();
  }

  await checkPermission({
    organizationId: organization.id,
    permission: { posts: ["create"], },
  })

  return (
    <>
      <BreadcrumbSetter items={
        [
          { label: "Organization", href: "/" },
          { label: "Posts" }
        ]
      } />
      
      <div>
        <h1>Organization Posts</h1>
      </div>
    </>
  );
}

export default OrganizationPosts;
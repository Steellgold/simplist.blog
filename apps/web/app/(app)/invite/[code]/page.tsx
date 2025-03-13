"use client";

import { authClient } from "@/lib/auth-client";
import { ReactElement } from "react";
import { NoOrganizations } from "./_components/no-organizations";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { Loader2 } from "lucide-react";
import { SelectOrganization } from "./_components/select-organizations";

const Home = (): ReactElement => {
  const { data: activeOrganization, isPending: isActiveOrganizationPending } = authClient.useActiveOrganization();
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations();
  
  if (isActiveOrganizationPending || isOrganizationsPending) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  if (!activeOrganization && organizations && organizations.length === 0) {
    return <NoOrganizations />;
  }

  if (!activeOrganization && organizations && organizations.length > 0) {
    return <SelectOrganization />
  }

  return (
    <>
      <BreadcrumbSetter items={[{ label: "Organization" }]} />

      <pre>
        {JSON.stringify(activeOrganization, null, 2)}
      </pre>
    </>
  );
};

export default Home;
import { AccountDeletionCard } from "@/components/account/account-deletion-card";
import { PageLayout } from "@/components/layout/page-layout";
import { findOwnedProjects } from "@/lib/actions/account-deletion";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const ownedProjects = await findOwnedProjects(user.id);

  return (
    <PageLayout
      title="Account"
      description="Schedule or cancel account deletion"
      centered="sm"
    >
      <AccountDeletionCard user={user} ownedProjects={ownedProjects} />
    </PageLayout>
  );
};

export default Page;

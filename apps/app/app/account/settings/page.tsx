import { PageLayout } from "@/components/layout/page-layout";
import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { prisma } from "@simplist/db";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const isOAuthUser = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: {
        not: "credential",
      },
    },
  });

  return (
    <PageLayout
      title="Account Information"
      description="Manage your personal information"
      centered="sm"
    >
      <AccountSettingsForm user={user} isOAuthUser={!!isOAuthUser} />
    </PageLayout>
  );
};

export default Page;

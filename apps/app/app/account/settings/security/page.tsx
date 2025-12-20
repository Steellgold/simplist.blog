import { PageLayout } from "@/components/layout/page-layout";
import { SecuritySettingsForm } from "@/components/account/security-settings-form";
import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@simplist/db";
import { unauthorized } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) unauthorized();

  const [hasPassword, passkeys] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { password: true },
    }),
    auth.api.listPasskeys({
      headers: await headers(),
    }),
  ]);

  return (
    <PageLayout
      title="Security"
      description="Manage your account security settings"
      centered="sm"
    >
      <SecuritySettingsForm
        user={user}
        hasPassword={Boolean(
          hasPassword?.password && hasPassword.password.length > 0,
        )}
        passkeys={passkeys}
      />
    </PageLayout>
  );
};

export default Page;

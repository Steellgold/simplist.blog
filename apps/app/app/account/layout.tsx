import { AccountSidebar } from "@/components/layout/account-sidebar";
import { getCurrentUser } from "@/lib/auth-helper";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@simplist/ui/components/sidebar";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

const AccountLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <SidebarProvider>
      <AccountSidebar user={user} />

      <main className="w-full flex-1 overflow-x-hidden">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
          <SidebarTrigger />
          <ThemeSwitcher />
        </div>
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AccountLayout;

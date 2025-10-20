import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjects } from "@/lib/actions/projects";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/ui/switch-theme";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const projects = await getUserProjects();

  // Redirect to create-project if no projects
  if (projects.length === 0) {
    redirect("/create-project");
  }

  const project = projects[0]; // Single project mode

  return (
    <SidebarProvider>
      <AppSidebarWrapper user={user} project={project} />
      <main className="flex-1 w-full">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
          <SidebarTrigger />
          <ThemeSwitcher />
        </div>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;

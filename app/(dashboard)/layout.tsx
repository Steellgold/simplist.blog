import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjects } from "@/lib/actions/projects";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="flex h-14 items-center border-b px-4 lg:h-16">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

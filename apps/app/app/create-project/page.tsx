import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { CreateProjectPageClient } from "@/components/projects/create-project-client";
import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirectIfPendingDeletion } from "@/lib/auth/deletion-guard";
import { SidebarProvider } from "@simplist/ui/components/sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onboarding",
  robots: { index: false, follow: false },
};

const CreateProjectPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirectIfPendingDeletion(user, "/create-project");

  const projects = await getUserProjects();

  // Check if user has reached the project limit
  if (projects.length >= 2) {
    redirect(`/${projects[0].slug}`);
  }

  return (
    <SidebarProvider>
      <AppSidebarWrapper user={user} projects={projects} currentRole={null} />

      <CreateProjectPageClient />
    </SidebarProvider>
  );
};

export default CreateProjectPage;

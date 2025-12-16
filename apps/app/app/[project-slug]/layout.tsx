import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ProjectContextProvider } from "@/components/projects/context-provider";
import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { redirectIfPendingDeletion } from "@/lib/auth/deletion-guard";
import { type LanguageCode } from "@/lib/types/languages";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { SidebarProvider, SidebarTrigger } from "@simplist/ui/components/sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FC, PropsWithChildren } from "react";

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

type Props = {
  params: Promise<{
    "project-slug": string
  }>
} & PropsWithChildren;

const ProjectLayout: FC<Props> = async ({ params, children }) => {
  const user = await getCurrentUser();
  const { "project-slug": projectSlug } = await params;

  if (!user) {
    redirect("/auth/login");
  }

  redirectIfPendingDeletion(user, `/${projectSlug}`);

  const projects = await getUserProjects();

  // Redirect to create-project if no projects
  if (projects.length === 0) redirect("/create-project");

  // Cast projects to the expected type for the context
  const typedProjects = projects.map((project: any) => ({
    ...project,
    defaultLanguage: project.defaultLanguage as LanguageCode,
  }));

  // Find the project by slug
  const currentProject = typedProjects.find((p: any) => p.slug === projectSlug);

  // If project not found, redirect to first project or create-project
  if (!currentProject) {
    if (typedProjects.length > 0) {
      redirect(`/${typedProjects[0].slug}`);
    } else {
      redirect("/create-project");
    }
  }

  // Get current user's membership for this project
  const currentMembership = await getUserProjectMembership(currentProject.id, user.id);
  const currentMember = currentMembership || null;
  const currentMemberId = currentMember?.id || null;
  const currentRole = currentMembership?.role || null;

  return (
    <SidebarProvider>
      <AppSidebarWrapper user={user} projects={typedProjects} currentProject={currentProject} currentRole={currentRole} />
      <ProjectContextProvider projects={typedProjects} currentProject={currentProject} currentMember={currentMember} currentMemberId={currentMemberId}>
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
            <SidebarTrigger />
            <ThemeSwitcher />
          </div>

          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </ProjectContextProvider>
    </SidebarProvider>
  );
};

export default ProjectLayout;

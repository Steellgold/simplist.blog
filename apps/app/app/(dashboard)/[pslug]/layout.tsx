import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ProjectContextProvider } from "@/components/projects/context-provider";
import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { type LanguageCode } from "@/lib/types/languages";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { SidebarProvider, SidebarTrigger } from "@simplist/ui/components/sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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

const ProjectLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "pslug": string }>;
}) => {
  const user = await getCurrentUser();
  const { "pslug": projectSlug } = await params;

  if (!user) {
    redirect("/auth/login");
  }

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

  return (
    <SidebarProvider>
      <AppSidebarWrapper user={user} projects={typedProjects} currentProject={currentProject} />
      <ProjectContextProvider projects={typedProjects} currentProject={currentProject}>
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

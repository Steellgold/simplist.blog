import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ProjectContextProvider } from "@/components/projects/context-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { ThemeSwitcher } from "@/components/ui/switch-theme";
import { getLayoutData } from "@/lib/cache/layout-data";
import { type LanguageCode } from "@/lib/types/languages";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

const ProjectLayoutContent = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "pslug": string }>;
}) => {
  const { "pslug": projectSlug } = await params;

  // Get cached layout data (user + projects) in one optimized query
  const { user, projects } = await getLayoutData();

  // Redirect to create-project if no projects
  if (projects.length === 0) {
    redirect("/create-project");
  }

  // Cast projects to the expected type for the context
  const typedProjects = projects.map(project => ({
    ...project,
    defaultLanguage: project.defaultLanguage as LanguageCode,
  }));

  // Find the project by slug
  const currentProject = typedProjects.find(p => p.slug === projectSlug);
  
  // If project not found, redirect to first project or create-project
  if (!currentProject) {
    if (typedProjects.length > 0) {
      redirect(`/${typedProjects[0].slug}`);
    } else {
      redirect("/create-project");
    }
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <AppSidebarWrapper user={user} projects={typedProjects} currentProject={currentProject} />
      </Suspense>
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
    </>
  );
};

const ProjectLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "pslug": string }>;
}) => {
  return (
    <SidebarProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
        <ProjectLayoutContent params={params}>
          {children}
        </ProjectLayoutContent>
      </Suspense>
    </SidebarProvider>
  );
};

export default ProjectLayout;

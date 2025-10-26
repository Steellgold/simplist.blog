import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ProjectContextProvider } from "@/components/projects/context-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/ui/switch-theme";
import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
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
  if (projects.length === 0) {
    redirect("/create-project");
  }

  // Cast projects to the expected type for the context
  const typedProjects = projects.map((project: any) => ({
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

  // Get full user data (subscription info is now at project level)
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AppSidebarWrapper user={fullUser || user} projects={typedProjects} currentProject={currentProject} />
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
    </SidebarProvider>
  );
};

export default ProjectLayout;

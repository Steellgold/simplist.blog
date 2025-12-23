"use client";

import { useActiveProject } from "@/hooks/use-active-project";
import type { User } from "@/lib/auth-client";
import type { ProjectStats } from "@/lib/actions/projects";
import type { ProjectRole } from "@simplist/db";
import type { Project } from "@simplist/db/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppSidebar } from "./sidebar";

interface AppSidebarWrapperProps {
  user: User;
  projects: Project[];
  currentProject?: Project | null;
  currentRole: ProjectRole | null;
  stats?: ProjectStats;
}

export const AppSidebarWrapper = ({
  user,
  projects,
  currentProject,
  currentRole,
  stats,
}: AppSidebarWrapperProps) => {
  const router = useRouter();
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const { activeProject, setActiveProject } = useActiveProject({
    projects,
    currentProject,
  });

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleCreateProject = () => {
    setIsCreatingProject(true);
    router.push("/create-project");
  };

  return (
    <AppSidebar
      user={user}
      projects={projects}
      activeProject={activeProject}
      currentRole={currentRole}
      stats={stats}
      onProjectChange={handleProjectChange}
      onCreateProject={handleCreateProject}
      isCreatingProject={isCreatingProject}
    />
  );
};

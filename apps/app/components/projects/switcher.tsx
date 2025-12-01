"use client"

import { MiniBadge } from "@/components/ui/mini-badge"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { ProjectIconAvatar } from "@/components/icon-avatar"
import type { Project } from "@simplist/db/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@simplist/ui/components/sidebar"
import { Spinner } from "@simplist/ui/components/spinner"

interface ProjectSwitcherProps {
  projects: Project[]
  activeProjectId?: string
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
  isCreatingProject?: boolean
}

export const ProjectSwitcher = ({
  projects,
  activeProjectId,
  onProjectChange,
  onCreateProject,
  isCreatingProject = false,
}: ProjectSwitcherProps) => {
  const { isMobile } = useSidebar()
  const [activeProject, setActiveProject] = useState<Project | undefined>(
    projects.find((p) => p.id === activeProjectId) || projects[0]
  )

  useEffect(() => {
    const nextActive = projects.find((p) => p.id === activeProjectId) || projects[0]
    if (nextActive) {
      setActiveProject(nextActive)
    }
  }, [projects, activeProjectId])

  const handleProjectChange = (project: Project) => {
    setActiveProject(project)
    onProjectChange?.(project.id)
  }

  // Check if the active project is pro
  const isPro = activeProject?.subscriptionTier === "PRO" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              suppressHydrationWarning
            >
              <ProjectIconAvatar project={activeProject || projects[0]} size="md" />

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">
                    {activeProject?.name.slice(0, 13).concat(
                      activeProject?.name.length > 13 ? "..." : ""
                    ) || "Select project"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MiniBadge tier={isPro ? "LPRO" : "LSTARTER"} size="md" />
                </div>
              </div>

              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projects
            </DropdownMenuLabel>

            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectChange(project)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center text-sidebar-primary-foreground overflow-hidden">
                  <ProjectIconAvatar
                    project={project} 
                    size="xs"
                    roundedSize="xs"
                    onlyDot
                  />
                </div>

                <div className="flex flex-row items-center gap-2 justify-between w-full">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center">
                    {(() => {
                      const projectIsPro = project.subscriptionTier === "PRO" &&
                        project.subscriptionExpiresAt &&
                        new Date(project.subscriptionExpiresAt) > new Date();

                      return <MiniBadge tier={projectIsPro ? "PRO" : "STARTER"} size="md" />;
                    })()}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onCreateProject}
              className="gap-2 p-2"
              disabled={isCreatingProject}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                {isCreatingProject ? <Spinner /> : <Plus />}
              </div>

              <div className="font-medium text-muted-foreground">
                {isCreatingProject ? "Creating..." : "Create project"}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
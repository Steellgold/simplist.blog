"use client"

import { ChevronsUpDown, Plus } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Project {
  id: string
  name: string
  slug: string
}

interface ProjectSwitcherProps {
  projects: Project[]
  activeProjectId?: string
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
}

export function ProjectSwitcher({
  projects,
  activeProjectId,
  onProjectChange,
  onCreateProject,
}: ProjectSwitcherProps) {
  const { isMobile } = useSidebar()
  const [activeProject, setActiveProject] = useState<Project | undefined>(
    projects.find((p) => p.id === activeProjectId) || projects[0]
  )

  const handleProjectChange = (project: Project) => {
    setActiveProject(project)
    onProjectChange?.(project.id)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-semibold">
                  {activeProject?.name.substring(0, 2).toUpperCase() || "??"}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeProject?.name || "Select project"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeProject?.slug || "No project selected"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
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
                <div className="flex size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-semibold">
                    {project.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {project.slug}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateProject}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create project
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

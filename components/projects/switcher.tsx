"use client"

import { ChevronsUpDown, Loader2, Plus } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getPublicUrlForKey } from "@/lib/actions/images"
import { MiniBadge } from "@/components/ui/mini-badge"

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
  icon?: string | null
  subscriptionTier?: string
  subscriptionExpiresAt?: Date | null
}

interface User {
  // User interface - subscription fields moved to project level
}

interface ProjectIconProps {
  iconKey: string
  name: string
  size: number
}

const ProjectIcon = ({ iconKey, name, size }: ProjectIconProps) => {
  const [iconUrl, setIconUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (iconKey) {
      setIsLoading(true)
      getPublicUrlForKey(iconKey)
        .then(setIconUrl)
        .finally(() => setIsLoading(false))
    }
  }, [iconKey])

  if (isLoading || !iconUrl) {
    return (
      <span className="text-xs font-semibold">
        {name.substring(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <Image
      src={iconUrl}
      alt={name}
      width={size}
      height={size}
      className="w-full h-full object-cover"
    />
  )
}

interface ProjectSwitcherProps {
  projects: Project[]
  activeProjectId?: string
  user?: User
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
  isCreatingProject?: boolean
}

export const ProjectSwitcher = ({
  projects,
  activeProjectId,
  user,
  onProjectChange,
  onCreateProject,
  isCreatingProject = false,
}: ProjectSwitcherProps) => {
  const { isMobile } = useSidebar()
  const [activeProject, setActiveProject] = useState<Project | undefined>(
    projects.find((p) => p.id === activeProjectId) || projects[0]
  )

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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {activeProject?.icon ? (
                  <ProjectIcon 
                    iconKey={activeProject.icon} 
                    name={activeProject.name}
                    size={32}
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {activeProject?.name.substring(0, 2).toUpperCase() || "??"}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">
                    {activeProject?.name || "Select project"}
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
                <div className="flex size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  {project.icon ? (
                    <ProjectIcon 
                      iconKey={project.icon} 
                      name={project.name}
                      size={24}
                    />
                  ) : (
                    <span className="text-xs font-semibold">
                      {project.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
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
              disabled={isCreatingProject || projects.length >= 2}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                {isCreatingProject ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
              </div>
              <div className="font-medium text-muted-foreground">
                {isCreatingProject ? "Creating..." : projects.length >= 2 ? "Limit reached (2/2)" : "Create project"}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

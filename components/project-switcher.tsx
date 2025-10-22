"use client"

import { ChevronsUpDown, Loader2, Plus } from "lucide-react"
import Image from "next/image"
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

interface User {
  subscription?: string
  subscriptionExpiresAt?: Date | null
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

  const isPro = user?.subscription === "pro" &&
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-semibold">
                  {activeProject?.name.substring(0, 2).toUpperCase() || "??"}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">
                    {activeProject?.name || "Select project"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isPro ? (
                    <Image
                      src="https://cdn.simplist.blog/assets/billing/badge-pro.png"
                      alt="Pro"
                      width={14}
                      height={14}
                      className="h-3.5 w-auto"
                      quality={100}
                    />
                  ) : (
                    <Image
                      src="https://cdn.simplist.blog/assets/billing/badge-starter.png"
                      alt="Starter"
                      width={14}
                      height={14}
                      className="h-3.5 w-auto"
                      quality={100}
                    />
                  )}
                </div>
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
                <div className="flex flex-row items-center gap-2 justify-between w-full">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center">
                    {isPro ? (
                      <Image
                        src="https://cdn.simplist.blog/assets/billing/mini-pro-badge.png"
                        alt="Pro"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                        quality={100}
                      />
                    ) : (
                      <Image
                        src="https://cdn.simplist.blog/assets/billing/mini-starter-badge.png"
                        alt="Starter"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                        quality={100}
                      />
                    )}
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

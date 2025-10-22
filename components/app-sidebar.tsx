"use client"

import { LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ProjectSwitcher } from "@/components/project-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import { cloneElement, useState } from "react"
import { ChartLine } from "./animate-ui/icons/chart-line"
import { LayersIcon } from "./animate-ui/icons/layers"
import { LayoutDashboardIcon } from "./animate-ui/icons/layout-dashboard"
import { SettingsIcon } from "./animate-ui/icons/settings"
import { Star } from "./animate-ui/icons/star"
import { UnplugIcon } from "./animate-ui/icons/unplug"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  subscription?: string
  subscriptionExpiresAt?: Date | null
}

interface Project {
  id: string
  name: string
  slug: string
  subscriptionTier?: string
  subscriptionExpiresAt?: Date | null
}

interface AppSidebarProps {
  user: User
  projects: Project[]
  activeProject: Project | null
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
  onLogout?: () => void
  isCreatingProject?: boolean
}

const getNavigationItems = (isPro: boolean, projectSlug: string) => [
  {
    title: "Dashboard",
    icon: <LayoutDashboardIcon />,
    href: `/${projectSlug}`,
  },
  {
    title: "Articles",
    icon: <LayersIcon />,
    href: `/${projectSlug}/articles`,
  },
  {
    title: "Analytics",
    icon: <ChartLine />,
    href: `/${projectSlug}/analytics`,
    disabled: !isPro,
    badge: !isPro ? "https://cdn.simplist.blog/assets/billing/mini-pro-badge.png" : undefined,
  },
  {
    title: "API Keys",
    icon: <UnplugIcon />,
    href: `/${projectSlug}/api-keys`,
  },
  {
    title: "Settings",
    icon: <SettingsIcon />,
    href: `/${projectSlug}/settings`,
  },
  {
    title: isPro ? "Billing" : "Pricing",
    icon: <Star />,
    href: isPro ? "/settings/billing" : "/pricing",
  },
]

export const AppSidebar = ({
  user,
  projects,
  activeProject,
  onProjectChange,
  onCreateProject,
  onLogout,
  isCreatingProject = false,
}: AppSidebarProps) => {
  const [itemHovered, setItemHovered] = useState<string | null>(null)

  const getUserInitials = () => {
    if (!user.name) return "?"
    const names = user.name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  const isPro = activeProject?.subscriptionTier === "pro" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date();

  const navigationItems = getNavigationItems(isPro ?? false, activeProject?.slug || "");

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <ProjectSwitcher
          projects={projects}
          activeProjectId={activeProject?.id}
          user={user}
          onProjectChange={onProjectChange}
          onCreateProject={onCreateProject}
          isCreatingProject={isCreatingProject}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    onMouseEnter={() => setItemHovered(item.href)}
                    onMouseLeave={() => setItemHovered(null)}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-2 w-full [&>svg]:size-4">
                        {cloneElement(item.icon as React.ReactElement, {
                          // @ts-expect-error - animate prop is added dynamically
                          animate: itemHovered === item.href
                        })}
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Image
                            src={item.badge}
                            alt="Pro"
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    ) : (
                      <Link href={item.href}>
                        {cloneElement(item.icon as React.ReactElement, {
                          // @ts-expect-error - animate prop is added dynamically
                          animate: itemHovered === item.href
                        })}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={"top"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

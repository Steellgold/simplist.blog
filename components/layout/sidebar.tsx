"use client"

import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ChartLine } from "@/components/animate-ui/icons/chart-line"
import { LayersIcon } from "@/components/animate-ui/icons/layers"
import { LayoutDashboardIcon } from "@/components/animate-ui/icons/layout-dashboard"
import { SettingsIcon } from "@/components/animate-ui/icons/settings"
import { Star } from "@/components/animate-ui/icons/star"
import { UnplugIcon } from "@/components/animate-ui/icons/unplug"
import { ProjectSwitcher } from "@/components/projects/switcher"
import { MiniBadge } from "@/components/ui/mini-badge"
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
import { AccountItemSidebar } from "./account-item-sidebar-menu"
import type { User } from "@/lib/auth-client"
import { Project } from "@prisma/client"

interface AppSidebarProps {
  user: User
  projects: Project[]
  activeProject: Project | null
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
  onLogout?: () => void
  isCreatingProject?: boolean
}

const getNavigationItems = (isPro: boolean, projectSlug: string, isProjectPro?: boolean) => [
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
    showProBadge: !isPro,
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
    title: "Billing",
    icon: <Star />,
    href: `/${projectSlug}/settings/billing`
  }
]

export const AppSidebar = ({
  user,
  projects,
  activeProject,
  onProjectChange,
  onCreateProject,
  isCreatingProject = false,
}: AppSidebarProps) => {
  const [itemHovered, setItemHovered] = useState<string | null>(null)
  const pathname = usePathname()

  const isPro = activeProject?.subscriptionTier === "PRO" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date();

  const navigationItems = getNavigationItems(isPro ?? false, activeProject?.slug || "", isPro ?? false);

  const isItemActive = (href: string) => {
    // Exact match for dashboard
    if (href === `/${activeProject?.slug}`) {
      return pathname === href
    }
    // For other pages, check if pathname starts with the href
    return pathname.startsWith(href)
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <ProjectSwitcher
          projects={projects}
          activeProjectId={activeProject?.id}
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
              {navigationItems.map((item) => {
                const isActive = isItemActive(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      disabled={item.disabled}
                      isActive={isActive}
                      className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                      onMouseEnter={() => setItemHovered(item.href)}
                      onMouseLeave={() => setItemHovered(null)}
                      tooltip={item.disabled ? `${item.title} (Premium required)` : undefined}
                    >
                      {item.disabled ? (
                        <div className="flex items-center gap-2 w-full [&>svg]:size-4">
                          {cloneElement(item.icon as React.ReactElement, {
                            // @ts-expect-error - animate prop is added dynamically
                            animate: itemHovered === item.href
                          })}
                          <span className="flex-1 group-data-[collapsible=icon]:hidden">{item.title}</span>
                          {item.showProBadge && (
                            <MiniBadge tier="PRO" size="sm" className="group-data-[collapsible=icon]:hidden" />
                          )}
                        </div>
                      ) : (
                        <Link href={item.href}>
                          {cloneElement(item.icon as React.ReactElement, {
                            // @ts-expect-error - animate prop is added dynamically
                            animate: itemHovered === item.href || isActive
                          })}
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AccountItemSidebar user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ProjectSwitcher } from "@/components/projects/switcher"
import { MiniBadge } from "@/components/ui/mini-badge"
import type { User } from "@/lib/auth-client"
import type { Project } from "@simplist/db/types"
import type { ProjectRole } from "@simplist/db"
import { ChartLine } from "@simplist/ui/animate-ui/chart-line"
import { LayersIcon } from "@simplist/ui/animate-ui/layers"
import { LayoutDashboardIcon } from "@simplist/ui/animate-ui/layout-dashboard"
import { SettingsIcon } from "@simplist/ui/animate-ui/settings"
import { ClipboardListIcon } from "@simplist/ui/animate-ui/clipboard-list"
import { UsersIcon } from "@simplist/ui/animate-ui/users"
import { Star } from "@simplist/ui/animate-ui/star"
import { UnplugIcon } from "@simplist/ui/animate-ui/unplug"
import { Ban } from "lucide-react"
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
} from "@simplist/ui/components/sidebar"
import { cloneElement, useState, type ReactNode } from "react"
import { SidebarFooterItem } from "./sidebar-footer-item"
import type { RolePermission } from "@/lib/auth/permissions"

/**
 * true = items without permission are hidden
 * false = items without permission are shown with Ban icon
 */
const NOT_ALLOWED_HIDDEN = true

interface AppSidebarProps {
  user: User
  projects: Project[]
  activeProject: Project | null
  currentRole: ProjectRole | null
  onProjectChange?: (projectId: string) => void
  onCreateProject?: () => void
  onLogout?: () => void
  isCreatingProject?: boolean
}

type NavigationItem = {
  title: string
  icon: ReactNode
  href: string
  disabled?: boolean
  showProBadge?: boolean
  matchStrategy?: "exact" | "prefix"
  requiredPermissions?: RolePermission[]
}

const getNavigationItems = (isPro: boolean, projectSlug: string): NavigationItem[] => [
  {
    title: "Dashboard",
    icon: <LayoutDashboardIcon />,
    href: `/${projectSlug}`,
    matchStrategy: "exact",
    requiredPermissions: []
  },
  {
    title: "Articles",
    icon: <LayersIcon />,
    href: `/${projectSlug}/articles`,
    requiredPermissions: ["canManageArticles"]
  },
  {
    title: "Analytics",
    icon: <ChartLine />,
    href: `/${projectSlug}/analytics`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canViewAnalytics"]
  },
  {
    title: "API Keys",
    icon: <UnplugIcon />,
    href: `/${projectSlug}/api-keys`,
    requiredPermissions: ["canManageApiKeys"]
  },
  {
    title: "Settings",
    icon: <SettingsIcon />,
    href: `/${projectSlug}/settings`,
    matchStrategy: "exact",
    requiredPermissions: ["canManageProject"]
  },
  {
    title: "Billing",
    icon: <Star />,
    href: `/${projectSlug}/settings/billing`,
    requiredPermissions: ["canManageBilling"]
  }
]

const getTeamItems = (isPro: boolean, projectSlug: string): NavigationItem[] => [
  {
    title: "Members",
    icon: <UsersIcon />,
    href: `/${projectSlug}/settings/members`,
    requiredPermissions: ["canManageMembers"]
  },
  {
    title: "Roles",
    icon: <ClipboardListIcon />,
    href: `/${projectSlug}/settings/roles`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canManageRoles"]
  }
]

export const AppSidebar = ({
  user,
  projects,
  activeProject,
  currentRole,
  onProjectChange,
  onCreateProject,
  isCreatingProject = false,
}: AppSidebarProps) => {
  const [itemHovered, setItemHovered] = useState<string | null>(null)
  const pathname = usePathname()

  const isPro = activeProject?.subscriptionTier === "PRO" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date();

  const navigationItems = getNavigationItems(isPro ?? false, activeProject?.slug || "");
  const teamItems = getTeamItems(isPro ?? false, activeProject?.slug || "");

  const isItemActive = (href: string, matchStrategy: "exact" | "prefix" = "prefix") => {
    if (matchStrategy === "exact") {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const hasAccess = (item: NavigationItem): boolean => {
    if (!currentRole) return false
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true
    return item.requiredPermissions.every(permission => currentRole[permission] === true)
  }

  const shouldShowCategory = (items: NavigationItem[]): boolean => {
    if (!NOT_ALLOWED_HIDDEN) return true // Always show categories if items are visible with Ban icon
    return items.some(item => hasAccess(item))
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
        {shouldShowCategory(navigationItems) && (
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = isItemActive(item.href, item.matchStrategy)
                  const userHasAccess = hasAccess(item)
                  const isDisabled = item.disabled || !userHasAccess

                  if (NOT_ALLOWED_HIDDEN && !userHasAccess) {
                    return null
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild={!isDisabled}
                        disabled={isDisabled}
                        isActive={isActive}
                        className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        onMouseEnter={() => setItemHovered(item.href)}
                        onMouseLeave={() => setItemHovered(null)}
                        tooltip={
                          !userHasAccess
                            ? `${item.title} (No permission)`
                            : item.disabled
                              ? `${item.title} (Premium required)`
                              : undefined
                        }
                      >
                        {isDisabled ? (
                          <div className="flex items-center gap-2 w-full [&>svg]:size-4">
                            {userHasAccess ? (
                              cloneElement(item.icon as React.ReactElement, {
                                // @ts-expect-error - animate prop is added dynamically
                                animate: itemHovered === item.href
                              })
                            ) : (
                              <Ban className="size-4" />
                            )}
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
        )}

        {shouldShowCategory(teamItems) && (
          <SidebarGroup>
            <SidebarGroupLabel>Team</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamItems.map((item) => {
                  const isActive = isItemActive(item.href, item.matchStrategy)
                  const userHasAccess = hasAccess(item)
                  const isDisabled = item.disabled || !userHasAccess

                  if (NOT_ALLOWED_HIDDEN && !userHasAccess) {
                    return null
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild={!isDisabled}
                        disabled={isDisabled}
                        isActive={isActive}
                        className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        onMouseEnter={() => setItemHovered(item.href)}
                        onMouseLeave={() => setItemHovered(null)}
                        tooltip={
                          !userHasAccess
                            ? `${item.title} (No permission)`
                            : item.disabled
                              ? `${item.title} (Premium required)`
                              : undefined
                        }
                      >
                        {isDisabled ? (
                          <div className="flex items-center gap-2 w-full [&>svg]:size-4">
                            {userHasAccess ? (
                              cloneElement(item.icon as React.ReactElement, {
                                // @ts-expect-error - animate prop is added dynamically
                                animate: itemHovered === item.href
                              })
                            ) : (
                              <Ban className="size-4" />
                            )}
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
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterItem user={user} isVerified={user.emailVerified} />
      </SidebarFooter>
    </Sidebar>
  )
}

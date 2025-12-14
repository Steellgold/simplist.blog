"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ProjectSwitcher } from "@/components/projects/switcher"
import { MiniBadge } from "@/components/ui/mini-badge"
import type { User } from "@/lib/auth-client"
import type { RolePermission } from "@/lib/auth/permissions"
import type { ProjectRole } from "@simplist/db"
import type { Project } from "@simplist/db/types"
import { ChartLine } from "@simplist/ui/animate-ui/chart-line"
import { ClipboardListIcon } from "@simplist/ui/animate-ui/clipboard-list"
import { LayersIcon } from "@simplist/ui/animate-ui/layers"
import { LayoutDashboardIcon } from "@simplist/ui/animate-ui/layout-dashboard"
import { SettingsIcon } from "@simplist/ui/animate-ui/settings"
import { Star } from "@simplist/ui/animate-ui/star"
import { UnplugIcon } from "@simplist/ui/animate-ui/unplug"
import { UsersIcon } from "@simplist/ui/animate-ui/users"
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
import { Ban, WebhookIcon } from "lucide-react"
import { cloneElement, useState, type ReactNode } from "react"
import { SidebarFooterItem } from "./sidebar-footer-item"

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
  category: string
}

const getNavigationItems = (isPro: boolean, projectSlug: string): NavigationItem[] => [
  {
    title: "Dashboard",
    icon: <LayoutDashboardIcon />,
    href: `/${projectSlug}`,
    matchStrategy: "exact",
    requiredPermissions: [],
    category: "Navigation"
  },
  {
    title: "Articles",
    icon: <LayersIcon />,
    href: `/${projectSlug}/articles`,
    requiredPermissions: ["canManageArticles"],
    category: "Navigation"
  },
  {
    title: "Analytics",
    icon: <ChartLine />,
    href: `/${projectSlug}/analytics`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canViewAnalytics"],
    category: "Navigation"
  },
  {
    title: "Webhooks",
    icon: <WebhookIcon />,
    href: `/${projectSlug}/webhooks`,
    requiredPermissions: ["canManageWebhooks"],
    category: "Navigation"
  },
  {
    title: "General",
    icon: <SettingsIcon />,
    href: `/${projectSlug}/settings`,
    matchStrategy: "exact",
    requiredPermissions: ["canManageProject"],
    category: "Settings"
  },
  {
    title: "API Keys",
    icon: <UnplugIcon />,
    href: `/${projectSlug}/api-keys`,
    requiredPermissions: ["canManageApiKeys"],
    category: "Settings"
  },
  {
    title: "Billing",
    icon: <Star />,
    href: `/${projectSlug}/settings/billing`,
    requiredPermissions: ["canManageBilling"],
    category: "Settings"
  },
  {
    title: "Members",
    icon: <UsersIcon />,
    href: `/${projectSlug}/settings/members`,
    requiredPermissions: ["canManageMembers"],
      category: "Team"
  },
  {
    title: "Roles",
    icon: <ClipboardListIcon />,
    href: `/${projectSlug}/settings/roles`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canManageRoles"],
    category: "Team"
  }
]

export const AppSidebar = ({
  user, projects,
  activeProject, currentRole,
  onProjectChange, onCreateProject,
  isCreatingProject = false,
}: AppSidebarProps) => {
  const [itemHovered, setItemHovered] = useState<string | null>(null)
  const pathname = usePathname()

  const isPro = activeProject?.subscriptionTier === "PRO" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date();

  const navigationItems = getNavigationItems(isPro ?? false, activeProject?.slug || "");

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

  // Regrouper les items par catégorie
  const itemsByCategory = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, NavigationItem[]>)

  const shouldShowCategory = (items: NavigationItem[]): boolean => {
    if (!NOT_ALLOWED_HIDDEN) return true
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
        {Object.entries(itemsByCategory).map(([category, items]) => {
          if (!shouldShowCategory(items)) return null

          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
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
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterItem user={user} isVerified={user.emailVerified} />
      </SidebarFooter>
    </Sidebar>
  )
}
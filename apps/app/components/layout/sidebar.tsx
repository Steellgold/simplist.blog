"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProjectSwitcher } from "@/components/projects/switcher";
import { MiniBadge } from "@/components/ui/mini-badge";
import type { ProjectStats } from "@/lib/actions/projects";
import type { User } from "@/lib/auth-client";
import type { RolePermission } from "@/lib/auth/permissions";
import { formatBytes } from "@/lib/utils";
import {
  Ban,
  ChartLine,
  CreditCard,
  Gear,
  HouseFill,
  Key, Layers3Diagonal,
  ListCheckLock,
  Persons,
  Picture,
  Tags
} from "@gravity-ui/icons";
import type { ProjectRole } from "@simplist/db";
import type { Project } from "@simplist/db/types";
import { Webhook } from "@simplist/ui/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@simplist/ui/components/sidebar";
import { ComponentType, SVGProps } from "react";
import { SidebarFooterItem } from "./sidebar-footer-item";

/**
 * true = items without permission are hidden
 * false = items without permission are shown with Ban icon
 */
const NOT_ALLOWED_HIDDEN = true;

interface AppSidebarProps {
  user: User;
  projects: Project[];
  activeProject: Project | null;
  currentRole: ProjectRole | null;
  stats?: ProjectStats;
  onProjectChange?: (projectId: string) => void;
  onCreateProject?: () => void;
  onArrowRightFromSquare?: () => void;
  isCreatingProject?: boolean;
}

type NavigationItem = {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  disabled?: boolean;
  showProBadge?: boolean;
  matchStrategy?: "exact" | "prefix";
  requiredPermissions?: RolePermission[];
  category: string;
};

const getNavigationItems = (
  isPro: boolean,
  projectSlug: string,
): NavigationItem[] => [
  {
    title: "Dashboard",
    icon: HouseFill,
    href: `/${projectSlug}`,
    matchStrategy: "exact",
    requiredPermissions: [],
    category: "Content",
  },
  {
    title: "Articles",
    icon: Layers3Diagonal,
    href: `/${projectSlug}/articles`,
    requiredPermissions: ["canManageArticles"],
    category: "Content",
  },
  {
    title: "Tags",
    icon: Tags,
    href: `/${projectSlug}/tags`,
    requiredPermissions: ["canManageTags"],
    category: "Content",
  },
  {
    title: "Media",
    icon: Picture,
    href: `/${projectSlug}/media`,
    requiredPermissions: ["canManageArticles"],
    category: "Content",
  },
  {
    title: "Analytics",
    icon: ChartLine,
    href: `/${projectSlug}/analytics`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canViewAnalytics"],
    category: "Content",
  },
  {
    title: "API Keys",
    icon: Key,
    href: `/${projectSlug}/api-keys`,
    requiredPermissions: ["canManageApiKeys"],
    category: "API",
  },
  {
    title: "Webhooks",
    icon: Webhook,
    href: `/${projectSlug}/webhooks`,
    requiredPermissions: ["canManageWebhooks"],
    category: "API",
  },
  {
    title: "General",
    icon: Gear,
    href: `/${projectSlug}/settings`,
    matchStrategy: "exact",
    requiredPermissions: ["canManageProject"],
    category: "Settings",
  },
  {
    title: "Billing",
    icon: CreditCard,
    href: `/${projectSlug}/settings/billing`,
    requiredPermissions: ["canManageBilling"],
    category: "Settings",
  },
  {
    title: "Members",
    icon: Persons,
    href: `/${projectSlug}/settings/members`,
    requiredPermissions: ["canManageMembers"],
    category: "Settings",
  },
  {
    title: "Roles",
    icon: ListCheckLock,
    href: `/${projectSlug}/settings/roles`,
    disabled: !isPro,
    showProBadge: !isPro,
    requiredPermissions: ["canManageRoles"],
    category: "Settings",
  },
];

export const AppSidebar = ({
  user,
  projects,
  activeProject,
  currentRole,
  stats,
  onProjectChange,
  onCreateProject,
  isCreatingProject = false,
}: AppSidebarProps) => {
  const pathname = usePathname();

  const isPro =
    activeProject?.subscriptionTier === "PRO" &&
    activeProject?.subscriptionExpiresAt &&
    new Date(activeProject.subscriptionExpiresAt) > new Date();

  const navigationItems = getNavigationItems(
    isPro ?? false,
    activeProject?.slug || "",
  );

  const isItemActive = (
    href: string,
    matchStrategy: "exact" | "prefix" = "prefix",
  ) => {
    if (matchStrategy === "exact") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const hasAccess = (item: NavigationItem): boolean => {
    if (!currentRole) return false;
    if (!item.requiredPermissions || item.requiredPermissions.length === 0)
      return true;
    return item.requiredPermissions.every(
      (permission) => currentRole[permission] === true,
    );
  };

  const getItemBadge = (itemTitle: string): string | null => {
    if (!stats) return null;

    switch (itemTitle) {
      case "Articles":
        return isPro ? `${stats.articles}` : `${stats.articles}/5`;
      case "Tags":
        return `${stats.tags}`;
      case "Media":
        return formatBytes(stats.storageBytes);
      case "Members":
        // Only show if PRO and more than 1 member
        return isPro && stats.members > 1 ? `${stats.members}` : null;
      default:
        return null;
    }
  };

  // Regrouper les items par catégorie
  const itemsByCategory = navigationItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, NavigationItem[]>,
  );

  const shouldShowCategory = (items: NavigationItem[]): boolean => {
    if (!NOT_ALLOWED_HIDDEN) return true;
    return items.some((item) => hasAccess(item));
  };

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
          if (!shouldShowCategory(items)) return null;

          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive = isItemActive(
                      item.href,
                      item.matchStrategy,
                    );
                    const userHasAccess = hasAccess(item);
                    const isDisabled = item.disabled || !userHasAccess;

                    if (NOT_ALLOWED_HIDDEN && !userHasAccess) {
                      return null;
                    }

                    const Icon = item.icon;
                    const badge = getItemBadge(item.title);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild={!isDisabled}
                          disabled={isDisabled}
                          isActive={isActive}
                          className={
                            isDisabled ? "cursor-not-allowed opacity-50" : ""
                          }
                          tooltip={
                            !userHasAccess
                              ? `${item.title} (No permission)`
                              : item.disabled
                                ? `${item.title} (Premium required)`
                                : undefined
                          }
                        >
                          {isDisabled ? (
                            <div className="flex w-full items-center gap-2 [&>svg]:size-4">
                              {userHasAccess ? <Icon /> : <Ban />}
                              <span className="flex-1 group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                              {item.showProBadge && (
                                <MiniBadge
                                  tier="PRO"
                                  size="sm"
                                  className="group-data-[collapsible=icon]:hidden"
                                />
                              )}
                            </div>
                          ) : (
                            <Link href={item.href}>
                              <Icon />
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                        {badge && !isDisabled && (
                          <SidebarMenuBadge className="bg-secondary px-1.5">
                            {badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterItem user={user} isVerified={user.emailVerified} />
      </SidebarFooter>
    </Sidebar>
  );
};

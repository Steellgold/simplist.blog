"use client";

import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react";
import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { HttpMethodIcon } from "@/components/api-route-icons";
import { SearchButton } from "@/components/search-button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@simplist/ui/components/sidebar";
import { Check, Globe, Package, Webhook } from "lucide-react";

export type SidebarItem = {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  category?: string;
  order?: number;
};

type Props = {
  items: SidebarItem[];
};

type Mode = "sdk" | "api" | "webhooks";

type ModeConfig = {
  icon: LucideIcons.LucideIcon;
  title: string;
  subtitle: string;
  route: string;
  pathPrefix?: string;
};

const MODE_CONFIG: Record<Mode, ModeConfig> = {
  sdk: {
    icon: Package,
    title: "SDK Docs",
    subtitle: "Client Library",
    route: "/",
    pathPrefix: "",
  },
  api: {
    icon: Globe,
    title: "REST API",
    subtitle: "Endpoints",
    route: "/api/index",
    pathPrefix: "/api",
  },
  webhooks: {
    icon: Webhook,
    title: "Webhooks",
    subtitle: "Builder",
    route: "/webhooks",
    pathPrefix: "/webhooks",
  },
};

export const AppSidebar = ({ items }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const httpMethodIcons = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

  const getCurrentMode = (): Mode => {
    if (pathname.startsWith("/webhooks")) return "webhooks";
    if (pathname.startsWith("/api")) return "api";
    return "sdk";
  };

  const toggleMode = (mode: Mode) => {
    router.push(MODE_CONFIG[mode].route);
  };

  const currentMode = getCurrentMode();
  const currentConfig = MODE_CONFIG[currentMode];

  const filteredItems = items.filter((item) => {
    if (currentMode === "sdk") {
      return (
        !item.href.startsWith("/api") && !item.href.startsWith("/webhooks")
      );
    }
    return item.href.startsWith(currentConfig.pathPrefix || "");
  });

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div
                      className={cn(
                        "flex aspect-square size-8 items-center justify-center rounded-lg",
                        "bg-border text-foreground",
                      )}
                    >
                      <currentConfig.icon size={20} />
                    </div>

                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium">{currentConfig.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {currentConfig.subtitle}
                      </span>
                    </div>

                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width)"
                  align="start"
                >
                  {(Object.keys(MODE_CONFIG) as Mode[]).map((mode) => {
                    const config = MODE_CONFIG[mode];
                    const Icon = config.icon;
                    return (
                      <DropdownMenuItem
                        key={mode}
                        onClick={() => toggleMode(mode)}
                      >
                        <Icon />
                        <span>{config.title}</span>
                        {currentMode === mode && <Check className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchButton />
      </SidebarHeader>

      <SidebarContent>
        {(() => {
          const groupedItems = filteredItems.reduce(
            (acc, item) => {
              const category = item.category || "";
              if (!acc[category]) acc[category] = [];
              acc[category].push(item);
              return acc;
            },
            {} as Record<string, SidebarItem[]>,
          );

          return Object.entries(groupedItems).map(
            ([category, categoryItems]) => (
              <SidebarGroup key={category || "no-category"}>
                {category && <SidebarGroupLabel>{category}</SidebarGroupLabel>}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categoryItems.map((item) => {
                      const Icon =
                        item.icon && (LucideIcons as any)[item.icon]
                          ? ((LucideIcons as any)[item.icon] as ComponentType<{
                              className?: string;
                            }>)
                          : null;

                      const isActive = pathname === item.href;
                      const isHttpMethodIcon =
                        item.icon && httpMethodIcons.has(item.icon);

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link
                              href={item.href}
                              className="flex items-center gap-2"
                            >
                              {isHttpMethodIcon && (
                                <HttpMethodIcon
                                  method={item.icon as any}
                                  size="sm"
                                />
                              )}
                              {!isHttpMethodIcon && Icon && (
                                <Icon className="size-4" />
                              )}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ),
          );
        })()}
      </SidebarContent>
    </Sidebar>
  );
};

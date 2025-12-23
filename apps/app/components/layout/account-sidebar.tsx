"use client";

import type { User } from "@/lib/auth-client";
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
  SidebarMenuItem,
} from "@simplist/ui/components/sidebar";
import { ChevronLeft, Shield, Trash2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { SidebarFooterItem } from "./sidebar-footer-item";

interface AccountSidebarProps {
  user: User;
}

const accountNavigationItems = [
  {
    title: "Information",
    icon: UserIcon,
    href: "/account/settings",
  },
  {
    title: "Security",
    icon: Shield,
    href: "/account/settings/security",
  },
  {
    title: "Account",
    icon: Trash2,
    href: "/account/settings/account",
  },
];

export const AccountSidebar: FC<AccountSidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    return pathname === href;
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-pointer" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5.5 items-center justify-center rounded-md">
                  <ChevronLeft className="size-3" />
                </div>
                <span className="truncate font-semibold">Back to Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavigationItems.map((item) => {
                const isActive = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterItem user={user} isVerified={user.emailVerified} />
      </SidebarFooter>
    </Sidebar>
  );
};

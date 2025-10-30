"use client";

import { LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { ClientOnly } from "@/components/ui/client-only"
import { authClient, type User } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { UserIconAvatar } from "@/components/icon-avatar";

interface AccountItemSidebarProps {
  user: User
}

export const AccountItemSidebar = ({ user }: AccountItemSidebarProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    toast.promise(
      authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
          },
        },
      }), {
        loading: "Logging out...",
        success: "Logged out successfully",
        error: "Failed to log out",
      }
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ClientOnly>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserIconAvatar
                  user={user}
                  size="md"
                  rounded={0}
                />

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
                  <UserIconAvatar
                    user={user}
                    size="md"
                    rounded={0}
                  />

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/account/settings">
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
              >
                {isLoading ? <Spinner /> : <LogOut />}
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
"use client";

import { UserIconAvatar } from "@/components/icon-avatar";
import { authClient, type User } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLink,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { ClientOnly } from "@simplist/ui/components/shared/client-only";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@simplist/ui/components/sidebar";
import { Spinner } from "@simplist/ui/components/spinner";
import { LogOut, MailWarning, Mailbox, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarFooterItemProps {
  user: User
  isVerified?: boolean
}

export const SidebarFooterItem = ({ user, isVerified = false }: SidebarFooterItemProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSended, setIsSended] = useState<boolean>(false);

  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    toast.promise(
      authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsLoading(false);
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

  const handleSendVerificationEmail = async () => {
    toast.promise(
      authClient.sendVerificationEmail({
        email: user.email,
      }), {
        loading: "Resending verification email...",
        success: () => {
          setIsSended(true);
          return "Verification email sent";
        },
        error: () => {
          return "Failed to send verification email";
        },
      }
    )
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ClientOnly>
          <DropdownMenu>
            <div>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn("border border-sidebar-border bg-sidebar-accent/30 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", {
                    "border-b-0 rounded-b-none": !isVerified
                  })}
                >
                  <UserIconAvatar
                    user={user}
                    size="md"
                    rounded={0}
                  />

                  <div className="flex flex-row items-center gap-2 w-full">
                    <div className="flex flex-col flex-1">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {!isVerified && (
                <div className={cn(
                  "flex items-center gap-1 w-full py-0.5",
                  "rounded-md rounded-t-none flex items-center justify-center text-xs border-r border-l border-b", {
                    "bg-yellow-500/30 text-yellow-500": !isSended,
                    "bg-cyan-500/30 text-cyan-200": isSended,
                  }
                )}>
                  <MailWarning className="size-3" />
                  {isSended ? "Email sent" : "Email not verified"}
                </div>
              )}
            </div>

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

              {!isVerified && (
                <>
                  <DropdownMenuItem onClick={handleSendVerificationEmail} disabled={isSended}>
                    {isSended ? <Mailbox /> : <MailWarning />}
                    {isSended ? "Email sent" : "Resend verification email"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItemLink as={Link} href="/account/settings">
                <Settings />
                Settings
              </DropdownMenuItemLink>

              <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
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

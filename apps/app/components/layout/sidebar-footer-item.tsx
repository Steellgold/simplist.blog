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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@simplist/ui/components/sidebar";
import { Spinner } from "@simplist/ui/components/spinner";
import { LogOut, MailWarning, Mailbox, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarFooterItemProps {
  user: User;
  isVerified?: boolean;
}

export const SidebarFooterItem = ({
  user,
  isVerified = false,
}: SidebarFooterItemProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setSent] = useState<boolean>(false);

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
      }),
      {
        loading: "Logging out...",
        success: "Logged out successfully",
        error: "Failed to log out",
      },
    );
  };

  const handleSendVerificationEmail = async () => {
    toast.promise(
      authClient.sendVerificationEmail({
        email: user.email,
      }),
      {
        loading: "Resending verification email...",
        success: () => {
          setSent(true);
          return "Verification email sent";
        },
        error: () => {
          return "Failed to send verification email";
        },
      },
    );
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
                  className={cn(
                    "border-sidebar-border bg-sidebar-accent/30 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border",
                    {
                      "rounded-b-none border-b-0": !isVerified,
                    },
                  )}
                >
                  <UserIconAvatar user={user} size="md" rounded={0} />

                  <div className="flex w-full flex-row items-center gap-2">
                    <div className="flex flex-1 flex-col">
                      <span className="truncate font-semibold">
                        {user.name}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {!isVerified && (
                <div
                  className={cn(
                    "flex w-full items-center gap-1 py-0.5",
                    "flex items-center justify-center rounded-md rounded-t-none border-r border-b border-l text-xs",
                    {
                      "bg-yellow-500/30 text-yellow-500": !isSent,
                      "bg-cyan-500/30 text-cyan-200": isSent,
                    },
                  )}
                >
                  <MailWarning className="size-3" />
                  {isSent ? "Email sent" : "Email not verified"}
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
                  <UserIconAvatar user={user} size="md" rounded={0} />

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {!isVerified && (
                <>
                  <DropdownMenuItem
                    onClick={handleSendVerificationEmail}
                    disabled={isSent}
                  >
                    {isSent ? <Mailbox /> : <MailWarning />}
                    {isSent ? "Email sent" : "Resend verification email"}
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
  );
};

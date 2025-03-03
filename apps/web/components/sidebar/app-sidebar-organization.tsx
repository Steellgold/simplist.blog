"use client"

import { authClient } from "@/lib/auth-client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Rendered } from "@workspace/ui/components/rendered";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ToastAction } from "@workspace/ui/components/toast";
import { toast } from "@workspace/ui/hooks/use-toast";
import { Building, ChevronsUpDown, Plus } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { NewOrganization } from "../new-organization";
import Link from "next/link";
import { Component } from "@workspace/ui/components/utils/component";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState } from "react";
import { PlanName } from "@workspace/ui/lib/pricing";

type AppSidebarOrganizationProps = {
  side?: "bottom" | "right" | "top" | "left" | undefined;
}

export const AppSidebarOrganization: Component<AppSidebarOrganizationProps> = ({ side }) => {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data: activeOrganization, isPending: isActiveOrganizationPending } = authClient.useActiveOrganization();
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations();
  
  const { list } = authClient.subscription;

  const [plan, setPlan] = useState<string>("Hobby");

  useEffect(() => {
    const fetchPlan = async() => {
      const { data } = await list({
        query: {
          referenceId: activeOrganization?.id
        }
      });

      const plan = data?.[0];
      if (plan) setPlan(plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1));
    }

    if (activeOrganization) {
      fetchPlan();
    }
  }, [activeOrganization, list]);


  const router = useRouter();
  const path = usePathname();

  const { isMobile } = useSidebar();

  if (path.startsWith("/account")) {
    return (
      <Rendered>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" asChild>
              <Link href="/">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background/20">
                  <Building className="size-4" />
                </div>

                <div className="font-medium">Go to dashboard</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Rendered>
    );
  }

  if (!session || isSessionPending || isActiveOrganizationPending || isOrganizationsPending) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (!organizations || organizations.length === 0) {
    return (
      <Rendered>
        <SidebarMenu>
          <SidebarMenuItem>
            <NewOrganization>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background/20">
                  <Plus className="size-4" />
                </div>

                <div className="font-medium">
                  Add organization
                </div>
              </SidebarMenuButton>
            </NewOrganization>
          </SidebarMenuItem>
        </SidebarMenu>
      </Rendered>
    )
  }

  return (
    <Rendered>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                {activeOrganization ? (
                  <>
                    <div className={cn(
                      "flex aspect-square size-8 items-center justify-center rounded-lg", {
                        "bg-sidebar-primary text-sidebar-primary-foreground": !activeOrganization.logo,
                        "bg-muted text-muted-foreground": activeOrganization.logo
                      }
                    )}>
                      {
                        activeOrganization.logo ?
                          <Image src={activeOrganization.logo} alt={activeOrganization.name} className="size-6" width={48} height={48} /> :
                          <Building className="size-5" />
                      }
                    </div>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeOrganization.name}
                      </span>

                      <span className="truncate text-xs">
                        {plan}
                      </span>
                    </div>
                  </>
                ) : (
                  // Show "Select organization"
                  <div className="flex flex-col flex-1">
                    <div className="font-medium">Select organization</div>
                    <div className="text-xs text-muted-foreground">No organization selected</div>
                  </div>
                )}

                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={
                side ?? (isMobile ? "bottom" : "right")
              }
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={async() => {
                    if (!activeOrganization) {
                      await authClient.organization.setActive({
                        organizationId: org.id,
                        fetchOptions: {
                          onError: (error) => {
                            toast({
                              title: "Error setting active organization",
                              description: error.error.message ?? "An error occurred",
                              variant: "destructive"
                            });
                          },
                          onRequest: () => {
                            toast({
                              title: "Setting active organization",
                              description: "Please wait while we set your active organization"
                            });
                          }
                        }
                      });
                      return;
                    }

                    if (activeOrganization.id === org.id) {
                      return;
                    }

                    await authClient.organization.setActive({
                      organizationId: org.id,
                      fetchOptions: {
                        onError: (error) => {
                          toast({
                            title: "Error setting active organization",
                            description: error.error.message ?? "An error occurred",
                            variant: "destructive"
                          });
                        },
                        onRequest: () => {
                          toast({
                            title: "Setting active organization",
                            description: "Please wait while we set your active organization"
                          });
                        },
                        onSuccess: () => {
                          toast({
                            title: "Active organization set",
                            description: `You are now viewing ${org.name} organization`,
                            variant: "default",
                            action: (
                              <ToastAction
                                altText="Go to"
                                onClick={() => router.push("/")}
                              >
                                Navigate to
                              </ToastAction>
                            )
                          });
                        }
                        // TODO: On request waiting show loading state
                      }
                    });
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {
                      org.logo ?
                        <Image src={org.logo} alt={org.name} className="size-4" width={32} height={32} /> :
                        <Building className="size-4" />
                    }
                  </div>
                  {org.name}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <NewOrganization>
                <SidebarMenuButton className="gap-2 py-3 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background/20">
                    <Plus className="size-4" />
                  </div>

                  <div className="font-medium text-muted-foreground">
                    Add organization
                  </div>
                </SidebarMenuButton>
              </NewOrganization>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </Rendered>
  )
}
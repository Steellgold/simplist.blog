"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { RadioPlanSelector } from "@workspace/ui/components/radio-plan-selector";
import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { Component } from "@workspace/ui/components/utils/component";
import { toast } from "@workspace/ui/hooks/use-toast";
import { cn } from "@workspace/ui/lib/utils";
import { Building, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";
import { ReactElement, useState } from "react";
import { z } from "zod";

type NewOrganizationProps = {
  isFrame?: boolean;
};

const schema = z.object({
  organizationName: z.string()
    .min(3, "Organization name must be at least 3 characters long.")
    .max(50, "Organization name must be at most 50 characters long.")
    .regex(/^[a-zA-Z0-9\s]+$/, "Organization name must only contain letters, numbers, and spaces.")
    .nonempty("Organization name is required.")
    .refine(value => value.trim() !== "", {
      message: "Organization name cannot be empty.",
    })
});

export const NoOrganizations: Component<NewOrganizationProps> = ({ isFrame }) => {
  const [plan, setPlan] = useState<"hobby" | "pro" | "business">("hobby");
  const [isPending, setPending] = useState(false);
  const router = useRouter();

  return (
    <>
      <BreadcrumbSetter items={[{ label: "Home", href: "/" }, { label: "Create your organization" }]} />

      <div className="flex justify-center">
        <div className={cn(
          "w-full max-w-md space-y-8", {
            "md:p-8": !isFrame,
          }
        )}>
          {!isFrame && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-1xl md:text-2xl font-semibold tracking-tight">Create your organization</h1>
              <p className="text-sm text-muted-foreground text-center">
                You don&apos;t have an organization yet. Ready to create one?
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={async (event) => {
            if (isPending) return;

            const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            const randomChars = (): string => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
            event.preventDefault();

            const organizationName = event.currentTarget["organization-name"].value;

            const result = schema.safeParse({ organizationName });
            if (!result.success) {
              toast({
                title: "Invalid organization name",
                description: result.error.errors[0]?.message || "An error occurred while creating the organization.",
                variant: "destructive"
              })
              return;
            }

            const organizationSlug = `${result.data.organizationName.toLowerCase().replace(/\s/g, "-")}-${randomChars()}`;

            await authClient.organization.create({
              name: result.data.organizationName,
              slug: organizationSlug,
              metadata: {
                plan
              },
              fetchOptions: {
                onError: (error) => {
                  setPending(false);
                  toast({
                    title: "Error creating organization",
                    description: error.error.message || "An error occurred while creating the organization.",
                    variant: "destructive"
                  })
                },
                onRequest: () => {
                  setPending(true);
                  toast({
                    title: "Creating organization",
                    description: "Please wait while we create your organization."
                  })
                },
                onSuccess: async () => {
                  toast({
                    title: "Organization created",
                    description: "Your organization has been created successfully.",
                  })

                  if (plan === "hobby") {
                    await authClient.organization.setActive({
                      organizationSlug,
                      fetchOptions: {
                        onError: (error) => {
                          setPending(false);
                          toast({
                            title: "Error setting active organization",
                            description: error.error.message || "An error occurred while setting the active organization.",
                            variant: "destructive"
                          })
                        },
                        onRequest: () => {
                          setPending(true);
                          toast({
                            title: "Setting active organization",
                            description: "Please wait while we set your organization as active."
                          })
                        },
                        onSuccess: () => {
                          router.refresh();
                        }
                      }
                    })
                  } else {
                    // createOrganization(formData);
                  }
                }
              }
            })
          }}>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="organization-name"
                  className="peer ps-9"
                  placeholder="Organization Name"
                  name="organization-name"
                  type="text"
                  aria-label="Organization Name"
                  required
                  disabled={isPending}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Building size={16} strokeWidth={2} aria-hidden="true" />
                </div>
              </div>
            </div>

            <RadioPlanSelector
              onChange={(value: string) => setPlan(
                value === "1" ? "hobby" :
                value === "2" ? "pro" :
                "business"
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? "Creating..." : (
                plan === "hobby" ? "Create organization" :
                `Continue with ${plan === "pro" ? "Pro" : "Business"}`
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By creating a organization, you agree to our{" "}
            <a className="underline hover:no-underline" href="#">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
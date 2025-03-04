import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

export type BadgeSubscriptionVariant = "subscriptionActive" | "subscriptionCanceled" | "subscriptionIncomplete" | "subscriptionIncompleteExpired" | "subscriptionPastDue" | "subscriptionTrialing" | "subscriptionUnpaid" | "subscriptionUnknown";

const badgeVariants = cva(
  // rounded-full
  "inline-flex items-center justify-center rounded border px-1.5 text-xs font-medium leading-normal transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",

        // Subscription Status
        subscriptionActive: "border-transparent bg-green-200 text-green-600",
        subscriptionCanceled: "border-transparent bg-red-200 text-red-600",
        subscriptionIncomplete: "border-transparent bg-yellow-200 text-yellow-600",
        subscriptionIncompleteExpired: "border-transparent bg-yellow-200 text-yellow-600",
        subscriptionPastDue: "border-transparent bg-red-200 text-red-600",
        subscriptionTrialing: "border-transparent bg-blue-200 text-blue-600",
        subscriptionUnpaid: "border-transparent bg-red-200 text-red-600",
        subscriptionUnknown: "border-transparent bg-gray-200 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

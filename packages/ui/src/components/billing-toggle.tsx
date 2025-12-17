import type { SubscriptionInterval } from "@simplist/limits";
import { FC } from "react";
import { cn } from "../lib/utils";

export interface BillingToggleProps {
  value: SubscriptionInterval;
  onValueChange: (value: SubscriptionInterval) => void;
  className?: string;
  showSavings?: boolean;
}

export const BillingToggle: FC<BillingToggleProps> = ({ value, onValueChange, className, showSavings = true }) => {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border bg-card/80 px-1.5 py-1 text-xs shadow-sm", className)}>
      <button
        type="button"
        onClick={() => onValueChange("monthly")}
        className={cn("px-3 py-1 rounded-full transition-colors", {
          "bg-primary text-primary-foreground": value === "monthly",
          "text-muted-foreground hover:text-foreground": value !== "monthly"
        })}
      >
        Monthly
      </button>

      <button
        type="button"
        onClick={() => onValueChange("yearly")}
        className={cn("px-3 py-1 rounded-full transition-colors flex items-center gap-1", {
          "bg-primary text-primary-foreground": value === "yearly",
          "text-muted-foreground hover:text-foreground": value !== "yearly"
        })}
      >
        Yearly
        {showSavings && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wide", {
                "bg-secondary-foreground/45 text-white dark:bg-secondary dark:text-primary": value === "yearly",
                "bg-emerald-500/35 dark:bg-emerald-500/45 text-foreground/80 dark:text-foreground/80": value !== "yearly"
              }
            )}
          >
            -20%
          </span>
        )}
      </button>
    </div>
  );
};
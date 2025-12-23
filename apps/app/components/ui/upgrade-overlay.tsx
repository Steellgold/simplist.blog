"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@simplist/ui/components/button";
import Link from "next/link";
import { MiniBadge } from "./mini-badge";

interface UpgradeOverlayProps {
  title: string;
  description: string;
  href?: string;
  buttonText?: string;
  className?: string;
}

export const UpgradeOverlay = ({
  title,
  description,
  href = "/pricing",
  buttonText = "Unlock with Pro",
  className = "",
}: UpgradeOverlayProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-lg backdrop-blur-sm transition-opacity duration-200",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        className,
      )}
    >
      <div className="via-background/80 to-background/60 absolute inset-0 bg-gradient-to-t from-yellow-500/20" />
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="flex max-w-xs flex-col items-center gap-4 text-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-foreground text-base font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <Link
            href={href}
            className={buttonVariants({ size: "sm", variant: "default" })}
          >
            <MiniBadge tier="PRO" size="sm" />
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

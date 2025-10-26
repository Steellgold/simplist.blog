import { buttonVariants } from "@/components/ui/button";
import { MiniBadge } from "@/components/ui/mini-badge";
import Link from "next/link";

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
  return (
    <div className={`absolute inset-0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-background/80 to-background/60" />
      <div className="relative h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center gap-4 max-w-xs">
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
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

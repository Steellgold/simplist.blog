import { cn } from "@simplist/ui/lib/utils";
import { FC, type ReactNode } from "react";

type SectionWrapperProps = {
  children: ReactNode;
  variant?: "default" | "accent";
  className?: string;
};

export const SectionWrapper: FC<SectionWrapperProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  return (
    <section
      className={cn(
        "relative",
        {
          "bg-secondary/10 border-border/50 border-y backdrop-blur-xl":
            variant === "accent",
        },
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
};

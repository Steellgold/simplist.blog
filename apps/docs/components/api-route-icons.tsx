import { cn } from "@/lib/utils";
import { FC } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpMethodIconProps {
  method: HttpMethod;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const methodStyles: Record<HttpMethod, { bg: string; text: string }> = {
  GET: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  POST: {
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
  },
  PUT: {
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
  },
  PATCH: {
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
  },
  DELETE: {
    bg: "bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
  },
};

const sizeStyles = {
  sm: "text-[9px] px-1.5 py-0.5 min-w-[32px]",
  md: "text-[10px] px-2 py-1 min-w-[42px]",
  lg: "text-xs px-2.5 py-1.5 min-w-[52px]",
};

export const HttpMethodIcon: FC<HttpMethodIconProps> = ({
  method,
  size = "md",
  className,
}) => {
  const styles = methodStyles[method];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-mono font-bold tracking-wide uppercase",
        styles.bg,
        styles.text,
        sizeStyles[size],
        className,
      )}
    >
      {method}
    </span>
  );
};

"use client";

import { cn } from "@/lib/utils";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface InlineRouteProps {
  method: HttpMethod;
  path: string;
  className?: string;
}

interface InlineRouteLinkProps extends InlineRouteProps {
  href: string;
}

const methodStyles: Record<
  HttpMethod,
  { bg: string; text: string; border: string }
> = {
  GET: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  POST: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  PUT: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  PATCH: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  DELETE: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
  },
};

export function InlineRoute({ method, path, className }: InlineRouteProps) {
  const styles = methodStyles[method];

  return (
    <code
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 align-middle font-mono text-sm",
        styles.bg,
        styles.border,
        className,
      )}
    >
      <span
        className={cn(
          "text-[10px] font-bold tracking-wide uppercase",
          styles.text,
        )}
      >
        {method}
      </span>
      <span className="text-foreground/80">{path}</span>
    </code>
  );
}

export function InlineRouteLink({
  method,
  path,
  href,
  className,
}: InlineRouteLinkProps) {
  const styles = methodStyles[method];

  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 align-middle font-mono text-sm",
        "transition-all duration-150 hover:brightness-110",
        "focus:ring-2 focus:ring-offset-1 focus:outline-none",
        styles.bg,
        styles.border,
        styles.text.replace("text-", "focus:ring-"),
        className,
      )}
    >
      <span
        className={cn(
          "text-[10px] font-bold tracking-wide uppercase",
          styles.text,
        )}
      >
        {method}
      </span>
      <span className="text-foreground/80 underline-offset-2 group-hover:underline">
        {path}
      </span>
    </a>
  );
}

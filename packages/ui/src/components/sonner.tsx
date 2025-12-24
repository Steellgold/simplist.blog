"use client";

import {
  CircleCheck,
  CircleInfo,
  CircleXmark,
  TriangleExclamationFill,
} from "@gravity-ui/icons";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import { Spinner } from "@simplist/ui/components/spinner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <CircleInfo className="size-4" />,
        warning: <TriangleExclamationFill className="size-4" />,
        error: <CircleXmark className="size-4" />,
        loading: <Spinner className="size-4" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      richColors
      {...props}
    />
  );
};

export { Toaster, toast };

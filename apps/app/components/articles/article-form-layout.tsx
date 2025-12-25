"use client";

import { useEditorFullscreen } from "@/hooks/use-editor-fullscreen";
import { cn } from "@simplist/ui/lib/utils";
import { FC, ReactNode } from "react";

type ArticleFormLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const ArticleFormLayout: FC<ArticleFormLayoutProps> = ({
  title,
  description,
  children,
}) => {
  const fullscreenContext = useEditorFullscreen();
  const isFullscreen = fullscreenContext?.isFullscreen ?? false;

  return (
    <div
      className={cn("container mx-auto flex flex-col gap-6", {
        "max-w-7xl": !isFullscreen,
        "max-w-4xl": isFullscreen
      })}
    >
      {!isFullscreen && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      {children}
    </div>
  );
};

"use client";

import { Button } from "@simplist/ui/components/button";
import { ScrollArea, ScrollBar } from "@simplist/ui/components/scroll-area";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn, toPascalCase } from "@simplist/ui/lib/utils";
import * as LucideIcons from "lucide-react";
import { ComponentType } from "react";
import { IconData } from "./types";

type IconGridProps = {
  icons: IconData[];
  selectedIcon?: IconsEnumType;
  onSelect: (iconName: string) => void;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  isDialog?: boolean;
};

export function IconGrid({
  icons,
  selectedIcon,
  onSelect,
  hasMore,
  loadMoreRef,
  isMobile = false,
  isDialog = false,
}: IconGridProps) {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Allow vertical scrolling with mouse wheel
    const scrollContainer = e.currentTarget.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;
    if (scrollContainer) {
      e.stopPropagation();
      scrollContainer.scrollTop += e.deltaY;
    }
  };

  return (
    <div onWheel={handleWheel}>
      <ScrollArea
        className={cn(
          "border-input/30 w-full border-t",
          isMobile ? "h-[400px]" : "h-[320px]",
        )}
      >
        <div className="p-2">
          <div className="space-y-2 space-x-2">
            {icons.map((icon) => {
              const IconComponent = (
                LucideIcons as unknown as Record<
                  string,
                  ComponentType<{ className?: string }>
                >
              )[toPascalCase(icon.name)];

              if (!IconComponent) return null;

              const isSelected = isDialog
                ? selectedIcon === icon.name
                : selectedIcon === icon.name;

              return (
                <Button
                  key={icon.name}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(icon.name);
                  }}
                  title={icon.name}
                >
                  <IconComponent
                    className={cn(isMobile ? "size-6" : "size-5")}
                  />
                </Button>
              );
            })}
          </div>

          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex h-4 w-full items-center justify-center"
            >
              <div className="text-muted-foreground text-xs">
                Loading more icons...
              </div>
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}

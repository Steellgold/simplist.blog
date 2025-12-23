"use client";

import { Button } from "@simplist/ui/components/button";
import { ScrollArea, ScrollBar } from "@simplist/ui/components/scroll-area";
import { useRef } from "react";

type IconCategoriesProps = {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
};

export function IconCategories({
  categories,
  selectedCategory,
  onCategorySelect,
}: IconCategoriesProps) {
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY === 0) return;
    e.stopPropagation();

    // Find Radix UI's internal scrollable viewport
    const scrollContainer = e.currentTarget.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollLeft += e.deltaY;
    }
  };

  return (
    <div onWheel={handleWheel}>
      <ScrollArea className="mt-1.5 h-9.5 w-full">
        <div ref={categoryScrollRef} className="flex gap-2 p-1">
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => onCategorySelect(category)}
              className="h-6 shrink-0 text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

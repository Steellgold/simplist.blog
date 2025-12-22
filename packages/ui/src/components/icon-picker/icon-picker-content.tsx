"use client";

import { Command, CommandInput } from "@simplist/ui/components/command";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { IconCategories } from "./icon-categories";
import { IconGrid } from "./icon-grid";
import { IconData } from "./types";

type IconPickerContentProps = {
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder: string;
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  filteredIcons: IconData[];
  visibleIcons: IconData[];
  selectedIcon?: IconsEnumType;
  onSelect: (iconName: string) => void;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  isDialog?: boolean;
};

export function IconPickerContent({
  search,
  onSearchChange,
  searchPlaceholder,
  categories,
  selectedCategory,
  onCategorySelect,
  filteredIcons,
  visibleIcons,
  selectedIcon,
  onSelect,
  hasMore,
  loadMoreRef,
  isMobile = false,
  isDialog = false,
}: IconPickerContentProps) {
  return (
    <Command shouldFilter={false} className="border">
      <CommandInput
        placeholder={searchPlaceholder}
        className="h-14"
        value={search}
        onValueChange={onSearchChange}
      />

      <IconCategories
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />

      {filteredIcons.length === 0 ? (
        <div className="text-muted-foreground py-6 text-center text-sm">
          No icons found for &quot;{search}&quot;
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </div>
      ) : (
        <IconGrid
          icons={visibleIcons}
          selectedIcon={selectedIcon}
          onSelect={onSelect}
          hasMore={hasMore}
          loadMoreRef={loadMoreRef}
          isMobile={isMobile}
          isDialog={isDialog}
        />
      )}
    </Command>
  );
}

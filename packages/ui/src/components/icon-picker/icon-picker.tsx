"use client";

import { Button } from "@simplist/ui/components/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@simplist/ui/components/drawer";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { toPascalCase } from "@simplist/ui/lib/utils";
import * as LucideIcons from "lucide-react";
import { ComponentType, FC, useMemo } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { IconPickerContainer } from "./icon-picker-container";
import { IconPickerContent } from "./icon-picker-content";
import { IconPickerTrigger } from "./icon-picker-trigger";
import { DEFAULT_ICONS_PER_BATCH, IconPickerProps } from "./types";
import { useIconFilter } from "./use-icon-filter";
import { useIconPagination } from "./use-icon-pagination";
import { useIconPicker } from "./use-icon-picker";

export const IconPicker: FC<IconPickerProps> = ({
  value,
  onValueChange,
  placeholder = "Select an icon",
  className,
  iconsPerBatch = DEFAULT_ICONS_PER_BATCH,
  disabled = false,
  dialog = false,
  dialogTrigger,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // State management
  const picker = useIconPicker({ value, iconsPerBatch, dialog });

  // Filtering and categories
  const { categories, filteredIcons, searchPlaceholder } = useIconFilter(
    picker.search,
    picker.category,
  );

  // Pagination (lazy loading)
  const { visibleItems, hasMore, loadMoreRef } = useIconPagination(
    filteredIcons,
    picker.iconsPerBatch,
    picker.open,
  );

  // Icon rendering for drawer header
  const SelectedIcon = useMemo(() => {
    if (!value) return null;
    const PascalCase = toPascalCase(value);
    return (
      (
        LucideIcons as unknown as Record<
          string,
          ComponentType<{ className?: string }>
        >
      )[PascalCase] || null
    );
  }, [value]);

  // Handlers
  const handleSelect = (iconName: string) => {
    if (dialog) {
      picker.setSelected(iconName as IconsEnumType);
    } else {
      onValueChange?.(iconName as IconsEnumType);
      setTimeout(() => {
        picker.close();
      }, 0);
    }
  };

  const handleCategorySelect = (cat: string) => {
    picker.setCategory(cat);
    picker.setSearch("");
  };

  const handleDialogConfirm = () => {
    if (picker.selected) {
      onValueChange?.(picker.selected);
    }
    picker.close();
  };

  // Trigger component
  const trigger = dialogTrigger ?? (
    <IconPickerTrigger
      value={value}
      placeholder={placeholder}
      open={picker.open}
      onClick={() => picker.setOpen(!picker.open)}
      disabled={disabled}
      className={className}
      showChevron={!dialog}
    />
  );

  // Content component
  const content = (
    <>
      {dialog && (
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Select an icon from the list below. You can search by name or filter
            by category.
          </DialogDescription>
        </DialogHeader>
      )}

      {!dialog && !isDesktop && (
        <DrawerHeader className="mt-3 flex flex-col items-start">
          <DrawerTitle>
            <div className="flex items-center gap-2">
              <div className="bg-accent/60 rounded-sm p-1.5 *:size-4.5">
                {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              </div>
              <span className="text-lg font-semibold">
                {value
                  ? value
                      .replace(/[-_]/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : placeholder}
              </span>
            </div>
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground items-start text-left text-sm">
            Select an icon from the list below. You can search by name or filter
            by category.
          </DrawerDescription>
        </DrawerHeader>
      )}

      {!dialog && !isDesktop ? (
        <div className="*:rounded-none">
          <IconPickerContent
            search={picker.search}
            onSearchChange={picker.setSearch}
            searchPlaceholder={searchPlaceholder}
            categories={categories}
            selectedCategory={picker.category}
            onCategorySelect={handleCategorySelect}
            filteredIcons={filteredIcons}
            visibleIcons={visibleItems}
            selectedIcon={dialog ? picker.selected : value}
            onSelect={handleSelect}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            isMobile={!isDesktop}
            isDialog={dialog}
          />
        </div>
      ) : (
        <IconPickerContent
          search={picker.search}
          onSearchChange={picker.setSearch}
          searchPlaceholder={searchPlaceholder}
          categories={categories}
          selectedCategory={picker.category}
          onCategorySelect={handleCategorySelect}
          filteredIcons={filteredIcons}
          visibleIcons={visibleItems}
          selectedIcon={dialog ? picker.selected : value}
          onSelect={handleSelect}
          hasMore={hasMore}
          loadMoreRef={loadMoreRef}
          isMobile={!isDesktop}
          isDialog={dialog}
        />
      )}

      {dialog && (
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => picker.handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleDialogConfirm}
            disabled={!picker.selected}
          >
            Select Icon
          </Button>
        </DialogFooter>
      )}
    </>
  );

  return (
    <IconPickerContainer
      open={picker.open}
      onOpenChange={picker.handleOpenChange}
      trigger={trigger}
      dialog={dialog}
      isDesktop={isDesktop}
      disabled={disabled}
    >
      {content}
    </IconPickerContainer>
  );
};

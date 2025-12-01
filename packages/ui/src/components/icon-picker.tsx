"use client";

import { Button } from "@simplist/ui/components/button";
import { Command, CommandInput } from "@simplist/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@simplist/ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@simplist/ui/components/popover";
import { ScrollArea, ScrollBar } from "@simplist/ui/components/scroll-area";
import { iconsData } from "@simplist/ui/lib/icons-data";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn, toPascalCase } from "@simplist/ui/lib/utils";
import * as LucideIcons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "../hooks/use-media-query";

const DEFAULT_ICONS_PER_BATCH = 40;

type IconPickerProps = {
  value?: IconsEnumType;
  onValueChange?: (value: IconsEnumType) => void;
  placeholder?: string;
  className?: string;
  iconsPerBatch?: number;
  disabled?: boolean;
  dialog?: boolean;
};

export const IconPicker: FC<IconPickerProps> = ({
  value,
  onValueChange,
  placeholder = "Select an icon",
  className,
  iconsPerBatch = DEFAULT_ICONS_PER_BATCH,
  disabled = false,
  dialog = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [visibleIconCount, setVisibleIconCount] = useState(iconsPerBatch);
  const [selectedIcon, setSelectedIcon] = useState<IconsEnumType | undefined>(value);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Synchronize selectedIcon with value prop when it changes
  useEffect(() => {
    setSelectedIcon(value);
  }, [value]);

  const categories = useMemo(() => {
    const all = new Set<string>();
    iconsData.forEach((icon) => icon.categories.forEach((c) => all.add(c)));
    return [
      "All",
      ...Array.from(all).map(
        (cat) => cat.charAt(0).toUpperCase() + cat.slice(1),
      ),
    ];
  }, []);

  const filteredIcons = useMemo(() => {
    let icons = [...iconsData];

    if (selectedCategory !== "All") {
      icons = icons.filter((icon) =>
        icon.categories.includes(selectedCategory.toLowerCase()),
      );
    }

    if (search) {
      icons = icons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(search.toLowerCase()) ||
          icon.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase()),
          ),
      );
    }

    return icons.sort((a, b) => {
      const aPriority = a.name === "hash" || a.name === "tag";
      const bPriority = b.name === "hash" || b.name === "tag";
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [search, selectedCategory]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleIconCount);
  }, [filteredIcons, visibleIconCount]);

  const searchPlaceholder = useMemo(() => {
    return selectedCategory === "All"
      ? "Search for an icon..."
      : `Search for an icon in ${selectedCategory.toLowerCase()}...`;
  }, [selectedCategory]);

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

  const handleSelect = (iconName: string) => {
    if (dialog) {
      setSelectedIcon(iconName as IconsEnumType);
    } else {
      onValueChange?.(iconName as IconsEnumType);

      setTimeout(() => {
        setOpen(false);
        setSearch("");
        setSelectedCategory("All");
        setVisibleIconCount(iconsPerBatch);
      }, 0);
    }
  };

  const handleDialogConfirm = () => {
    if (selectedIcon) {
      onValueChange?.(selectedIcon);
    }
    setOpen(false);
    setSearch("");
    setSelectedCategory("All");
    setVisibleIconCount(iconsPerBatch);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    // Reset state when closing
    if (!newOpen) {
      setSearch("");
      setSelectedCategory("All");
      setVisibleIconCount(iconsPerBatch);
      if (dialog) {
        setSelectedIcon(value);
      }
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSearch("");
  };

  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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

  const handleIconsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Allow vertical scrolling with mouse wheel
    const scrollContainer = e.currentTarget.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;
    if (scrollContainer) {
      e.stopPropagation();
      scrollContainer.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    setVisibleIconCount(iconsPerBatch);
  }, [search, selectedCategory, iconsPerBatch]);

  useEffect(() => {
    if (!open) return;

    // Lazy loading observer for icons to improve performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleIconCount((prev) =>
              Math.min(prev + iconsPerBatch, filteredIcons.length),
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [
    open,
    filteredIcons.length,
    visibleIconCount,
    iconsPerBatch,
    search,
    selectedCategory,
  ]);

  const hasMoreIcons = visibleIconCount < filteredIcons.length;

  if (dialog) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              className,
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              <span className="truncate text-sm sm:text-base">
                {value
                  ? value
                      .replace(/[-_]/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : placeholder}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select an Icon</DialogTitle>
            <DialogDescription>
              Select an icon from the list below. You can search by name or filter by category.
            </DialogDescription>
          </DialogHeader>

          <IconPickerContent
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            categories={categories}
            handleCategorySelect={handleCategorySelect}
            handleCategoryWheel={handleCategoryWheel}
            categoryScrollRef={categoryScrollRef}
            filteredIcons={filteredIcons}
            visibleIcons={visibleIcons}
            handleSelect={handleSelect}
            hasMoreIcons={hasMoreIcons}
            loadMoreRef={loadMoreRef}
            handleIconsWheel={handleIconsWheel}
            searchPlaceholder={searchPlaceholder}
            value={value}
            isDialog={true}
            selectedIcon={selectedIcon}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDialogConfirm}
              disabled={!selectedIcon}
            >
              Select Icon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              className,
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              <span className="truncate text-sm sm:text-base">
                {value
                  ? value
                      .replace(/[-_]/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : placeholder}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          sideOffset={4}
          align="start"
          ref={pickerRef}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <IconPickerContent
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            categories={categories}
            handleCategorySelect={handleCategorySelect}
            handleCategoryWheel={handleCategoryWheel}
            categoryScrollRef={categoryScrollRef}
            filteredIcons={filteredIcons}
            visibleIcons={visibleIcons}
            handleSelect={handleSelect}
            hasMoreIcons={hasMoreIcons}
            loadMoreRef={loadMoreRef}
            handleIconsWheel={handleIconsWheel}
            searchPlaceholder={searchPlaceholder}
            value={value}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className,
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            <span className="truncate text-sm sm:text-base">
              {value
                ? value
                    .replace(/[-_]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
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
          <DrawerDescription className="text-sm text-muted-foreground items-start text-left">
            Select an icon from the list below. You can search by name or filter
            by category.
          </DrawerDescription>
        </DrawerHeader>

        <div className="*:rounded-none">
          <IconPickerContent
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            categories={categories}
            handleCategorySelect={handleCategorySelect}
            handleCategoryWheel={handleCategoryWheel}
            categoryScrollRef={categoryScrollRef}
            filteredIcons={filteredIcons}
            visibleIcons={visibleIcons}
            handleSelect={handleSelect}
            hasMoreIcons={hasMoreIcons}
            loadMoreRef={loadMoreRef}
            handleIconsWheel={handleIconsWheel}
            searchPlaceholder={searchPlaceholder}
            value={value}
            isMobile={true}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

type IconPickerContentProps = {
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string;
  categories: string[];
  handleCategorySelect: (cat: string) => void;
  handleCategoryWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  categoryScrollRef: React.RefObject<HTMLDivElement | null>;
  filteredIcons: Array<{ name: string; categories: string[]; tags: string[] }>;
  visibleIcons: Array<{ name: string; categories: string[]; tags: string[] }>;
  handleSelect: (iconName: string) => void;
  hasMoreIcons: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  handleIconsWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  searchPlaceholder: string;
  value?: IconsEnumType;
  isMobile?: boolean;
  isDialog?: boolean;
  selectedIcon?: IconsEnumType;
};

function IconPickerContent({
  search,
  setSearch,
  selectedCategory,
  categories,
  handleCategorySelect,
  handleCategoryWheel,
  categoryScrollRef,
  filteredIcons,
  visibleIcons,
  handleSelect,
  hasMoreIcons,
  loadMoreRef,
  handleIconsWheel,
  searchPlaceholder,
  value,
  isMobile = false,
  isDialog = false,
  selectedIcon,
}: IconPickerContentProps) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder={searchPlaceholder}
        className="h-14"
        value={search}
        onValueChange={setSearch}
      />

      {/* Categories section */}
      <div onWheel={handleCategoryWheel}>
        <ScrollArea className="mt-1.5 h-12 w-full">
          <div ref={categoryScrollRef} className="flex gap-2 p-1">
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category)}
                className="shrink-0 text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {filteredIcons.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No icons found for &quot;{search}&quot;
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </div>
      ) : (
        <div onWheel={handleIconsWheel}>
          <ScrollArea
            className={cn(
              "w-full border-input/30 border-t",
              isMobile ? "h-[400px]" : "h-[320px]",
            )}
          >
            <div className="p-2">
              <div className={"space-x-2 space-y-2"}>
                {visibleIcons.map((icon) => {
                  const IconComponent = (
                    LucideIcons as unknown as Record<
                      string,
                      ComponentType<{ className?: string }>
                    >
                  )[toPascalCase(icon.name)];
                  if (!IconComponent) return null;

                  const isSelected = isDialog
                    ? selectedIcon === icon.name
                    : value === icon.name;

                  return (
                    <Button
                      key={icon.name}
                      type="button"
                      variant={isSelected ? "default" : "ghost"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(icon.name);
                      }}
                      title={icon.name}
                      className={cn(isMobile ? "h-14 w-14" : "h-8.5 w-8.5")}
                    >
                      <IconComponent
                        className={cn(isMobile ? "size-6" : "size-5")}
                      />
                    </Button>
                  );
                })}
              </div>

              {hasMoreIcons && (
                <div
                  ref={loadMoreRef}
                  className="w-full h-4 flex items-center justify-center"
                >
                  <div className="text-xs text-muted-foreground">
                    Loading more icons...
                  </div>
                </div>
              )}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      )}
    </Command>
  );
}
"use client";

import * as React from "react";
import { Check, Magnifier } from "@gravity-ui/icons";
import { cn } from "@simplist/ui/lib/utils";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Separator } from "./separator";
import { Spinner } from "./spinner";

/* -----------------------------------------------------------------------------
 * SelectListItem - Base type for items in the list
 * -------------------------------------------------------------------------- */

export interface SelectListItem {
  id: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

/* -----------------------------------------------------------------------------
 * SelectList Root
 * -------------------------------------------------------------------------- */

type SelectListVariant = "single" | "multiple";

interface SelectListContextValue {
  variant: SelectListVariant;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
}

const SelectListContext = React.createContext<SelectListContextValue | null>(
  null,
);

function useSelectListContext() {
  const context = React.useContext(SelectListContext);
  if (!context) {
    throw new Error("SelectList components must be used within a SelectList");
  }
  return context;
}

interface SelectListPropsBase {
  children: React.ReactNode;
  className?: string;
}

interface SelectListPropsMultiple extends SelectListPropsBase {
  variant?: "multiple";
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

interface SelectListPropsSingle extends SelectListPropsBase {
  variant: "single";
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
}

type SelectListProps = SelectListPropsMultiple | SelectListPropsSingle;

function SelectList(props: SelectListProps) {
  const { children, className, variant = "multiple" } = props;

  // Normalize to Set<string> internally
  const selectedIds = React.useMemo(() => {
    if (variant === "single") {
      const singleProps = props as SelectListPropsSingle;
      return singleProps.selectedId
        ? new Set([singleProps.selectedId])
        : new Set<string>();
    }
    return (props as SelectListPropsMultiple).selectedIds;
  }, [variant, props]);

  const toggleSelection = React.useCallback(
    (id: string) => {
      if (variant === "single") {
        const singleProps = props as SelectListPropsSingle;
        // In single mode, clicking the same item deselects it, clicking another selects it
        if (singleProps.selectedId === id) {
          singleProps.onSelectionChange(null);
        } else {
          singleProps.onSelectionChange(id);
        }
      } else {
        const multiProps = props as SelectListPropsMultiple;
        const next = new Set(multiProps.selectedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        multiProps.onSelectionChange(next);
      }
    },
    [variant, props],
  );

  const isSelected = React.useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  return (
    <SelectListContext.Provider
      value={{ variant, selectedIds, toggleSelection, isSelected }}
    >
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </SelectListContext.Provider>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListHeader - Optional header slot (e.g., for image preview)
 * -------------------------------------------------------------------------- */

interface SelectListHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function SelectListHeader({ children, className }: SelectListHeaderProps) {
  return <div className={cn(className)}>{children}</div>;
}

/* -----------------------------------------------------------------------------
 * SelectListSearch - Search input
 * -------------------------------------------------------------------------- */

interface SelectListSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SelectListSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SelectListSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Magnifier className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListContent - Scrollable list container
 * -------------------------------------------------------------------------- */

interface SelectListContentProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

function SelectListContent({
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No items found",
  className,
}: SelectListContentProps) {
  return (
    <div
      className={cn("h-[300px] overflow-y-auto rounded-md border", className)}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : isEmpty ? (
        <div className="text-muted-foreground py-8 text-center text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="p-2">{children}</div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItem - Individual selectable item
 * -------------------------------------------------------------------------- */

interface SelectListItemProps {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function SelectListItemComponent({
  id,
  checked,
  disabled = false,
  onCheckedChange,
  children,
  className,
}: SelectListItemProps) {
  const context = React.useContext(SelectListContext);
  const variant = context?.variant ?? "multiple";

  // Use context if available, otherwise use props
  const isChecked = checked ?? context?.isSelected(id) ?? false;
  const handleChange = onCheckedChange ?? (() => context?.toggleSelection(id));

  if (variant === "single") {
    return (
      <div
        role="option"
        aria-selected={isChecked}
        onClick={() => !disabled && handleChange(!isChecked)}
        className={cn(
          "hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2",
          isChecked && "bg-muted",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {isChecked && <Check className="text-primary h-4 w-4 shrink-0" />}
      </div>
    );
  }

  return (
    <label
      className={cn(
        "hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItemTitle - Title text for an item
 * -------------------------------------------------------------------------- */

interface SelectListItemTitleProps {
  children: React.ReactNode;
  className?: string;
}

function SelectListItemTitle({
  children,
  className,
}: SelectListItemTitleProps) {
  return (
    <div className={cn("truncate text-sm font-medium", className)}>
      {children}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItemSubtitle - Subtitle/description for an item
 * -------------------------------------------------------------------------- */

interface SelectListItemSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

function SelectListItemSubtitle({
  children,
  className,
}: SelectListItemSubtitleProps) {
  return (
    <div className={cn("text-muted-foreground truncate text-xs", className)}>
      {children}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItemMeta - Additional metadata slot (e.g., badges, icons)
 * -------------------------------------------------------------------------- */

interface SelectListItemMetaProps {
  children: React.ReactNode;
  className?: string;
}

function SelectListItemMeta({ children, className }: SelectListItemMetaProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {children}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItemThumbnail - Thumbnail/image for an item
 * -------------------------------------------------------------------------- */

type SelectListItemThumbnailVariant = "square" | "landscape" | "portrait";

const thumbnailVariants: Record<SelectListItemThumbnailVariant, string> = {
  square: "size-8",
  landscape: "w-16 h-10",
  portrait: "w-10 h-14",
};

interface SelectListItemThumbnailProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  variant?: SelectListItemThumbnailVariant;
  className?: string;
}

function SelectListItemThumbnail({
  src,
  alt = "",
  fallback,
  variant = "square",
  className,
}: SelectListItemThumbnailProps) {
  return (
    <div
      className={cn(
        "bg-muted flex shrink-0 items-center justify-center overflow-hidden rounded-md border",
        thumbnailVariants[variant],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListItemActions - Actions slot for an item (e.g., copy, delete buttons)
 * -------------------------------------------------------------------------- */

interface SelectListItemActionsProps {
  children: React.ReactNode;
  className?: string;
}

function SelectListItemActions({
  children,
  className,
}: SelectListItemActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListGroup - Group of items with optional heading
 * -------------------------------------------------------------------------- */

interface SelectListGroupProps {
  children: React.ReactNode;
  heading?: string;
  className?: string;
}

function SelectListGroup({
  children,
  heading,
  className,
}: SelectListGroupProps) {
  return (
    <div className={cn("py-1", className)}>
      {heading && (
        <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * SelectListSeparator - Separator between groups
 * -------------------------------------------------------------------------- */

interface SelectListSeparatorProps {
  className?: string;
}

function SelectListSeparator({ className }: SelectListSeparatorProps) {
  return <Separator className={cn("my-1", className)} />;
}

/* -----------------------------------------------------------------------------
 * SelectListAction - Clickable action item (e.g., "Upload new image")
 * -------------------------------------------------------------------------- */

interface SelectListActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function SelectListAction({
  children,
  onClick,
  disabled = false,
  className,
}: SelectListActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "hover:bg-muted flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  SelectList,
  SelectListHeader,
  SelectListSearch,
  SelectListContent,
  SelectListItemComponent as SelectListItem,
  SelectListItemTitle,
  SelectListItemSubtitle,
  SelectListItemMeta,
  SelectListItemThumbnail,
  SelectListItemActions,
  SelectListGroup,
  SelectListSeparator,
  SelectListAction,
  useSelectListContext,
};

export type { SelectListVariant, SelectListProps };

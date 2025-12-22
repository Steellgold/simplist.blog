"use client";

import { Button } from "@simplist/ui/components/button";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn, toPascalCase } from "@simplist/ui/lib/utils";
import * as LucideIcons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ComponentType, useMemo } from "react";

type IconPickerTriggerProps = {
  value?: IconsEnumType;
  placeholder: string;
  open: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  showChevron?: boolean;
};

export function IconPickerTrigger({
  value,
  placeholder,
  open,
  onClick,
  disabled = false,
  className,
  showChevron = true,
}: IconPickerTriggerProps) {
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

  const displayText = value
    ? value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : placeholder;

  return (
    <Button
      variant="outline"
      role="combobox"
      type="button"
      aria-expanded={open}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-between",
        !value && "text-muted-foreground",
        className,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
        <span className="truncate text-sm sm:text-base">{displayText}</span>
      </div>

      {showChevron && <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
    </Button>
  );
}

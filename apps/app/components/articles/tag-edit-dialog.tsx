"use client";

import { type Color } from "@simplist/db";
import { useState } from "react";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import { IconPicker } from "@simplist/ui/components/icon-picker";
import { Label } from "@simplist/ui/components/label";
import { cn } from "@simplist/ui/lib/utils";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { IconRender } from "@simplist/ui/components/icon-renderer";

// Available colors with preview
const AVAILABLE_COLORS: { value: Color; label: string; colorClass: string }[] =
  [
    { value: "RED", label: "Red", colorClass: "bg-red-500" },
    { value: "ORANGE", label: "Orange", colorClass: "bg-orange-500" },
    { value: "YELLOW", label: "Yellow", colorClass: "bg-yellow-500" },
    { value: "GREEN", label: "Green", colorClass: "bg-green-500" },
    { value: "BLUE", label: "Blue", colorClass: "bg-blue-500" },
    { value: "PURPLE", label: "Purple", colorClass: "bg-purple-500" },
    { value: "PINK", label: "Pink", colorClass: "bg-pink-500" },
    { value: "CYAN", label: "Cyan", colorClass: "bg-cyan-500" },
    { value: "GRAY", label: "Gray", colorClass: "bg-gray-500" },
  ];

interface TagEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagName: string;
  currentIcon: string | null;
  currentColor: Color | null;
  onSave: (icon: string, color: Color) => void;
}

export function TagEditDialog({
  open,
  onOpenChange,
  tagName,
  currentIcon,
  currentColor,
  onSave,
}: TagEditDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconsEnumType>(
    (currentIcon as IconsEnumType) || "tag",
  );
  const [selectedColor, setSelectedColor] = useState<Color>(
    currentColor || "CYAN",
  );

  const handleSave = () => {
    onSave(selectedIcon, selectedColor);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tag: {tagName}</DialogTitle>
          <DialogDescription>
            Customize the icon and color for this tag. Changes will be saved
            when you publish the article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={selectedIcon} onValueChange={setSelectedIcon} />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_COLORS.map(({ value, label, colorClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedColor(value)}
                  className={cn(
                    "hover:border-primary flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm transition-all",
                    selectedColor === value
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className={cn("h-4 w-4 rounded-full", colorClass)} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm",
                  selectedColor === "RED" &&
                    "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
                  selectedColor === "ORANGE" &&
                    "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
                  selectedColor === "YELLOW" &&
                    "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
                  selectedColor === "GREEN" &&
                    "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
                  selectedColor === "BLUE" &&
                    "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
                  selectedColor === "PURPLE" &&
                    "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200",
                  selectedColor === "PINK" &&
                    "border-pink-200 bg-pink-100 text-pink-800 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-200",
                  selectedColor === "CYAN" &&
                    "border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
                  selectedColor === "GRAY" &&
                    "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200",
                )}
              >
                <IconRender name={selectedIcon as IconsEnumType} size={14} />
                <span>{tagName}</span>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

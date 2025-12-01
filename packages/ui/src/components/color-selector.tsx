"use client";

import { Button } from "@simplist/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Input } from "@simplist/ui/components/input";
import { ScrollArea } from "@simplist/ui/components/scroll-area";
import {
  COLORS,
  ColorsEnumType,
  getColorLabel,
  getColorValue,
} from "@simplist/ui/lib/color";
import { cn } from "@simplist/ui/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import { FC, useEffect, useState } from "react";

type ColorSelectorProps = {
  value: ColorsEnumType;
  onValueChange: (value: ColorsEnumType) => void;
  triggerClassName?: string;
  disabled?: boolean;
  className?: string;
  dialog?: boolean;
};

export const ColorSelector: FC<ColorSelectorProps> = ({
  value,
  onValueChange,
  triggerClassName = "",
  disabled = false,
  className = "",
  dialog = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorsEnumType>(value);

  // Synchronize selectedColor with value prop when it changes
  useEffect(() => {
    setSelectedColor(value);
  }, [value]);

  const filteredColors = COLORS.filter((color) =>
    getColorLabel(color).toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleColorSelect = (color: ColorsEnumType) => {
    if (dialog) {
      setSelectedColor(color);
    } else {
      onValueChange(color);
      setIsOpen(false);
      setSearchValue("");
    }
  };

  const handleDialogConfirm = () => {
    onValueChange(selectedColor);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchValue("");
      setSelectedColor(value);
    }
  };

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        "flex-1 justify-start bg-transparent",
        triggerClassName,
        className,
      )}
      disabled={disabled}
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: getColorValue(value) }}
      />
      {getColorLabel(value)}
      <ChevronDown className="h-4 w-4 ml-auto shrink-0 opacity-50" />
    </Button>
  );

  if (dialog) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Color</DialogTitle>
            <DialogDescription>
              Choose a color from the list below.
            </DialogDescription>
          </DialogHeader>

          <Command className="border rounded-lg">
            <CommandInput placeholder="Search colors..." />
            <CommandList className="h-[300px] max-h-[300px]">
              <CommandEmpty>No color found.</CommandEmpty>

              <CommandGroup>
                {filteredColors.map((color) => (
                  <CommandItem
                    key={color}
                    value={`${getColorLabel(color)} ${color}`}
                    onSelect={() => handleColorSelect(color)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedColor === color ? "opacity-100" : "opacity-0",
                      )}
                    />

                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: getColorValue(color) }}
                    />

                    <span>{getColorLabel(color)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDialogConfirm}
              disabled={!selectedColor}
            >
              Select Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const colorList = (
    <>
      {filteredColors.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No colors found.
        </div>
      ) : (
        filteredColors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorSelect(color)}
            className="flex items-center gap-2 w-full p-2 cursor-pointer hover:bg-accent rounded-md transition-colors"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getColorValue(color) }}
            />
            <span className="flex-1">{getColorLabel(color)}</span>
            {value === color && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </div>
        ))
      )}
    </>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
        align="start"
      >
        <div className="w-full p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colors..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="max-h-60">
            {colorList}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

"use client";

import { Button } from "@simplist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ChevronDown, Search } from "lucide-react";
import { FC, useState } from "react";

type ColorSelectorProps = {
  value: ColorsEnumType;
  onValueChange: (value: ColorsEnumType) => void;
  triggerClassName?: string;
  disabled?: boolean;
};

export const ColorSelector: FC<ColorSelectorProps> = ({
  value,
  onValueChange,
  triggerClassName = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredColors = COLORS.filter((color) =>
    getColorLabel(color).toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleColorSelect = (color: ColorsEnumType) => {
    onValueChange(color);
    setIsOpen(false);
    setSearchValue("");
  };

  const trigger = (
    <Button
      variant="outline"
      className={`flex-1 justify-start bg-transparent ${triggerClassName}`}
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

  const content = (
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
        {filteredColors.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No colors found.
          </div>
        ) : (
          filteredColors.map((color) => (
            <DropdownMenuItem
              key={color}
              onClick={() => handleColorSelect(color)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getColorValue(color) }}
                />
                {getColorLabel(color)}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </ScrollArea>
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
        align="start"
      >
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
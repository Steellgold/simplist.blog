"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@simplist/ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@simplist/ui/components/popover";
import { ReactNode, useRef } from "react";

type IconPickerContainerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  dialog: boolean;
  isDesktop: boolean;
  disabled?: boolean;
};

export function IconPickerContainer({
  open,
  onOpenChange,
  trigger,
  children,
  dialog,
  isDesktop,
  disabled = false,
}: IconPickerContainerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  if (dialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild disabled={disabled}>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">{children}</DialogContent>
      </Dialog>
    );
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          sideOffset={4}
          align="start"
          ref={pickerRef}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild disabled={disabled}>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}

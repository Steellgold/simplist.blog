"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Button } from "@simplist/ui/components/button";
import { Input } from "@simplist/ui/components/input";
import { Separator } from "@simplist/ui/components/separator";
import { Textarea } from "@simplist/ui/components/textarea";
import { cn } from "@simplist/ui/lib/utils";
import { SelectTrigger } from "./select";

const inputGroupVariants = cva(
  "group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none min-w-0",
  {
    variants: {
      orientation: {
        horizontal: [
          "h-9 has-[>textarea]:h-auto",
          // Variants based on alignment for horizontal
          "has-[>[data-align=inline-start]]:[&>input]:pl-2",
          "has-[>[data-align=inline-end]]:[&>input]:pr-2",
          "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
          "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        ],
        vertical: [
          "h-auto flex-col w-fit",
          // Variants based on alignment for vertical
          "has-[>[data-align=inline-start]]:[&>input]:pt-2",
          "has-[>[data-align=inline-end]]:[&>input]:pb-2",
          "has-[>[data-align=block-start]]:flex-row has-[>[data-align=block-start]]:[&>input]:pr-3",
          "has-[>[data-align=block-end]]:flex-row has-[>[data-align=block-end]]:[&>input]:pl-3",
        ],
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function InputGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      data-orientation={orientation}
      role="group"
      className={cn(
        inputGroupVariants({ orientation }),
        // Focus state
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
        // Error state
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
      },
      orientation: {
        horizontal: "",
        vertical: [
          // Adjust padding for vertical orientation
          "data-[align=inline-start]:pl-3 data-[align=inline-start]:py-2",
          "data-[align=inline-end]:pr-3 data-[align=inline-end]:py-2",
          "data-[align=block-start]:h-full data-[align=block-start]:w-auto data-[align=block-start]:px-3",
          "data-[align=block-end]:h-full data-[align=block-end]:w-auto data-[align=block-end]:px-3",
        ],
      },
    },
    defaultVariants: {
      align: "inline-start",
      orientation: "horizontal",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  const orientation =
    (props as any)["data-orientation"] ||
    (typeof window !== "undefined" &&
      (props as any).parentElement?.getAttribute("data-orientation")) ||
    "horizontal";

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align, orientation }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupSelect({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      data-slot="input-group-control"
      className={cn(
        "rounded-none h-auto border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupSeparator({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof Separator>) {
  // Auto-detect orientation from parent if not explicitly provided
  const parentOrientation =
    (props as any)["data-parent-orientation"] || "horizontal";
  
  // If in vertical InputGroup, separator should be horizontal by default, and vice versa
  const effectiveOrientation =
    orientation ?? (parentOrientation === "vertical" ? "horizontal" : "vertical");

  return (
    <Separator
      data-slot="input-group-separator"
      orientation={effectiveOrientation}
      className={cn(
        "bg-input relative !m-0",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupSelect,
  InputGroupSeparator,
  InputGroupText,
  InputGroupTextarea,
  inputGroupVariants
};

"use client";

import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn, toKebabCase, toPascalCase } from "@simplist/ui/lib/utils";
import type { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { ComponentProps } from "react";

type IconComponent = React.ComponentType<LucideProps>;

type IconRenderProps = {
  name: IconsEnumType;
  size?: number | string;
  className?: string;
} & Omit<ComponentProps<"svg">, "name">;

export const IconRender = ({
  name,
  size = 16,
  className,
  ...props
}: IconRenderProps) => {
  const kebabName = toKebabCase(name);
  const pascalName = toPascalCase(kebabName);

  const iconLibrary = LucideIcons as unknown as Record<string, IconComponent>;
  const IconComponent = iconLibrary[pascalName];
  const FallbackIcon = iconLibrary["Hash"];

  const FinalIcon = IconComponent || FallbackIcon;

  if (!FinalIcon) return null;

  return (
    <FinalIcon
      className={cn("shrink-0", className)}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    />
  );
};
import { Badge } from "@simplist/ui/components/badge";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { ColorsEnumType } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";
import type { Tag } from "@/lib/types/blog";
import { FC } from "react";

type Props = {
  tag: Tag;
  size?: "sm" | "default";
};

export const TagBadge: FC<Props> = ({ tag, size = "default" }) => {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1.5",
        size === "sm" ? "text-xs" : "",
      )}
    >
      {tag.name}
    </Badge>
  );
};

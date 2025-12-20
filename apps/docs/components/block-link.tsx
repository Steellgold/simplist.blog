"use client";

import { cn } from "@simplist/ui/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

export interface BlockLinkItem {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
}

interface BlockLinkProps {
  items?: BlockLinkItem[];
  itemsJson?: string | BlockLinkItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const BlockLink: FC<BlockLinkProps> = ({
  items,
  itemsJson,
  columns = 2,
  className,
}) => {
  let parsedItems: BlockLinkItem[] | undefined = items;

  if (itemsJson) {
    if (typeof itemsJson === "string") {
      try {
        parsedItems = JSON.parse(itemsJson);
      } catch (error) {
        console.error("Erreur lors du parsing de itemsJson:", error);
        return null;
      }
    } else if (Array.isArray(itemsJson)) {
      parsedItems = itemsJson;
    }
  }

  if (!parsedItems || parsedItems.length === 0) {
    return null;
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const totalItems = parsedItems.length;
  const isLastItemAlone = totalItems % columns !== 0;
  const lastItemIndex = totalItems - 1;

  const getColSpanClasses = (index: number) => {
    if (isLastItemAlone && index === lastItemIndex) {
      const colSpanClasses = {
        1: "",
        2: "md:col-span-2",
        3: "lg:col-span-3",
        4: "lg:col-span-4",
      };
      return colSpanClasses[columns];
    }
    return "";
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {parsedItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className={cn(
            "group hover:bg-accent/50 flex flex-col gap-2 rounded-lg border p-4 transition-colors",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            getColSpanClasses(index),
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{item.title}</h3>
                {item.external && (
                  <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                )}
              </div>

              {item.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.description}
                </p>
              )}
            </div>

            <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
};

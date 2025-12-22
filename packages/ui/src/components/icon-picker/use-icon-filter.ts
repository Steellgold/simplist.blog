import { iconsData } from "@simplist/ui/lib/icons-data";
import { useMemo } from "react";
import { IconData } from "./types";

export function useIconFilter(search: string, category: string) {
  const categories = useMemo(() => {
    const all = new Set<string>();
    iconsData.forEach((icon) => icon.categories.forEach((c) => all.add(c)));
    return [
      "All",
      ...Array.from(all).map(
        (cat) => cat.charAt(0).toUpperCase() + cat.slice(1),
      ),
    ];
  }, []);

  const filteredIcons = useMemo(() => {
    let icons: IconData[] = [...iconsData];

    if (category !== "All") {
      icons = icons.filter((icon) =>
        icon.categories.includes(category.toLowerCase()),
      );
    }

    if (search) {
      icons = icons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(search.toLowerCase()) ||
          icon.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase()),
          ),
      );
    }

    return icons.sort((a, b) => {
      const aPriority = a.name === "hash" || a.name === "tag";
      const bPriority = b.name === "hash" || b.name === "tag";
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [search, category]);

  const searchPlaceholder = useMemo(() => {
    return category === "All"
      ? "Search for an icon..."
      : `Search for an icon in ${category.toLowerCase()}...`;
  }, [category]);

  return {
    categories,
    filteredIcons,
    searchPlaceholder,
  };
}

"use client";

import { useSearchCommand } from "@/hooks/use-search-command";
import type { SearchResult } from "@/lib/search";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const SearchCommand = () => {
  const { open, toggle, setOpen } = useSearchCommand();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    },
    {
      preventDefault: true,
      enableOnFormTags: ["input", "textarea"],
      enableOnContentEditable: true,
    },
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [toggle]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        if (!response.ok) {
          throw new Error("Error during search");
        }
        const searchResults = await response.json();
        setResults(searchResults);
      } catch (error) {
        console.error("Error during search:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName] as
      | React.ComponentType<{ className?: string }>
      | undefined;
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search in the documentation..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className={cn({ "mb-1": results.length > 0 })}>
          {isSearching && query.trim() ? (
            <CommandEmpty>Searching...</CommandEmpty>
          ) : results.length === 0 && query.trim() ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>Type to search...</CommandEmpty>
          ) : (
            <CommandGroup
              heading={`${results.length} result${results.length > 1 ? "s" : ""} found${results.length > 1 ? "s" : ""}`}
            >
              {results.map((result) => (
                <CommandItem
                  key={result.href}
                  value={`${result.title} ${result.description || ""} ${result.matchContext || ""}`}
                  onSelect={() => handleSelect(result.href)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="bg-muted border-border rounded-md border p-1.5">
                      {renderIcon(result.icon)}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.matchContext ? (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          ...{result.matchContext}...
                        </span>
                      ) : result.description ? (
                        <span className="text-muted-foreground text-xs">
                          {result.description}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

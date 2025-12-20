"use client";

import { getProjectMedia, type MediaItem } from "@/lib/actions/media";
import { formatBytes } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
import { Spinner } from "@simplist/ui/components/spinner";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { FC, useCallback, useEffect, useState } from "react";

interface MediaCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelect: (url: string) => void;
}

export const MediaCommand: FC<MediaCommandProps> = ({
  open,
  onOpenChange,
  projectId,
  onSelect,
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Load media when dialog opens
  const loadMedia = useCallback(
    async (searchQuery?: string) => {
      setIsLoading(true);
      try {
        const result = await getProjectMedia(projectId, {
          page: 1,
          limit: 50, // Load more items for command palette
          search: searchQuery || undefined,
        });
        setMedia(result.media);
      } catch (error) {
        console.error("Failed to load media:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId],
  );

  // Load media when dialog opens
  useEffect(() => {
    if (open) {
      setSearch("");
      loadMedia();
    }
  }, [open, loadMedia]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      loadMedia(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open, loadMedia]);

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search images..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6">
                <ImageIcon className="text-muted-foreground h-10 w-10" />
                <p className="text-muted-foreground text-sm">No images found</p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Images">
              {media.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.filename}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="bg-muted relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.filename}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(item.size)}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

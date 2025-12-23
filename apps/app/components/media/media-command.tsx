"use client";

import { getProjectMedia, type MediaItem } from "@/lib/actions/media";
import { formatBytes } from "@/lib/utils";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import {
  SelectListContent,
  SelectListItem,
  SelectListItemSubtitle,
  SelectListItemThumbnail,
  SelectListItemTitle,
  SelectListSearch,
} from "@simplist/ui/components/select-list";
import { Check, ImageIcon } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const loadMedia = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      try {
        const result = await getProjectMedia(projectId, {
          page: 1,
          limit: 50,
          search: search || undefined,
        });
        setMedia(result.media);
      } catch {
        toast.error("Failed to load media");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId],
  );

  // Load on open
  useEffect(() => {
    if (open) {
      setSelectedUrl(null);
      setSearchQuery("");
      loadMedia();
    }
  }, [open, loadMedia]);

  // Debounced search
  useEffect(() => {
    if (!open || searchQuery === "") return;

    const timer = setTimeout(() => {
      loadMedia(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, loadMedia]);

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    setSelectedUrl((prev) => (prev === url ? null : url));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert from library</DialogTitle>
          <DialogDescription>
            Select an image from your media library to insert into the content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <SelectListSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search images..."
          />

          <SelectListContent
            isLoading={isLoading}
            isEmpty={media.length === 0}
            emptyMessage={
              searchQuery ? "No images found" : "No images in library"
            }
          >
            {media.map((item) => (
              <SelectListItem
                key={item.id}
                id={item.id}
                checked={selectedUrl === item.url}
                onCheckedChange={() => handleSelectMedia(item.url)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <SelectListItemThumbnail
                    src={item.url}
                    alt={item.filename}
                    variant="landscape"
                    fallback={
                      <ImageIcon className="text-muted-foreground h-4 w-4" />
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <SelectListItemTitle>{item.filename}</SelectListItemTitle>
                    <SelectListItemSubtitle>
                      {formatBytes(item.size)}
                    </SelectListItemSubtitle>
                  </div>
                  {selectedUrl === item.url && (
                    <Check className="text-primary h-4 w-4 shrink-0" />
                  )}
                </div>
              </SelectListItem>
            ))}
          </SelectListContent>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUrl}>
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

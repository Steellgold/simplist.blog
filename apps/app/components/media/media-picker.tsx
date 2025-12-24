"use client";

import * as React from "react";
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
import { toast } from "sonner";
import { cn } from "@simplist/ui/lib/utils";

// Context for sharing state between MediaPicker components
interface MediaPickerContextValue {
  selectedUrl: string | null;
  setSelectedUrl: (url: string | null) => void;
  customUrl: string;
  setCustomUrl: (url: string) => void;
  media: MediaItem[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const MediaPickerContext = React.createContext<MediaPickerContextValue | null>(
  null,
);

function useMediaPickerContext() {
  const context = React.useContext(MediaPickerContext);
  if (!context) {
    throw new Error("MediaPicker components must be used within a MediaPicker");
  }
  return context;
}

// Main MediaPicker component
interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelect: (url: string) => void;
  /** Initial URL to pre-fill (for editing existing images) */
  initialUrl?: string;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Confirm button text */
  confirmText?: string;
  children?: React.ReactNode;
}

function MediaPicker({
  open,
  onOpenChange,
  projectId,
  onSelect,
  initialUrl = "",
  title = "Select image",
  description = "Select an image from your media library or enter a URL.",
  confirmText = "Confirm",
  children,
}: MediaPickerProps) {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUrl, setSelectedUrl] = React.useState<string | null>(null);
  const [customUrl, setCustomUrl] = React.useState(initialUrl);

  const loadMedia = React.useCallback(
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

  // Load on open and reset state
  React.useEffect(() => {
    if (open) {
      setSelectedUrl(null);
      setCustomUrl(initialUrl);
      setSearchQuery("");
      loadMedia();
    }
  }, [open, loadMedia, initialUrl]);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      loadMedia(searchQuery || undefined);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, loadMedia]);

  // Get the final URL (selected media takes priority over custom URL)
  const getFinalUrl = (): string | null => {
    if (selectedUrl) return selectedUrl;
    if (customUrl.trim()) return customUrl.trim();
    return null;
  };

  const handleConfirm = () => {
    const finalUrl = getFinalUrl();
    if (finalUrl) {
      onSelect(finalUrl);
      onOpenChange(false);
    }
  };

  const contextValue: MediaPickerContextValue = {
    selectedUrl,
    setSelectedUrl,
    customUrl,
    setCustomUrl,
    media,
    isLoading,
    searchQuery,
    setSearchQuery,
  };

  const finalUrl = getFinalUrl();

  // Check if children contains specific slots
  const childArray = React.Children.toArray(children);
  const hasCustomHeader = childArray.some(
    (child) => React.isValidElement(child) && child.type === MediaPickerHeader,
  );
  const hasCustomContent = childArray.some(
    (child) => React.isValidElement(child) && child.type === MediaPickerContent,
  );
  const hasCustomFooter = childArray.some(
    (child) => React.isValidElement(child) && child.type === MediaPickerFooter,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <MediaPickerContext.Provider value={contextValue}>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {/* Custom header slot or nothing by default */}
            {hasCustomHeader &&
              childArray.filter(
                (child) =>
                  React.isValidElement(child) &&
                  child.type === MediaPickerHeader,
              )}

            {/* Custom content or default content */}
            {hasCustomContent ? (
              childArray.filter(
                (child) =>
                  React.isValidElement(child) &&
                  child.type === MediaPickerContent,
              )
            ) : (
              <MediaPickerContent />
            )}
          </div>

          {/* Custom footer or default footer */}
          {hasCustomFooter ? (
            childArray.filter(
              (child) =>
                React.isValidElement(child) && child.type === MediaPickerFooter,
            )
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!finalUrl}>
                {confirmText}
              </Button>
            </DialogFooter>
          )}
        </MediaPickerContext.Provider>
      </DialogContent>
    </Dialog>
  );
}

// Header slot for custom content (like URL input)
interface MediaPickerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function MediaPickerHeader({ children, className }: MediaPickerHeaderProps) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
}

// Content slot - the media list
interface MediaPickerContentProps {
  className?: string;
  children?: React.ReactNode;
}

function MediaPickerContent({ className, children }: MediaPickerContentProps) {
  const {
    media,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedUrl,
    setSelectedUrl,
    setCustomUrl,
  } = useMediaPickerContext();

  const handleSelectMedia = (url: string) => {
    // Toggle selection
    if (selectedUrl === url) {
      setSelectedUrl(null);
    } else {
      setSelectedUrl(url);
      // Clear custom URL when selecting from library
      setCustomUrl("");
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden",
        className,
      )}
    >
      {children}

      <SelectListSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search images..."
      />

      <SelectListContent
        isLoading={isLoading}
        isEmpty={media.length === 0}
        emptyMessage={searchQuery ? "No images found" : "No images in library"}
        className="max-h-[300px] min-h-0 flex-1"
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
  );
}

// Footer slot for custom buttons
interface MediaPickerFooterProps {
  children: React.ReactNode;
  className?: string;
}

function MediaPickerFooter({ children, className }: MediaPickerFooterProps) {
  return <DialogFooter className={className}>{children}</DialogFooter>;
}

// Pre-built URL input header component
interface MediaPickerUrlInputProps {
  label?: string;
  placeholder?: string;
  className?: string;
}

function MediaPickerUrlInput({
  label = "Or enter URL",
  placeholder = "https://example.com/image.jpg",
  className,
}: MediaPickerUrlInputProps) {
  const { customUrl, setCustomUrl, setSelectedUrl } = useMediaPickerContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    // Clear library selection when typing custom URL
    if (e.target.value.trim()) {
      setSelectedUrl(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="url"
        value={customUrl}
        onChange={handleChange}
        placeholder={placeholder}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

// Hook to access context from custom components
function useMediaPicker() {
  return useMediaPickerContext();
}

export {
  MediaPicker,
  MediaPickerHeader,
  MediaPickerContent,
  MediaPickerFooter,
  MediaPickerUrlInput,
  useMediaPicker,
};

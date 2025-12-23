"use client";

import { updateTag, type TagWithMetadata } from "@/lib/actions/tags";
import { type Color } from "@simplist/db";
import { Button } from "@simplist/ui/components/button";
import { ColorSelector } from "@simplist/ui/components/color-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import { IconPicker } from "@simplist/ui/components/icon-picker";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { Input } from "@simplist/ui/components/input";
import { Label } from "@simplist/ui/components/label";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { Textarea } from "@simplist/ui/components/textarea";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { ColorsEnumType } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TagEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagWithMetadata;
  projectId: string;
}

export function TagEditDialog({
  open,
  onOpenChange,
  tag,
  projectId,
}: TagEditDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(tag.name);
  const [description, setDescription] = useState(tag.description || "");
  const [selectedIcon, setSelectedIcon] = useState<IconsEnumType>(
    (tag.icon as IconsEnumType) || "tag",
  );
  const [selectedColor, setSelectedColor] = useState<Color>(
    tag.color || "CYAN",
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset state when tag changes
  useEffect(() => {
    setName(tag.name);
    setDescription(tag.description || "");
    setSelectedIcon((tag.icon as IconsEnumType) || "tag");
    setSelectedColor(tag.color || "CYAN");
  }, [tag]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateTag(tag.id, projectId, {
        name: name.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
        color: selectedColor,
      });

      if (result.success) {
        toast.success("Tag updated successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update tag");
      }
    } catch (error) {
      toast.error("Failed to update tag");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag name, icon, or color.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tag Name */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              placeholder="Enter tag name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="tag-description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="tag-description"
              placeholder="Brief description of this tag..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={selectedIcon} onValueChange={setSelectedIcon} />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorSelector
              value={selectedColor as ColorsEnumType}
              onValueChange={(color) =>
                setSelectedColor((color || "CYAN") as Color)
              }
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-sm font-medium",
                  getTagColorClasses(selectedColor) ||
                    getTagColorClasses("GRAY"),
                )}
              >
                <IconRender name={selectedIcon} size={14} />
                <span>{name || "Tag name"}</span>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || !name.trim()}>
            {isUpdating ? <Spinner /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

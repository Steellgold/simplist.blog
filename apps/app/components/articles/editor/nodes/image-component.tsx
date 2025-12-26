"use client";

import { useState, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { cn } from "@simplist/ui/lib/utils";
import {
  MediaPicker,
  MediaPickerHeader,
  MediaPickerUrlInput,
} from "@/components/media/media-picker";
import { $isImageNode } from "./image-node";
import { useImagePluginContext } from "../plugins/image-plugin";

interface ImageComponentProps {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  nodeKey: NodeKey;
}

export const ImageComponent = ({
  src,
  altText,
  width,
  height,
  nodeKey,
}: ImageComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const { projectId } = useImagePluginContext();

  const handleClick = useCallback(() => {
    if (projectId) {
      setIsSelected(true);
      setIsPickerOpen(true);
    }
  }, [projectId]);

  const handleSelect = useCallback(
    (newUrl: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          // Create a new node with updated src
          const writableNode = node.getWritable();
          writableNode.__src = newUrl;
        }
      });
      setIsSelected(false);
    },
    [editor, nodeKey],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsPickerOpen(open);
    if (!open) {
      setIsSelected(false);
    }
  }, []);

  return (
    <>
      <img
        src={src}
        alt={altText}
        width={width}
        height={height}
        onClick={handleClick}
        className={cn(
          "my-2 h-auto max-w-full rounded-lg transition-all",
          projectId
            ? "hover:ring-primary/50 cursor-pointer hover:opacity-90 hover:ring-2"
            : "cursor-default",
          isSelected && "ring-primary ring-2",
        )}
        draggable={false}
      />

      {projectId && (
        <MediaPicker
          open={isPickerOpen}
          onOpenChange={handleOpenChange}
          projectId={projectId}
          onSelect={handleSelect}
          initialUrl={src}
          title="Edit image"
          description="Change the image URL or select from your media library."
          confirmText="Update image"
        >
          <MediaPickerHeader>
            <MediaPickerUrlInput
              label="Image URL"
              placeholder="https://example.com/image.jpg"
            />
          </MediaPickerHeader>
        </MediaPicker>
      )}
    </>
  );
};

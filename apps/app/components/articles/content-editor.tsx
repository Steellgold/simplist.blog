"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MediaPicker,
  MediaPickerHeader,
  MediaPickerUrlInput,
} from "@/components/media/media-picker";
import { RichTextEditor } from "./editor";
import type { ProjectSubscription } from "@/lib/subscription/quota-check";

type ArticleContentEditorProps = {
  content: string;
  onContentChange: (value: string) => void;
  textareaId?: string;
  placeholder?: string;
  projectId?: string;
  /** AI-related props */
  subscription?: ProjectSubscription;
  language?: string;
};

export const ArticleContentEditor = ({
  content,
  onContentChange,
  textareaId: _textareaId,
  placeholder = "Write your article here... tell your idea, your story, or share an interesting piece of information.",
  projectId,
  subscription,
  language,
}: ArticleContentEditorProps) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Keyboard shortcut to open MediaPicker (Cmd+Shift+I or Ctrl+Shift+I)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "i") {
        e.preventDefault();
        if (projectId) {
          setIsMediaPickerOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectId]);

  // Open the media picker (called from toolbar/slash command)
  const handleInsertImage = useCallback(() => {
    if (projectId) {
      setIsMediaPickerOpen(true);
    }
  }, [projectId]);

  // Handler for inserting image from media picker
  const handleImageSelect = useCallback(
    (url: string) => {
      // Insert image markdown at the end of content
      // In WYSIWYG mode, this will be handled by the editor
      const imageMarkdown = `\n![](${url})\n`;
      onContentChange(content + imageMarkdown);
      toast.success("Image inserted!");
    },
    [content, onContentChange],
  );

  return (
    <>
      <RichTextEditor
        content={content}
        onContentChange={onContentChange}
        placeholder={placeholder}
        projectId={projectId}
        className="min-h-[500px]"
        onInsertImage={handleInsertImage}
        subscription={subscription}
        language={language}
      />

      {projectId && (
        <MediaPicker
          open={isMediaPickerOpen}
          onOpenChange={setIsMediaPickerOpen}
          projectId={projectId}
          onSelect={handleImageSelect}
          title="Insert image"
          description="Enter an image URL or select from your media library."
          confirmText="Insert image"
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

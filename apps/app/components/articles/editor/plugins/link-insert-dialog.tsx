"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { $createLinkNode } from "@lexical/link";
import { z } from "zod";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import { Input } from "@simplist/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@simplist/ui/components/input-group";
import { Label } from "@simplist/ui/components/label";

const urlSchema = z.string().url("Please enter a valid URL");

interface LinkInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkInsertDialog = ({
  open,
  onOpenChange,
}: LinkInsertDialogProps) => {
  const [editor] = useLexicalComposerContext();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens and focus text input
  useEffect(() => {
    if (open) {
      setText("");
      setUrl("");
      setUrlError(null);

      // Focus text input after dialog animation completes
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Build full URL with https:// prefix
  const fullUrl = url ? `https://${url}` : "";

  // Validate URL and check if form is valid
  const isValidUrl = useMemo(() => {
    if (!url.trim()) return false;
    const result = urlSchema.safeParse(fullUrl);
    return result.success;
  }, [url, fullUrl]);

  const isFormValid = text.trim().length > 0 && isValidUrl;

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Clear error while typing, validate on blur
    if (urlError) {
      setUrlError(null);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !isValidUrl) {
      setUrlError("Please enter a valid URL");
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      if (!isValidUrl) {
        setUrlError("Please enter a valid URL");
      }
      return;
    }

    // Focus the editor first to ensure we have a valid selection
    editor.focus(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create link node with text
          const linkNode = $createLinkNode(fullUrl);
          const textNode = $createTextNode(text);
          linkNode.append(textNode);

          // Insert at cursor position
          selection.insertNodes([linkNode]);

          // Move cursor after the link
          linkNode.selectEnd();
        }
      });
    });

    onOpenChange(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert link</DialogTitle>
          <DialogDescription>
            Enter the text to display and the URL for the link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-text">Text</Label>
            <Input
              ref={textInputRef}
              id="link-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Link text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <InputGroup>
              <InputGroupAddon>https://</InputGroupAddon>
              <InputGroupInput
                id="link-url"
                value={url}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                onKeyDown={handleKeyDown}
                placeholder="example.com"
                aria-invalid={!!urlError}
                className={urlError ? "border-destructive" : ""}
              />
            </InputGroup>

            {urlError && <p className="text-destructive text-sm">{urlError}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!isFormValid}>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

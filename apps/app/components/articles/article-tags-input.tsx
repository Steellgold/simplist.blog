"use client";

import { Xmark } from "@gravity-ui/icons";
import { type Color, type Tag } from "@simplist/db";
import { ColorSelector } from "@simplist/ui/components/color-selector";
import { DialogTrigger } from "@simplist/ui/components/dialog";
import { IconPicker } from "@simplist/ui/components/icon-picker";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import type { ColorsEnumType } from "@simplist/ui/lib/color";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";
import type { ChangeEvent, KeyboardEvent } from "react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

type ArticleTagsInputProps = {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags?: Tag[];
  placeholder?: string;
  className?: string;
  maxTags?: number;
  onCreateTag?: (name: string) => Promise<Tag | null>;
};

export const ArticleTagsInput: FC<ArticleTagsInputProps> = ({
  value,
  onChange,
  availableTags = [],
  placeholder = "Add tag...",
  className,
  maxTags,
  onCreateTag,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input (2+ letters)
  const filteredSuggestions = useMemo(() => {
    if (inputValue.length < 2) return [];
    const lowerInput = inputValue.toLowerCase();
    const selectedIds = new Set(value.map((tag) => tag.id));
    return availableTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(lowerInput) && !selectedIds.has(tag.id),
    );
  }, [inputValue, value, availableTags]);

  // Show/hide suggestions
  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0);
    setHighlightedIndex(-1);
  }, [filteredSuggestions.length]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (tag: Tag) => {
    if (maxTags && value.length >= maxTags) return;
    onChange([...value, tag]);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const addTagFromInput = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // Check if tag already exists in available tags
    const existingTag = availableTags.find(
      (t) => t.name.toLowerCase() === trimmedValue.toLowerCase(),
    );
    if (existingTag) {
      const alreadySelected = value.some((t) => t.id === existingTag.id);
      if (!alreadySelected) {
        if (maxTags && value.length >= maxTags) return;
        onChange([...value, existingTag]);
      }
      setInputValue("");
      return;
    }

    // Create new tag if callback provided
    if (onCreateTag) {
      const newTag = await onCreateTag(trimmedValue);
      if (newTag) {
        onChange([...value, newTag]);
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove: Tag) => {
    onChange(value.filter((tag) => tag.id !== tagToRemove.id));
  };

  const handleIconChange = (tag: Tag, newIcon: string) => {
    // Update the tag in the local state
    const updatedTags = value.map((t) =>
      t.id === tag.id ? { ...t, icon: newIcon } : t,
    );
    onChange(updatedTags);
  };

  const handleColorChange = (tag: Tag, newColor: ColorsEnumType | null) => {
    // Update the tag in the local state
    const updatedTags = value.map((t) =>
      t.id === tag.id ? { ...t, color: newColor } : t,
    );
    onChange(updatedTags);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Check if user typed comma or semicolon
    if (newValue.includes(",") || newValue.includes(";")) {
      // Extract the text before the separator
      const textBeforeSeparator = newValue.split(/[,;]/)[0]?.trim();
      if (textBeforeSeparator) {
        if (maxTags && value.length >= maxTags) {
          setInputValue("");
          return;
        }
        setInputValue(textBeforeSeparator);
        addTagFromInput();
      } else {
        setInputValue("");
      }
      return;
    }

    setInputValue(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle backspace on empty input to remove last tag
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    // Handle comma and semicolon as separators
    if (e.key === "," || e.key === ";") {
      e.preventDefault();
      addTagFromInput();
      return;
    }

    // Handle Enter to add tag
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        showSuggestions &&
        highlightedIndex >= 0 &&
        filteredSuggestions[highlightedIndex]
      ) {
        handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addTagFromInput();
      }
      return;
    }

    // Handle autocomplete navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
          );
          break;
        case "Escape":
          setShowSuggestions(false);
          setHighlightedIndex(-1);
          break;
      }
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input container with tags inside */}
      <div
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-9 w-full rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "flex flex-wrap items-center gap-1.5",
          {
            "px-1.5": value.length > 0,
            "px-3": value.length === 0,
          },
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => {
          const colorClasses = getTagColorClasses(tag.color);

          return (
            <span
              key={tag.id}
              className={cn(
                "group flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-sm shadow-xs",
                colorClasses,
              )}
            >
              {/* Icon picker - click to change icon */}
              <IconPicker
                value={(tag.icon || "tag") as IconsEnumType}
                onValueChange={(newIcon) => handleIconChange(tag, newIcon)}
                dialog
                dialogTrigger={
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="transition-opacity hover:opacity-70"
                      title="Click to change icon"
                    >
                      <IconRender
                        name={(tag.icon || "tag") as IconsEnumType}
                        size={12}
                      />
                    </button>
                  </DialogTrigger>
                }
              />

              {/* Color selector - click tag name to change color */}
              <ColorSelector
                value={tag.color as ColorsEnumType | null}
                onValueChange={(newColor) =>
                  handleColorChange(tag, newColor as Color)
                }
                dialog
                customOptions={[{ value: null, label: "No color" }]}
                dialogTrigger={
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="font-inherit max-w-[200px] cursor-pointer truncate border-0 bg-transparent p-0 text-inherit transition-opacity hover:opacity-70"
                      title="Click to change color"
                    >
                      {tag.name}
                    </button>
                  </DialogTrigger>
                }
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100"
                title="Remove tag"
              >
                <Xmark className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          placeholder={value.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={maxTags ? value.length >= maxTags : false}
          className="placeholder:text-muted-foreground min-w-[120px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border-input bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-auto rounded-md border shadow-md">
          {filteredSuggestions.map((tag, index) => {
            const colorClasses = getTagColorClasses(tag.color);

            return (
              <button
                key={tag.id}
                type="button"
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  index === highlightedIndex &&
                    "bg-accent text-accent-foreground",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(tag)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-xs",
                    colorClasses,
                  )}
                >
                  <IconRender
                    name={(tag.icon || "tag") as IconsEnumType}
                    size={12}
                  />
                  {tag.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {maxTags && (
        <p className="text-muted-foreground mt-1.5 text-xs">
          {value.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
};

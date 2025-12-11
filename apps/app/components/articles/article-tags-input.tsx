"use client"

import { type Color, type Tag } from "@simplist/db";
import { ColorSelector } from "@simplist/ui/components/color-selector";
import { DialogTrigger } from "@simplist/ui/components/dialog";
import { IconPicker } from "@simplist/ui/components/icon-picker";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import type { ColorsEnumType } from "@simplist/ui/lib/color";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ArticleTagsInputProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  availableTags?: Tag[]
  placeholder?: string
  className?: string
  maxTags?: number
  onCreateTag?: (name: string) => Promise<Tag | null>
}

export function ArticleTagsInput({
  value,
  onChange,
  availableTags = [],
  placeholder = "Add tag...",
  className,
  maxTags,
  onCreateTag,
}: ArticleTagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input (2+ letters)
  const filteredSuggestions = useMemo(() => {
    if (inputValue.length < 2) return []
    const lowerInput = inputValue.toLowerCase()
    const selectedIds = new Set(value.map(tag => tag.id))
    return availableTags.filter(
      (tag) => tag.name.toLowerCase().includes(lowerInput) && !selectedIds.has(tag.id)
    )
  }, [inputValue, value, availableTags])

  // Show/hide suggestions
  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0)
    setHighlightedIndex(-1)
  }, [filteredSuggestions.length])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectSuggestion = (tag: Tag) => {
    if (maxTags && value.length >= maxTags) return
    onChange([...value, tag])
    setInputValue("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const addTagFromInput = async () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    // Check if tag already exists in available tags
    const existingTag = availableTags.find(t => t.name.toLowerCase() === trimmedValue.toLowerCase())
    if (existingTag) {
      const alreadySelected = value.some(t => t.id === existingTag.id)
      if (!alreadySelected) {
        if (maxTags && value.length >= maxTags) return
        onChange([...value, existingTag])
      }
      setInputValue("")
      return
    }

    // Create new tag if callback provided
    if (onCreateTag) {
      const newTag = await onCreateTag(trimmedValue)
      if (newTag) {
        onChange([...value, newTag])
        setInputValue("")
      }
    }
  }

  const removeTag = (tagToRemove: Tag) => {
    onChange(value.filter((tag) => tag.id !== tagToRemove.id))
  }

  const handleIconChange = (tag: Tag, newIcon: string) => {
    // Update the tag in the local state
    const updatedTags = value.map(t =>
      t.id === tag.id
        ? { ...t, icon: newIcon }
        : t
    )
    onChange(updatedTags)
  }

  const handleColorChange = (tag: Tag, newColor: ColorsEnumType | null) => {
    // Update the tag in the local state
    const updatedTags = value.map(t =>
      t.id === tag.id
        ? { ...t, color: newColor }
        : t
    )
    onChange(updatedTags)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // Check if user typed comma or semicolon
    if (newValue.includes(",") || newValue.includes(";")) {
      // Extract the text before the separator
      const textBeforeSeparator = newValue.split(/[,;]/)[0]?.trim()
      if (textBeforeSeparator) {
        if (maxTags && value.length >= maxTags) {
          setInputValue("")
          return
        }
        setInputValue(textBeforeSeparator)
        addTagFromInput()
      } else {
        setInputValue("")
      }
      return
    }

    setInputValue(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle backspace on empty input to remove last tag
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      e.preventDefault()
      onChange(value.slice(0, -1))
      return
    }

    // Handle comma and semicolon as separators
    if (e.key === "," || e.key === ";") {
      e.preventDefault()
      addTagFromInput()
      return
    }

    // Handle Enter to add tag
    if (e.key === "Enter") {
      e.preventDefault()
      if (showSuggestions && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleSelectSuggestion(filteredSuggestions[highlightedIndex])
      } else if (inputValue.trim()) {
        addTagFromInput()
      }
      return
    }

    // Handle autocomplete navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
          break
        case "Escape":
          setShowSuggestions(false)
          setHighlightedIndex(-1)
          break
      }
    }
  }

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input container with tags inside */}
      <div
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-9 w-full rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "flex flex-wrap items-center gap-1.5", {
            "px-1.5": value.length > 0,
            "px-3": value.length === 0
          },
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => {
          const colorClasses = getTagColorClasses(tag.color)

          return (
            <span
              key={tag.id}
              className={cn(
                "flex items-center gap-1.5 rounded border shadow-xs px-2 py-0.5 text-sm group",
                colorClasses
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
                      className="hover:opacity-70 transition-opacity"
                      title="Click to change icon"
                    >
                      <IconRender name={(tag.icon || "tag") as IconsEnumType} size={12} />
                    </button>
                  </DialogTrigger>
                }
              />

              {/* Color selector - click tag name to change color */}
              <ColorSelector
                value={tag.color as ColorsEnumType | null}
                onValueChange={(newColor) => handleColorChange(tag, newColor as Color)}
                dialog
                customOptions={[
                  { value: null, label: "No color" }
                ]}
                dialogTrigger={
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="max-w-[200px] truncate hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit"
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
                  e.stopPropagation()
                  removeTag(tag)
                }}
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100"
                title="Remove tag"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )
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
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-md border border-input bg-popover text-popover-foreground shadow-md">
          {filteredSuggestions.map((tag, index) => {
            const colorClasses = getTagColorClasses(tag.color)

            return (
              <button
                key={tag.id}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                  index === highlightedIndex && "bg-accent text-accent-foreground"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(tag)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className={cn("inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-xs", colorClasses)}>
                  <IconRender name={(tag.icon || "tag") as IconsEnumType} size={12} />
                  {tag.name}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {maxTags && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {value.length} / {maxTags} tags
        </p>
      )}
    </div>
  )
}

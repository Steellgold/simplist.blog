"use client"

import React, { createContext, useContext, useCallback, useId, type KeyboardEvent, useRef } from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@simplist/ui/lib/utils"

// ============================================================================
// Context
// ============================================================================

interface TagGroupContextValue {
  selectedKeys: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  selectionMode: "none" | "single" | "multiple"
  onRemove?: (keys: Set<string>) => void
  disabledKeys: Set<string>
}

const TagGroupContext = createContext<TagGroupContextValue | null>(null)

function useTagGroup() {
  const context = useContext(TagGroupContext)
  if (!context) {
    throw new Error("Tag must be used within a TagGroup")
  }
  return context
}

// ============================================================================
// Styles
// ============================================================================

const tagVariants = cva(
  "transition-colors cursor-default text-xs rounded-md border px-2.5 py-1 flex items-center max-w-fit gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-border bg-background hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

// ============================================================================
// TagGroup
// ============================================================================

export interface TagGroupProps<T = string> {
  label?: string
  description?: string
  errorMessage?: string
  children: React.ReactNode
  className?: string
  selectionMode?: "none" | "single" | "multiple"
  selectedKeys?: Iterable<string>
  defaultSelectedKeys?: Iterable<string>
  onSelectionChange?: (keys: Set<string>) => void
  onRemove?: (keys: Set<string>) => void
  disabledKeys?: Iterable<string>
}

export function TagGroup<T = string>({
  label,
  description,
  errorMessage,
  children,
  className,
  selectionMode = "none",
  selectedKeys: controlledSelectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  onRemove,
  disabledKeys,
}: TagGroupProps<T>) {
  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<Set<string>>(
    () => new Set(defaultSelectedKeys),
  )

  const selectedKeys = controlledSelectedKeys ? new Set(controlledSelectedKeys) : internalSelectedKeys

  const handleSelectionChange = useCallback(
    (keys: Set<string>) => {
      if (!controlledSelectedKeys) {
        setInternalSelectedKeys(keys)
      }
      onSelectionChange?.(keys)
    },
    [controlledSelectedKeys, onSelectionChange],
  )

  const contextValue: TagGroupContextValue = {
    selectedKeys,
    onSelectionChange: handleSelectionChange,
    selectionMode,
    onRemove,
    disabledKeys: new Set(disabledKeys),
  }

  return (
    <TagGroupContext.Provider value={contextValue}>
      <div
        role="grid"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descriptionId : errorMessage ? errorId : undefined}
        className={cn("flex flex-col gap-1", className)}
      >
        {label && (
          <label id={labelId} className="text-sm font-medium leading-none">
            {label}
          </label>
        )}
        <div role="row">
          <div role="gridcell" className="flex flex-wrap gap-1">
            {children}
          </div>
        </div>
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {errorMessage && (
          <p id={errorId} className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    </TagGroupContext.Provider>
  )
}

// ============================================================================
// TagList (optional wrapper for items)
// ============================================================================

export interface TagListProps<T> {
  items?: T[]
  children: React.ReactNode | ((item: T) => React.ReactNode)
  renderEmptyState?: () => React.ReactNode
  className?: string
}

export function TagList<T>({ items, children, renderEmptyState, className }: TagListProps<T>) {
  if (items && items.length === 0 && renderEmptyState) {
    return <>{renderEmptyState()}</>
  }

  const content = items
    ? items.map((item, index) => (typeof children === "function" ? children(item) : null))
    : children

  return <div className={cn("flex flex-wrap gap-1", className)}>{content as React.ReactNode}</div>
}

// ============================================================================
// Tag
// ============================================================================

export interface TagProps extends VariantProps<typeof tagVariants> {
  id: string
  children: React.ReactNode
  className?: string
  textValue?: string
}

export function Tag({ id, children, variant, className, textValue }: TagProps) {
  const { selectedKeys, onSelectionChange, selectionMode, onRemove, disabledKeys } = useTagGroup()

  const tagRef = useRef<HTMLDivElement>(null)
  const isSelected = selectedKeys.has(id)
  const isDisabled = disabledKeys.has(id)
  const allowsRemoving = !!onRemove
  const isSelectable = selectionMode !== "none"

  const handleClick = useCallback(() => {
    if (isDisabled || !isSelectable) return

    const newSelectedKeys = new Set(selectedKeys)

    if (selectionMode === "single") {
      if (isSelected) {
        newSelectedKeys.delete(id)
      } else {
        newSelectedKeys.clear()
        newSelectedKeys.add(id)
      }
    } else if (selectionMode === "multiple") {
      if (isSelected) {
        newSelectedKeys.delete(id)
      } else {
        newSelectedKeys.add(id)
      }
    }

    onSelectionChange?.(newSelectedKeys)
  }, [id, isDisabled, isSelectable, isSelected, selectedKeys, selectionMode, onSelectionChange])

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isDisabled) return
      onRemove?.(new Set([id]))
    },
    [id, isDisabled, onRemove],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (isSelectable) {
          handleClick()
        }
      }

      if ((e.key === "Delete" || e.key === "Backspace") && allowsRemoving) {
        e.preventDefault()
        onRemove?.(new Set([id]))
      }
    },
    [id, isDisabled, isSelectable, allowsRemoving, handleClick, onRemove],
  )

  const computedTextValue = textValue ?? (typeof children === "string" ? children : undefined)

  return (
    <div
      ref={tagRef}
      role="row"
      aria-selected={isSelectable ? isSelected : undefined}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      data-selected={isSelected ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        tagVariants({ variant }),
        isSelected &&
          "bg-primary hover:text-primary-foreground text-primary-foreground border-transparent hover:bg-primary/90",
        isDisabled && "pointer-events-none opacity-50",
        allowsRemoving && "pr-1",
        isSelectable && "cursor-pointer",
        className,
      )}
    >
      <span role="gridcell" aria-label={computedTextValue}>
        {children}
      </span>
      {allowsRemoving && (
        <button
          type="button"
          aria-label={`Remove ${computedTextValue}`}
          onClick={handleRemove}
          tabIndex={-1}
          className="cursor-default rounded-sm transition-colors p-0.5 flex items-center justify-center hover:bg-muted/50 active:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
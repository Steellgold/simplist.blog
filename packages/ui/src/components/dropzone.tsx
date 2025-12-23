"use client";

import { useCallback, type ReactNode } from "react";
import { useDropzone, type Accept, type DropzoneOptions } from "react-dropzone";
import { cva, type VariantProps } from "class-variance-authority";
import { Upload, FileUp, X, Loader2 } from "lucide-react";

import { cn } from "@simplist/ui/lib/utils";
import { Button } from "@simplist/ui/components/button";

const dropzoneVariants = cva(
  "relative flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
  {
    variants: {
      size: {
        default: "flex-col gap-2 p-8 h-64",
        sm: "gap-3 h-20 w-full",
      },
      state: {
        default:
          "border-border hover:border-foreground/25 bg-muted/50 hover:bg-muted/80",
        active: "border-foreground/50 bg-muted",
        hasFile: "border-foreground/25 bg-muted/80",
        disabled: "cursor-not-allowed opacity-50 border-border",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

export interface DropzoneFile {
  file: File;
  name: string;
}

export interface DropzoneProps extends VariantProps<typeof dropzoneVariants> {
  /**
   * Callback when files are dropped
   */
  onDrop: (files: File[]) => void;
  /**
   * Accept specific file types
   * @example { "image/*": [".jpeg", ".jpg", ".png"] }
   */
  accept?: Accept;
  /**
   * Allow multiple files
   * @default true
   */
  multiple?: boolean;
  /**
   * Disable the dropzone
   * @default false
   */
  disabled?: boolean;
  /**
   * Show loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * Currently selected file (for sm variant)
   */
  file?: DropzoneFile | null;
  /**
   * Callback to clear the selected file
   */
  onClear?: () => void;
  /**
   * Label for the upload button
   * @default "Upload file"
   */
  label?: string;
  /**
   * Description text (shown below label in default size)
   * @default "or drag and drop"
   */
  description?: string;
  /**
   * Hint text (file types, size limits, etc.)
   * @example "JPEG, PNG, WebP up to 5MB"
   */
  hint?: string;
  /**
   * Custom icon to display
   */
  icon?: ReactNode;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Additional dropzone options
   */
  dropzoneOptions?: Omit<
    DropzoneOptions,
    "onDrop" | "accept" | "multiple" | "disabled"
  >;
}

export function Dropzone({
  onDrop,
  accept,
  multiple = true,
  disabled = false,
  isLoading = false,
  file,
  onClear,
  label = "Upload file",
  description = "or drag and drop",
  hint,
  icon,
  size = "default",
  className,
  dropzoneOptions,
}: DropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!disabled && !isLoading && acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    [onDrop, disabled, isLoading],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple,
    disabled: disabled || isLoading,
    ...dropzoneOptions,
  });

  const isDisabled = disabled || isLoading;

  const getState = (): VariantProps<typeof dropzoneVariants>["state"] => {
    if (isDisabled) return "disabled";
    if (isDragActive) return "active";
    if (file) return "hasFile";
    return "default";
  };

  const IconComponent = icon ?? (
    <Upload className={cn(size === "sm" ? "size-4" : "size-8")} />
  );

  // Small variant with file selected
  if (size === "sm" && file) {
    return (
      <div
        {...getRootProps()}
        className={cn(dropzoneVariants({ size, state: getState() }), className)}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-2">
          <FileUp className="text-foreground size-4" />
          <span className="text-sm font-medium">{file.name}</span>
          {onClear && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Small variant without file
  if (size === "sm") {
    return (
      <div
        {...getRootProps()}
        className={cn(dropzoneVariants({ size, state: getState() }), className)}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{IconComponent}</div>
          <div className="text-muted-foreground text-sm">
            <span className="font-semibold">{label}</span> {description}
            {hint && <span className="ml-2 text-xs">({hint})</span>}
          </div>
        </div>
      </div>
    );
  }

  // Default (large) variant
  return (
    <div
      {...getRootProps()}
      className={cn(dropzoneVariants({ size, state: getState() }), className)}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Uploading...</p>
        </div>
      ) : isDragActive ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-foreground">{IconComponent}</div>
          <p className="text-foreground text-sm font-medium">Drop files here</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-muted-foreground">{IconComponent}</div>
          <p className="text-muted-foreground text-sm">
            {label}, {description}
          </p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
      )}
    </div>
  );
}

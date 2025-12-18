"use client"

import { Button } from "@simplist/ui/components/button"
import { toast } from "@simplist/ui/components/sonner"
import { cn } from "@simplist/ui/lib/utils"
import { Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface AvatarUploadProps {
  projectId: string
  currentAvatarUrl?: string | null
  onFileSelect: (file: File | null) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export function AvatarUpload({
  projectId,
  currentAvatarUrl,
  onFileSelect,
  onRemove,
  disabled = false,
  className
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
      return
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size: 2MB")
      return
    }

    // Revoke old preview URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create preview with blob URL
    const blobUrl = URL.createObjectURL(file)
    setPreviewUrl(blobUrl)
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleRemoveAvatar = () => {
    // Revoke blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setSelectedFile(null)
    onFileSelect(null)
    onRemove?.()

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Project avatar"
              className="w-20 h-20 rounded-lg object-cover border"
            />

            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
            <Upload className="text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload />
          {previewUrl ? "Change Avatar" : "Upload Avatar"}
        </Button>

        <p className="text-xs text-muted-foreground mt-1">
          Max 2MB. Supported formats: JPEG, PNG, WebP, GIF
        </p>
      </div>
    </div>
  )
}

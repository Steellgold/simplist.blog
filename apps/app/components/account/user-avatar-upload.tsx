"use client";

import { deleteUserAvatar, updateUserAvatar } from "@/lib/actions/user";
import { User } from "@/lib/auth-client";
import { Button } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UserAvatarUploadProps {
  user: User;
  disabled?: boolean;
}

export function UserAvatarUpload({
  user,
  disabled = false,
}: UserAvatarUploadProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size: 2MB");
      return;
    }

    // Revoke old preview URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview with blob URL
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setSelectedFile(file);

    // Auto-upload on file selection
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);

    toast.promise(
      (async () => {
        // Upload to R2
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads/avatar/user", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const { publicUrl } = await response.json();

        // Update user in database
        await updateUserAvatar(publicUrl);

        setIsUploading(false);
        setSelectedFile(null);
        router.refresh();

        return publicUrl;
      })(),
      {
        loading: "Uploading avatar...",
        success: "Avatar updated successfully",
        error: (err: unknown) => {
          setIsUploading(false);
          const message =
            err instanceof Error ? err.message : "Failed to upload avatar";
          return message;
        },
      },
    );
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);

    toast.promise(
      (async () => {
        // Revoke blob URL
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }

        // Delete from database
        await deleteUserAvatar();

        setPreviewUrl(null);
        setSelectedFile(null);
        setIsUploading(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        router.refresh();
      })(),
      {
        loading: "Removing avatar...",
        success: "Avatar removed successfully",
        error: (err: unknown) => {
          setIsUploading(false);
          const message =
            err instanceof Error ? err.message : "Failed to remove avatar";
          return message;
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="User avatar"
              className="size-16 rounded-md border-2 object-cover"
            />

            {!disabled && !isUploading && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute -top-1 -right-1 rounded-full p-1 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}

            {isUploading && (
              <div className="bg-background/50 absolute inset-0 flex items-center justify-center rounded-full">
                <Spinner />
              </div>
            )}
          </div>
        ) : (
          <div className="border-muted-foreground/25 flex size-20 items-center justify-center rounded-full border-2 border-dashed">
            {isUploading ? (
              <Spinner />
            ) : (
              <Upload className="text-muted-foreground/50" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Spinner /> : <Upload />}
          {previewUrl ? "Change Avatar" : "Upload Avatar"}
        </Button>

        <p className="text-muted-foreground mt-1 text-xs">
          Max 2MB. Supported formats: JPEG, PNG, WebP, GIF
        </p>
      </div>
    </div>
  );
}

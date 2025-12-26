"use client";

import { MediaPicker } from "@/components/media/media-picker";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  FILE_SIZE_LIMITS,
  formatFileSizeLimit,
  isAllowedImageType,
} from "@/lib/uploads/constants";
import { FileArrowUp, Folder, TrashBin } from "@gravity-ui/icons";
import type { ChangeEvent } from "react";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import { Progress } from "@simplist/ui/components/progress";
import { Spinner } from "@simplist/ui/components/spinner";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

type ArticleBannerUploadProps = {
  projectId: string;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onImageSelect: (url: string) => void;
  onRemoveImage: () => void;
  uploadLabel?: string;
  emptyDescription?: string;
  isRemoving?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
};

export const ArticleBannerUpload = ({
  projectId,
  imagePreview,
  onImageChange,
  onImageSelect,
  onRemoveImage,
  uploadLabel = "Upload Image",
  emptyDescription = "On the response API it will return the URL of the image.",
  isRemoving = false,
  isUploading = false,
  uploadProgress = 0,
}: ArticleBannerUploadProps) => {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      onImageChange(null);
      return;
    }

    // Check file type
    if (!isAllowedImageType(file.type)) {
      toast.error(
        `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`,
      );
      e.target.value = "";
      return;
    }

    // Check file size
    if (file.size > FILE_SIZE_LIMITS.ARTICLE_BANNER) {
      toast.error(
        `File too large. Maximum size: ${formatFileSizeLimit(FILE_SIZE_LIMITS.ARTICLE_BANNER)}`,
      );
      e.target.value = "";
      return;
    }

    onImageChange(file);
  };

  const triggerUpload = () => {
    document.getElementById("image-upload")?.click();
  };

  const handleDeleteClick = () => {
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    onRemoveImage();
    setDeleteAlertOpen(false);
  };

  const handleLibrarySelect = (url: string) => {
    onImageSelect(url);
    setLibraryOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Post Banner</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!imagePreview ? (
            <div className="space-y-3">
              <div className="flex w-full items-center justify-center">
                <label
                  htmlFor="image-upload"
                  className="bg-muted/50 hover:bg-muted/80 flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <FileArrowUp className="text-muted-foreground mb-2 h-4.5 w-4.5" />
                    <p className="text-muted-foreground mb-1 px-2 text-center text-sm">
                      <span className="font-semibold">Upload Image</span>
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLibraryOpen(true)}
              >
                <Folder />
                Library
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={imagePreview}
                  alt="Post banner preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />

                {isUploading && (
                  <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Spinner />
                      <span className="text-sm font-medium tabular-nums">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteClick}
                  disabled={isRemoving || isUploading}
                >
                  {isRemoving ? <Spinner /> : <TrashBin />}
                  Remove
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={triggerUpload}
                  disabled={isUploading}
                >
                  <FileArrowUp />
                  {uploadLabel}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLibraryOpen(true)}
                  disabled={isUploading}
                >
                  <Folder />
                  Library
                </Button>
              </div>

              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}

          {isUploading && (
            <Progress
              value={uploadProgress}
              className="h-1.5"
              indicatorClassName="bg-foreground"
            />
          )}
        </CardContent>

        <ConfirmDialog
          open={deleteAlertOpen}
          onOpenChange={setDeleteAlertOpen}
          onConfirm={confirmDelete}
          title="Remove cover image?"
          description="This will remove the cover image from this variant. This action will be applied when you update the article."
          confirmText="Remove Image"
          variant="destructive"
        />
      </Card>

      <MediaPicker
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        projectId={projectId}
        onSelect={handleLibrarySelect}
        title="Choose from library"
        description="Select an image from your media library."
        confirmText="Select image"
      />
    </>
  );
};

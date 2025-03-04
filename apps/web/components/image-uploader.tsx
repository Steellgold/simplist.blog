"use client";

import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@workspace/ui/components/button";
import { Component } from "@workspace/ui/components/utils/component";
import { Building, XIcon } from "lucide-react";
import Image from "next/image";

type ImageUploadProps = {
  defaultImageUrl?: string;
};

export const ImageUpload: Component<ImageUploadProps> = ({ defaultImageUrl }) => {
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    fileName,
  } = useImageUpload();

  return (
    <div>
      <div className="relative inline-flex">
        <Button
          variant="outline"
          className="relative size-16 overflow-hidden"
          onClick={handleThumbnailClick}
          aria-label={previewUrl ? "Change image" : "Upload image"}
        >
          {previewUrl ? (
            <Image
              className="h-full w-full object-cover"
              src={previewUrl || defaultImageUrl || ""}
              alt="Preview of uploaded image"
              width={40}
              height={40}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <Building className="opacity-60" size={16} />
            </div>
          )}
        </Button>
        {previewUrl && (
          <Button
            onClick={handleRemove}
            size="icon"
            variant="destructive"
            className="border-background absolute -top-2 -right-2 size-6 rounded-full border-2"
            aria-label="Remove image"
          >
            <XIcon size={16} />
          </Button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg, image/png"
          aria-label="Upload image file"
        />
      </div>

      {fileName && <p className="text-muted-foreground mt-2 text-xs">{fileName}</p>}

      <div className="sr-only" aria-live="polite" role="status">
        {previewUrl ? "Image uploaded and preview available" : "No image uploaded"}
      </div>
    </div>
  );
}

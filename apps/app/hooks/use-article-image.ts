"use client";

import { type LanguageCode } from "@/lib/types/languages";
import { useCallback, useState } from "react";

type UseArticleImageOptions = {
  activeVariant: LanguageCode;
  updateActiveVariant: (updates: { coverImage?: string }) => void;
};

type UseArticleImageReturn = {
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  imageFiles: Map<LanguageCode, File>;
  isBannerUploading: boolean;
  setIsBannerUploading: (value: boolean) => void;
  bannerUploadProgress: number;
  setBannerUploadProgress: (value: number) => void;
  handlePickedImage: (file: File | null) => void;
  handleImageSelect: (url: string) => void;
  handleRemoveImage: () => void;
  resetUploadState: () => void;
};

/**
 * Hook to manage article cover image state and operations.
 * Shared between create and edit forms.
 */
export const useArticleImage = ({
  activeVariant,
  updateActiveVariant,
}: UseArticleImageOptions): UseArticleImageReturn => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<Map<LanguageCode, File>>(
    new Map(),
  );
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  // Handle image upload from file picker
  const handlePickedImage = useCallback(
    (file: File | null) => {
      if (!file) {
        setImageFiles((prev) => {
          const next = new Map(prev);
          next.delete(activeVariant);
          return next;
        });
        setImagePreview(null);
        updateActiveVariant({ coverImage: undefined });
        return;
      }

      setImageFiles((prev) => {
        const next = new Map(prev);
        next.set(activeVariant, file);
        return next;
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        updateActiveVariant({ coverImage: imageUrl });
      };
      reader.readAsDataURL(file);
    },
    [activeVariant, updateActiveVariant],
  );

  // Handle image selection from media library
  const handleImageSelect = useCallback(
    (url: string) => {
      // Clear any pending file upload for this variant
      setImageFiles((prev) => {
        const next = new Map(prev);
        next.delete(activeVariant);
        return next;
      });
      setImagePreview(url);
      updateActiveVariant({ coverImage: url });
    },
    [activeVariant, updateActiveVariant],
  );

  // Remove image (just clears local state)
  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImageFiles((prev) => {
      const next = new Map(prev);
      next.delete(activeVariant);
      return next;
    });
    updateActiveVariant({ coverImage: undefined });

    // Reset file input if it exists
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
  }, [activeVariant, updateActiveVariant]);

  // Reset upload state (for error handling)
  const resetUploadState = useCallback(() => {
    setIsBannerUploading(false);
    setBannerUploadProgress(0);
  }, []);

  return {
    imagePreview,
    setImagePreview,
    imageFiles,
    isBannerUploading,
    setIsBannerUploading,
    bannerUploadProgress,
    setBannerUploadProgress,
    handlePickedImage,
    handleImageSelect,
    handleRemoveImage,
    resetUploadState,
  };
};

// Allowed image MIME types (shared across all image uploads)
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

// File size limits by upload type
export const FILE_SIZE_LIMITS = {
  /** 2MB for user avatars */
  USER_AVATAR: 2 * 1024 * 1024,
  /** 2MB for project avatars */
  PROJECT_AVATAR: 2 * 1024 * 1024,
  /** 5MB for article banners */
  ARTICLE_BANNER: 5 * 1024 * 1024,
  /** 10MB for general media/content images */
  MEDIA: 10 * 1024 * 1024,
} as const;

export type FileSizeLimitKey = keyof typeof FILE_SIZE_LIMITS;

// Helper to format file size for display
export const formatFileSizeLimit = (bytes: number): string => {
  return `${bytes / 1024 / 1024}MB`;
};

// Validation helpers
export const isAllowedImageType = (mimeType: string): boolean => {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
};

export const isFileSizeValid = (size: number, limitKey: FileSizeLimitKey): boolean => {
  return size <= FILE_SIZE_LIMITS[limitKey];
};

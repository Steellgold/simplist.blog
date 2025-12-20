"use client";

import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import { Dropzone } from "@simplist/ui/components/dropzone";
import { Progress } from "@simplist/ui/components/progress";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MediaUploadDialog: FC<MediaUploadDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onUploadComplete,
}: MediaUploadDialogProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUploadingFiles([]);
      setIsUploading(false);
    }
  }, [open]);

  const uploadFile = useCallback(
    async (file: File, index: number) => {
      // Update status to uploading
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "uploading" as const } : f,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        const response = await fetch("/api/uploads/media", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        // Update status to success
        setUploadingFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, status: "success" as const, progress: 100 }
              : f,
          ),
        );
      } catch (error) {
        // Update status to error
        setUploadingFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  status: "error" as const,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f,
          ),
        );
      }
    },
    [projectId],
  );

  const startUploads = useCallback(async () => {
    setIsUploading(true);

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < uploadingFiles.length; i++) {
      const file = uploadingFiles[i];
      if (file && file.status === "pending") {
        await uploadFile(file.file, i);
      }
    }

    setIsUploading(false);
  }, [uploadingFiles, uploadFile]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return false;
      }
      return true;
    });

    const newFiles: UploadingFile[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const hasSuccessfulUploads = uploadingFiles.some(
      (f) => f.status === "success",
    );
    if (hasSuccessfulUploads) {
      onUploadComplete();
    } else {
      onOpenChange(false);
    }
  };

  const allDone = uploadingFiles.every(
    (f) => f.status === "success" || f.status === "error",
  );
  const hasFiles = uploadingFiles.length > 0;
  const pendingCount = uploadingFiles.filter(
    (f) => f.status === "pending",
  ).length;
  const successCount = uploadingFiles.filter(
    (f) => f.status === "success",
  ).length;
  const errorCount = uploadingFiles.filter((f) => f.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>
            Upload images to use in your articles. Supported formats: JPEG, PNG,
            WebP, GIF. Max size: 10MB.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <Dropzone
          onDrop={handleDrop}
          accept={{
            "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
          }}
          multiple={true}
          disabled={isUploading}
          isLoading={isUploading}
          label="Upload images"
          description="or drag and drop"
          hint="JPEG, PNG, WebP, GIF up to 10MB"
          dropzoneOptions={{
            maxSize: MAX_FILE_SIZE,
          }}
        />

        {/* File list */}
        {hasFiles && (
          <div className="max-h-[200px] space-y-2 overflow-y-auto">
            {uploadingFiles.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {item.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="text-destructive h-5 w-5" />
                  )}
                  {(item.status === "pending" ||
                    item.status === "uploading") && (
                    <div className="border-muted-foreground/25 h-5 w-5 rounded-full border-2" />
                  )}
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.file.name}
                  </p>
                  {item.status === "uploading" && (
                    <Progress value={50} className="mt-1 h-1" />
                  )}
                  {item.status === "error" && (
                    <p className="text-destructive text-xs">{item.error}</p>
                  )}
                </div>

                {/* Remove button */}
                {item.status === "pending" && !isUploading && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {hasFiles && allDone && (
          <div className="text-muted-foreground text-sm">
            {successCount > 0 && (
              <span className="text-green-600">
                {successCount} file{successCount !== 1 ? "s" : ""} uploaded
              </span>
            )}
            {successCount > 0 && errorCount > 0 && " · "}
            {errorCount > 0 && (
              <span className="text-destructive">
                {errorCount} file{errorCount !== 1 ? "s" : ""} failed
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {!isUploading && !allDone && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {hasFiles && !allDone && (
            <Button
              onClick={startUploads}
              disabled={isUploading || pendingCount === 0}
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
            </Button>
          )}

          {allDone && hasFiles && (
            <Button onClick={handleComplete}>Done</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

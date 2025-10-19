"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type ArticleBannerUploadProps = {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage: () => void;
  uploadLabel?: string; // "Upload Image" | "Change Image"
  emptyDescription?: string;
  isRemoving?: boolean;
};

export const ArticleBannerUpload = ({ imagePreview, onImageChange, onRemoveImage, uploadLabel = "Upload Image", emptyDescription = "On the response API it will return the URL of the image.", isRemoving = false }: ArticleBannerUploadProps) => {
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    
    if (!file) {
      onImageChange(null);
      return;
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`);
      e.target.value = ""; // Reset input
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      e.target.value = ""; // Reset input
      return;
    }

    onImageChange(file);
  };

  const triggerUpload = () => {
    document.getElementById("image-upload")?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Banner</CardTitle>
        <CardDescription>
          {emptyDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!imagePreview ? (
          <div className="flex items-center justify-center w-full">
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex flex-col items-center justify-center py-6">
                <Upload className="w-4.5 h-4.5 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground text-center px-2">
                  <span className="font-semibold">Upload Image</span>
                </p>
              </div>
              <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Post banner preview" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outlineDestructive" 
                size="sm" 
                className="flex-1" 
                onClick={onRemoveImage}
                disabled={isRemoving}
              >
                {isRemoving ? <Spinner /> : <Trash2 />}
                Remove Image
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={triggerUpload}>
                <Upload />
                {uploadLabel}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



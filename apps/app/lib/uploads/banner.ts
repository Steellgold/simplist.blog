export type BannerUploadOptions = {
  file: File;
  projectId: string;
  postId: string;
  onProgress?: (percent: number) => void;
};

export type BannerUploadResult = {
  key: string;
};

/**
 * Upload a banner image with progress tracking using XMLHttpRequest.
 */
export const uploadBannerWithProgress = (
  options: BannerUploadOptions,
): Promise<BannerUploadResult> => {
  const { file, projectId, postId, onProgress } = options;

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);
    form.append("postId", postId);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error("Failed to parse response"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("POST", "/api/uploads/banner");
    xhr.send(form);
  });
};

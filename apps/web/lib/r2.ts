import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const CDN_DOMAIN = process.env.CDN_DOMAIN || "cdn.simplist.blog";

if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("⚠️ Missing Cloudflare R2 configuration. File uploads will not work.");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export type FileType = 
  | "organization-logo" 
  | "post-image" 
  | "user-avatar"
  | "custom";

const generateFilePath = (
  fileType: FileType, 
  organizationId?: string, 
  userId?: string, 
  postId?: string, 
  customPath?: string
): string => {
  const timestamp = Date.now();
  
  switch (fileType) {
    case "organization-logo":
      if (!organizationId) throw new Error("organizationId is required for organization-logo");
      return `organizations/${organizationId}/logo-${timestamp}`;
    
    case "post-image":
      if (!organizationId) throw new Error("organizationId is required for post-image");
      if (!postId) throw new Error("postId is required for post-image");
      return `organizations/${organizationId}/posts/${postId}/image-${timestamp}`;
    
    case "user-avatar":
      if (!userId) throw new Error("userId is required for user-avatar");
      return `users/${userId}/avatar-${timestamp}`;
    
    case "custom":
      if (!customPath) throw new Error("customPath is required for custom file type");
      return customPath;
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Uploads a file to R2 with specific path based on type
 * @param file The file to upload
 * @param fileType The type of file which determines the storage path
 * @param options Additional options including IDs and file information
 * @returns The URL of the uploaded file with custom domain
 */
const uploadFile = async (
  file: Buffer | Blob,
  fileType: FileType,
  options: {
    organizationId?: string;
    userId?: string;
    postId?: string;
    customPath?: string;
    contentType?: string;
    extension?: string;
  } = {}
): Promise<string> => {
  try {
    let fileBuffer: Buffer;
    if (file instanceof Blob) {
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      fileBuffer = file;
    }

    const { organizationId, userId, postId, customPath, contentType = "image/png", extension = "png" } = options;
    
    const basePath = generateFilePath(fileType, organizationId, userId, postId, customPath);
    const key = `${basePath}.${extension}`;

    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(putCommand);

    return `https://${CDN_DOMAIN}/${key}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Generates a URL for a file using the custom domain
 * @param key The name of the file in the bucket
 * @returns The URL with custom domain
 */
const getFileUrl = async (key: string): Promise<string> => {
  try {
    return `https://${CDN_DOMAIN}/${key}`;
  } catch (error) {
    console.error("Error generating URL:", error);
    throw error;
  }
};

/**
 * Gets a signed URL for a file (used when direct CDN access isn't available)
 * @param key The name of the file in the bucket
 * @param expiresIn Duration of URL validity in seconds (default: 3600)
 * @returns The signed URL to access the file
 */
const getSignedFileUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, getCommand, { expiresIn });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

/**
 * Deletes a file from the bucket
 * @param key The name of the file to delete
 */
const deleteFile = async (key: string): Promise<void> => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

const deleteFolder = async (prefix: string): Promise<void> => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const { Contents } = await s3Client.send(listCommand);

    if (Contents) {
      const deleteCommands = Contents.map(({ Key }) => new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key,
      }));

      await Promise.all(deleteCommands.map((command) => s3Client.send(command)));
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

const R2 = {
  uploadFile,
  getFileUrl,
  getSignedFileUrl,
  deleteFile, deleteFolder,
  client: s3Client,
  bucketName: R2_BUCKET_NAME
};

export default R2;
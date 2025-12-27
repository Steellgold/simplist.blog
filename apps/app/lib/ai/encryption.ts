import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * Returns format: iv:authTag:encryptedData (all in hex)
 */
export const encrypt = (text: string): string => {
  const key = process.env.AI_ENCRYPTION_KEY;

  if (!key || key.length !== 32) {
    throw new Error("AI_ENCRYPTION_KEY must be exactly 32 characters for AES-256");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

/**
 * Decrypts a string encrypted with encrypt()
 * Expects format: iv:authTag:encryptedData (all in hex)
 */
export const decrypt = (encryptedText: string): string => {
  const key = process.env.AI_ENCRYPTION_KEY;

  if (!key || key.length !== 32) {
    throw new Error("AI_ENCRYPTION_KEY must be exactly 32 characters for AES-256");
  }

  const parts = encryptedText.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivHex, authTagHex, encrypted] = parts;

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

/**
 * Validates that the encryption key is properly configured
 */
export const isEncryptionConfigured = (): boolean => {
  const key = process.env.AI_ENCRYPTION_KEY;
  return !!key && key.length === 32;
};
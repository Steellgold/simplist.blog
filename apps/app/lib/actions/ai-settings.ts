"use server";

import { prisma } from "@simplist/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/permissions";
import { encrypt, isEncryptionConfigured } from "@/lib/ai/encryption";
import {
  getProjectSubscription,
  getAiUsageStats,
} from "@/lib/subscription/quota-check";

export type AiSettingsResult =
  | { success: true }
  | { success: false; error: string };

export type AiSettings = {
  hasApiKey: boolean;
  hasIncludedCredits: boolean;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  canUseAi: boolean;
};

/**
 * Get AI settings for a project
 */
export const getProjectAiSettings = async (
  projectId: string,
): Promise<AiSettings> => {
  await requirePermission(projectId, "canManageProject");

  const subscription = await getProjectSubscription(projectId);
  const usage = await getAiUsageStats(projectId);

  const canUseAi =
    subscription.limits.features.aiFeatures &&
    (usage.hasIncludedCredits || usage.hasApiKey);

  return {
    hasApiKey: usage.hasApiKey,
    hasIncludedCredits: usage.hasIncludedCredits,
    aiRequestsUsed: usage.current,
    aiRequestsLimit: usage.limit,
    canUseAi,
  };
};

/**
 * Update OpenAI API key for a project (BYOK)
 * The key will be encrypted before storage
 */
export const updateProjectApiKey = async (
  projectId: string,
  apiKey: string | null,
): Promise<AiSettingsResult> => {
  try {
    await requirePermission(projectId, "canManageProject");

    // Check if encryption is configured
    if (apiKey && !isEncryptionConfigured()) {
      return {
        success: false,
        error: "Encryption is not configured. Please contact support.",
      };
    }

    // Validate API key format (basic check)
    if (apiKey && !apiKey.startsWith("sk-")) {
      return {
        success: false,
        error: "Invalid API key format. OpenAI API keys start with 'sk-'.",
      };
    }

    // Encrypt and store the API key
    const encryptedKey = apiKey ? encrypt(apiKey) : null;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        openaiApiKey: encryptedKey,
      },
    });

    // Get project slug for revalidation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    if (project) {
      revalidatePath(`/${project.slug}/settings`, "page");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update API key:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update API key",
    };
  }
};

/**
 * Remove OpenAI API key from a project
 */
export const removeProjectApiKey = async (
  projectId: string,
): Promise<AiSettingsResult> => {
  return updateProjectApiKey(projectId, null);
};

/**
 * Validate an OpenAI API key by making a simple request
 * This does NOT store the key - just validates it works
 */
export const validateApiKey = async (
  projectId: string,
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> => {
  try {
    await requirePermission(projectId, "canManageProject");

    // Basic format validation
    if (!apiKey.startsWith("sk-")) {
      return {
        valid: false,
        error: "Invalid API key format. OpenAI API keys start with 'sk-'.",
      };
    }

    // Try to make a simple API call to validate the key
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } })?.error?.message ||
      "Invalid API key";

    return {
      valid: false,
      error: errorMessage,
    };
  } catch (error) {
    console.error("API key validation error:", error);
    return {
      valid: false,
      error: "Failed to validate API key. Please try again.",
    };
  }
};

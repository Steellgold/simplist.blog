import { getProjectSubscription } from "@/lib/subscription/quota-check";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@simplist/db";
import { decrypt } from "./encryption";

export const AI_MODEL_NAME = "gpt-4o-mini";

/**
 * Gets the OpenAI model configured for a project.
 * - PRO plans: Uses Simplist's API key from environment
 * - STARTER plans: Uses project's BYOK (Bring Your Own Key)
 */
export const getAiModelForProject = async (projectId: string) => {
  const subscription = await getProjectSubscription(projectId);

  let apiKey: string;

  if (subscription.limits.features.aiIncludedCredits) {
    // PRO: Use Simplist's API key
    const envKey = process.env.OPENAI_API_KEY;

    if (!envKey) {
      throw new Error("OpenAI API key not configured on the server.");
    }

    apiKey = envKey;
  } else {
    // STARTER: Use project's BYOK
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { openaiApiKey: true },
    });

    if (!project?.openaiApiKey) {
      throw new Error(
        "No OpenAI API key configured. Please add your API key in project settings to use AI features.",
      );
    }

    try {
      apiKey = decrypt(project.openaiApiKey);
    } catch {
      throw new Error(
        "Failed to decrypt API key. Please re-enter your API key in project settings.",
      );
    }
  }

  const openai = createOpenAI({ apiKey });

  // Use the chat completion model explicitly
  const model = openai.chat(AI_MODEL_NAME);

  return model;
};

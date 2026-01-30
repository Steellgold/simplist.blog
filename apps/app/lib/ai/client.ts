import { getProjectSubscription } from "@/lib/subscription/quota-check";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@simplist/db";
import { decrypt } from "./encryption";

export const AI_MODEL_NAME = "gpt-4o-mini";

/**
 * Gets the OpenAI model configured for a project.
 * BYOK-first approach:
 * - If BYOK is configured: Use it (unlimited, doesn't consume included credits)
 * - Otherwise: Use included credits if available
 * - Returns { model, usingByok } to track which method is being used
 */
export const getAiModelForProject = async (projectId: string) => {
  const subscription = await getProjectSubscription(projectId);

  let apiKey: string;
  let usingByok = false;

  // Check if user has BYOK configured
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { openaiApiKey: true },
  });

  if (project?.openaiApiKey) {
    // BYOK configured: Use it (doesn't consume included credits)
    try {
      apiKey = decrypt(project.openaiApiKey);
      usingByok = true;
    } catch {
      throw new Error(
        "Failed to decrypt API key. Please re-enter your API key in project settings.",
      );
    }
  } else {
    // No BYOK: Use included credits
    const currentRequests = subscription.usage.aiRequests;
    const limit = subscription.limits.maxAiRequestsPerMonth;
    const withinIncludedLimit = limit === -1 || currentRequests < limit;

    if (!withinIncludedLimit) {
      throw new Error(
        `You've used all ${limit} included AI requests this month. Add your own OpenAI API key in project settings for unlimited requests.`,
      );
    }

    const envKey = process.env.OPENAI_API_KEY;

    if (!envKey) {
      throw new Error(
        "OpenAI API key not configured on the server. Please add your own API key in project settings to use AI features.",
      );
    }

    apiKey = envKey;
  }

  const openai = createOpenAI({ apiKey });

  // Use the chat completion model explicitly
  const model = openai.chat(AI_MODEL_NAME);

  return { model, usingByok };
};

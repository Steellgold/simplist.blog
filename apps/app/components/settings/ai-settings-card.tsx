"use client";

import { useState } from "react";
import { Eye, EyeSlash, TrashBin } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@simplist/ui/components/card";
import { Progress } from "@simplist/ui/components/progress";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@simplist/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@simplist/ui/components/input-group";
import { Spinner } from "@simplist/ui/components/spinner";
import { toast } from "@simplist/ui/components/sonner";
import { MiniBadge } from "@/components/ui/mini-badge";
import {
  updateProjectApiKey,
  validateApiKey,
  type AiSettings,
} from "@/lib/actions/ai-settings";
import Link from "next/link";
import { addDays, format } from "date-fns";

type AiSettingsCardProps = {
  projectId: string;
  initialSettings: AiSettings;
  subscriptionTier: "STARTER" | "PRO";
  disabled?: boolean;
};

const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-yellow-500";
  return "bg-primary";
};

export const AiSettingsCard = ({
  projectId,
  initialSettings,
  subscriptionTier,
  disabled = false,
}: AiSettingsCardProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(initialSettings.hasApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // PRO users have included credits, they don't need to configure a key
  const isPro = subscriptionTier === "PRO";

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setValidationError("Please enter an API key");
      return;
    }

    // Validate first
    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateApiKey(projectId, apiKey);

      if (!result.valid) {
        setValidationError(result.error || "Invalid API key");
        setIsValidating(false);
        return;
      }
    } catch {
      setValidationError("Failed to validate API key");
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
    setIsSaving(true);

    try {
      const result = await updateProjectApiKey(projectId, apiKey);

      if (result.success) {
        setHasApiKey(true);
        setApiKey("");
        toast.success("API key saved successfully");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setIsRemoving(true);

    try {
      const result = await updateProjectApiKey(projectId, null);

      if (result.success) {
        setHasApiKey(false);
        setApiKey("");
        toast.success("API key removed");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to remove API key");
    } finally {
      setIsRemoving(false);
    }
  };

  const isDisabled = disabled || isSaving || isRemoving || isValidating;
  const hasChanges = apiKey.trim().length > 0;

  // Calculate AI usage percentage
  const aiUsagePercentage =
    initialSettings.aiRequestsLimit === -1
      ? 0
      : (initialSettings.aiRequestsUsed / initialSettings.aiRequestsLimit) *
        100;

  // PRO users see their usage stats
  if (isPro) {
    return (
      <Card variant="form">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FieldLabel className="text-base font-medium">
              AI Features
            </FieldLabel>
            <MiniBadge tier="PRO" size="sm" />
          </div>
          <FieldDescription className="mt-1">
            AI features are included with your Pro plan.
          </FieldDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Monthly AI requests</span>
              <span className="text-muted-foreground">
                {initialSettings.aiRequestsUsed} /{" "}
                {initialSettings.aiRequestsLimit === -1
                  ? "Unlimited"
                  : initialSettings.aiRequestsLimit}
              </span>
            </div>

            {initialSettings.aiRequestsLimit !== -1 && (
              <Progress
                value={aiUsagePercentage}
                className="h-2"
                indicatorClassName={getProgressColor(aiUsagePercentage)}
              />
            )}
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Resets on{" "}
            {format(
              addDays(initialSettings.aiRequestsResetAt, 30),
              "MMMM d, yyyy",
            )}
          </p>
        </CardFooter>
      </Card>
    );
  }

  // STARTER users see usage stats + BYOK option
  return (
    <Card variant="form">
      <CardHeader>
        <FieldLabel className="text-base font-medium">AI Features</FieldLabel>
        <FieldDescription className="mt-1">
          {initialSettings.aiRequestsLimit} AI requests/month included
        </FieldDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Usage stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly requests</span>
              <span className="font-medium">
                {initialSettings.aiRequestsUsed} /{" "}
                {initialSettings.aiRequestsLimit}
              </span>
            </div>

            <Progress
              value={aiUsagePercentage}
              className="h-2"
              indicatorClassName={getProgressColor(aiUsagePercentage)}
            />

            <p className="text-muted-foreground text-xs">
              Resets{" "}
              {format(addDays(initialSettings.aiRequestsResetAt, 30), "MMM d")}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* BYOK section */}
          <div className="space-y-3">
            {hasApiKey ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>

                  <span className="font-medium">API key configured</span>
                  <span className="text-muted-foreground">
                    (unlimited requests)
                  </span>
                </div>

                <p className="text-muted-foreground text-sm">
                  Want to update your key? Remove the current one first.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">
                  Need more? Add your API key
                </p>

                <InputGroup className="max-w-md">
                  <InputGroupInput
                    id="openai-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-proj-..."
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setValidationError(null);
                    }}
                    disabled={isDisabled}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      onClick={() => setShowKey(!showKey)}
                      disabled={isDisabled}
                    >
                      {showKey ? <EyeSlash /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {validationError && <FieldError>{validationError}</FieldError>}
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {hasApiKey ? (
          <>
            <p className="text-muted-foreground text-sm">
              Using your own OpenAI API key
            </p>
            <Button
              type="button"
              variant="outline-destructive"
              size="sm"
              onClick={handleRemoveKey}
              disabled={isDisabled}
            >
              {isRemoving ? <Spinner /> : <TrashBin />}
              Remove
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Get your key from{" "}
              <Link
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OpenAI Dashboard
              </Link>
            </p>
            <Button
              type="button"
              onClick={handleSaveKey}
              disabled={isDisabled || !hasChanges}
            >
              {isValidating || isSaving ? (
                <>
                  <Spinner />
                  {isValidating ? "Validating..." : "Saving..."}
                </>
              ) : (
                "Save"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

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

type AiSettingsCardProps = {
  projectId: string;
  initialSettings: AiSettings;
  subscriptionTier: "STARTER" | "PRO";
  disabled?: boolean;
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

  // PRO users see their usage stats
  if (isPro) {
    const remaining =
      initialSettings.aiRequestsLimit === -1
        ? "Unlimited"
        : `${initialSettings.aiRequestsLimit - initialSettings.aiRequestsUsed} remaining`;

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
          <div className="text-sm">
            <span className="text-muted-foreground">Monthly usage: </span>
            <span className="font-medium">
              {initialSettings.aiRequestsUsed}
            </span>
            <span className="text-muted-foreground">
              {" "}
              /{" "}
              {initialSettings.aiRequestsLimit === -1
                ? "Unlimited"
                : initialSettings.aiRequestsLimit}
            </span>
            <span className="text-muted-foreground ml-2">({remaining})</span>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Usage resets monthly. Upgrade for higher limits.
          </p>
        </CardFooter>
      </Card>
    );
  }

  // STARTER users need to configure their API key (BYOK)
  return (
    <Card variant="form">
      <CardHeader>
        <FieldLabel htmlFor="openai-api-key" className="text-base font-medium">
          OpenAI API Key
        </FieldLabel>
        <FieldDescription className="mt-1">
          {hasApiKey
            ? "Your API key is configured and encrypted. AI features are enabled."
            : "Add your OpenAI API key to use AI features like correction, rewriting, and SEO optimization."}
        </FieldDescription>
      </CardHeader>

      <CardContent>
        {hasApiKey ? (
          <div className="text-sm">
            <span className="text-muted-foreground">Status: </span>
            <span className="font-medium text-green-600">Configured</span>
            <span className="text-muted-foreground"> (encrypted)</span>
          </div>
        ) : (
          <div className="space-y-2">
            <InputGroup className="max-w-md">
              <InputGroupInput
                id="openai-api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
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
          </div>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-muted-foreground text-sm">
          {hasApiKey ? (
            "To update your key, remove it first then add a new one."
          ) : (
            <>
              Get your key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OpenAI Dashboard
              </a>
              . Stored with AES-256 encryption.
            </>
          )}
        </p>
        {hasApiKey ? (
          <Button
            type="button"
            variant="outline-destructive"
            onClick={handleRemoveKey}
            disabled={isDisabled}
          >
            {isRemoving ? <Spinner className="size-4" /> : <TrashBin />}
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSaveKey}
            disabled={isDisabled || !hasChanges}
          >
            {isValidating || isSaving ? (
              <>
                <Spinner className="size-4" />
                {isValidating ? "Validating..." : "Saving..."}
              </>
            ) : (
              "Save"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

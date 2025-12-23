"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@simplist/ui/components/sonner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  createWebhook,
  testWebhookFromData,
  updateWebhook,
} from "@/lib/actions/webhooks";
import {
  createWebhookSchema,
  type CreateWebhookInput,
  type WebhookEvent,
} from "@/lib/validations/webhooks";
import { useWebhookFormContext } from "../form/form-context";
import type { WebhookFormData, WebhookFormMode } from "../types";
import { formatJson, isValidJson } from "../utils";

type UseWebhookFormProps = {
  projectId: string;
  projectSlug: string;
  webhook?: WebhookFormData;
  mode: WebhookFormMode;
};

export function useWebhookForm({
  projectId,
  projectSlug,
  webhook,
  mode,
}: UseWebhookFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setIsPending, setHandleTest } = useWebhookFormContext();

  // Form setup
  const form = useForm<CreateWebhookInput>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      name: webhook?.name ?? "",
      url: webhook?.url ?? "",
      events: (webhook?.events as WebhookEvent[]) ?? ["article.published"],
      secret: webhook?.secret ?? "",
      headers: webhook?.headers ?? undefined,
      status: (webhook?.status as "active" | "disabled") ?? "active",
      customPayload: webhook?.customPayload ?? undefined,
    },
  });

  const {
    setValue,
    watch,
    getValues,
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  // Watch values
  const selectedEvents = watch("events") ?? [];
  const customPayload = watch("customPayload");

  // Local state for textarea value (to handle invalid JSON while typing)
  const [customPayloadText, setCustomPayloadText] = useState<string>("");

  // Initialize customPayloadText from customPayload (only on mount or when webhook changes)
  useEffect(() => {
    if (webhook?.customPayload) {
      if (typeof webhook.customPayload === "string") {
        setCustomPayloadText(webhook.customPayload);
      } else {
        setCustomPayloadText(formatJson(webhook.customPayload));
      }
    } else if (!webhook) {
      setCustomPayloadText("");
    }
  }, [webhook?.customPayload, webhook]);

  // Sync isPending with context
  useEffect(() => {
    setIsPending(isPending);
  }, [isPending, setIsPending]);

  // Form ID
  const formId = `webhook-form-${mode}`;

  // Submit handler
  const onSubmit = (data: CreateWebhookInput) => {
    startTransition(() => {
      const promise =
        mode === "create"
          ? createWebhook(projectId, data)
          : updateWebhook(webhook!.id, projectId, data);

      toast.promise(promise, {
        loading:
          mode === "create" ? "Creating webhook..." : "Updating webhook...",
        success: () => {
          router.push(`/${projectSlug}/webhooks`);
          router.refresh();
          return mode === "create" ? "Webhook created" : "Webhook updated";
        },
        error: (err: unknown) =>
          err instanceof Error ? err.message : "Failed to save webhook",
      });
    });
  };

  // Test webhook handler - memoized to avoid re-creating on every render
  const handleTest = useCallback(() => {
    const formData = getValues();
    const firstEvent =
      (formData.events?.[0] as WebhookEvent) ?? "article.published";

    if (!formData.url) {
      toast.error("Please enter a webhook URL");
      return;
    }

    startTransition(() => {
      toast.promise(
        testWebhookFromData(projectId, {
          url: formData.url,
          event: firstEvent,
          secret: formData.secret || undefined,
          headers: formData.headers || undefined,
          customPayload: formData.customPayload || undefined,
        }),
        {
          loading: "Sending test...",
          success: (result) => {
            if (result.success) {
              return `Test sent successfully (HTTP ${result.statusCode})`;
            }
            throw new Error(result.error);
          },
          error: (err) => (err instanceof Error ? err.message : "Test failed"),
        },
      );
    });
  }, [getValues, projectId]);

  // Register test handler with context
  useEffect(() => {
    setHandleTest(handleTest);
    return () => setHandleTest(undefined);
  }, [handleTest, setHandleTest]);

  // Event toggle handler
  const toggleEvent = (event: WebhookEvent, checked: boolean) => {
    const next = new Set(selectedEvents);
    if (checked) next.add(event);
    else next.delete(event);
    setValue("events", Array.from(next) as WebhookEvent[]);
  };

  // Custom payload change handler
  const handleCustomPayloadChange = (value: string) => {
    setCustomPayloadText(value);

    if (!value.trim()) {
      setValue("customPayload", undefined);
    } else if (isValidJson(value)) {
      try {
        const parsed = JSON.parse(value);
        setValue("customPayload", parsed);
      } catch {
        // Invalid JSON, don't update customPayload
      }
    }
  };

  return {
    // Form
    form,
    formId,
    register,
    errors,
    handleSubmit: handleSubmit(onSubmit),

    // State
    isPending,
    selectedEvents,
    customPayload,
    customPayloadText,

    // Handlers
    handleTest,
    toggleEvent,
    handleCustomPayloadChange,
    setCustomPayloadText,
  };
}

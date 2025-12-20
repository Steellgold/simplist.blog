"use client";

import { FC } from "react";

import type { WebhookEvent } from "@/lib/validations/webhooks";
import { useWebhookForm } from "../hooks/use-webhook-form";
import type { WebhookFormData, WebhookFormMode } from "../types";

import { AdvancedSection } from "./advanced-section";
import { ConfigSection } from "./config-section";
import { PayloadSection } from "./payload-section";

type WebhookFormProps = {
  projectId: string;
  projectSlug: string;
  webhook?: WebhookFormData;
  mode: WebhookFormMode;
};

export const WebhookForm: FC<WebhookFormProps> = ({
  projectId,
  projectSlug,
  webhook,
  mode,
}) => {
  const {
    toggleEvent,
    handleCustomPayloadChange,
    setCustomPayloadText,
    formId,
    errors,
    isPending,
    selectedEvents,
    customPayloadText,
    register,
    handleSubmit,
  } = useWebhookForm({ projectId, projectSlug, webhook, mode });

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3">
      <ConfigSection
        register={register}
        errors={errors}
        isPending={isPending}
        selectedEvents={selectedEvents as WebhookEvent[]}
        onToggleEvent={toggleEvent}
      />

      <PayloadSection
        isPending={isPending}
        customPayloadText={customPayloadText}
        onCustomPayloadChange={handleCustomPayloadChange}
        setCustomPayloadText={setCustomPayloadText}
      />

      <AdvancedSection
        register={register}
        errors={errors}
        isPending={isPending}
        defaultHeaders={webhook?.headers}
      />
    </form>
  );
};

"use client"

import { FC } from "react"

import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Play } from "lucide-react"
import type { WebhookFormMode } from "../types"
import { useWebhookFormContext } from "./form-context"

type WebhookFormActionsProps = {
  mode: WebhookFormMode
  formId: string
}

export const WebhookFormActions: FC<WebhookFormActionsProps> = ({ mode, formId }) => {
  const { isPending, handleTest } = useWebhookFormContext()

  return (
    <ButtonGroup>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleTest}
      >
        <Play />
        Send test
      </Button>

      <Button
        type="submit"
        form={formId}
        disabled={isPending}
        variant={mode === "create" ? "default" : "outline"}
      >
        {mode === "create" ? "Create webhook" : "Save changes"}
      </Button>
    </ButtonGroup>
  )
}


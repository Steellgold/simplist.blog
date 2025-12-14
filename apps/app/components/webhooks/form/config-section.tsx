"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Checkbox } from "@simplist/ui/components/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { cn } from "@simplist/ui/lib/utils"
import { FC } from "react"
import { FieldErrors, UseFormRegister } from "react-hook-form"

import { eventMetadata, webhookEvents, type CreateWebhookInput, type WebhookEvent } from "@/lib/validations/webhooks"

type ConfigSectionProps = {
  register: UseFormRegister<CreateWebhookInput>
  errors: FieldErrors<CreateWebhookInput>
  isPending: boolean
  selectedEvents: WebhookEvent[]
  onToggleEvent: (event: WebhookEvent, checked: boolean) => void
}

export const ConfigSection: FC<ConfigSectionProps> = ({
  register, onToggleEvent,
  errors, isPending, selectedEvents,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Configure your webhook endpoint and select events to listen for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="My webhook"
                disabled={isPending}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="url">Webhook URL</FieldLabel>
              <Input
                id="url"
                placeholder="https://discord.com/api/webhooks/..."
                disabled={isPending}
                {...register("url")}
              />
              {errors.url && <FieldError>{errors.url.message}</FieldError>}
            </Field>

            <FieldSet>
              <FieldLegend>Events</FieldLegend>
              <FieldDescription>
                Select the events that will trigger this webhook
              </FieldDescription>

              <FieldGroup className="flex flex-row flex-wrap gap-2 [--radius:9999rem] **:data-[slot=checkbox]:rounded-full **:data-[slot=field]:gap-2 **:data-[slot=field]:overflow-hidden **:data-[slot=field]:px-1.5 **:data-[slot=field]:py-1 *:data-[slot=field-label]:w-fit">
                {webhookEvents.map((event) => {
                  const meta = eventMetadata[event]
                  const isChecked = selectedEvents.includes(event)
                  const eventId = `event-${event}`

                  return (
                    <FieldLabel
                      key={event}
                      htmlFor={eventId}
                      className={cn({ "opacity-50 cursor-not-allowed": isPending })}
                    >
                      <Field orientation="horizontal" className="px-2! py-1!">
                        <Checkbox
                          id={eventId}
                          checked={isChecked}
                          disabled={isPending}
                          onCheckedChange={(checked) => onToggleEvent(event, !!checked)}
                          className="-ml-6 -translate-x-1 transition-all duration-100 group-has-data-[state=checked]/field-label:ml-0 group-has-data-[state=checked]/field-label:translate-x-0"
                        />
                        <FieldTitle>{meta.name}</FieldTitle>
                      </Field>
                    </FieldLabel>
                  )
                })}
              </FieldGroup>

              {errors.events && <FieldError>{errors.events.message}</FieldError>}
            </FieldSet>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}


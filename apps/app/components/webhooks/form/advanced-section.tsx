"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { Textarea } from "@simplist/ui/components/textarea"
import { FC } from "react"
import { FieldErrors, UseFormRegister } from "react-hook-form"

import type { CreateWebhookInput } from "@/lib/validations/webhooks"

type AdvancedSectionProps = {
  register: UseFormRegister<CreateWebhookInput>
  errors: FieldErrors<CreateWebhookInput>
  isPending: boolean
  defaultHeaders?: Record<string, string> | null
}

export const AdvancedSection: FC<AdvancedSectionProps> = ({
  errors, isPending, defaultHeaders,
  register
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced options (optional)</CardTitle>
        <CardDescription>Secret, custom headers</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="secret">Secret</FieldLabel>
              <Input
                id="secret"
                type="password"
                placeholder="Used to sign requests with HMAC-SHA256"
                disabled={isPending}
                {...register("secret")}
              />
              <FieldDescription>
                If provided, requests will include an X-Simplist-Signature header
              </FieldDescription>
              {errors.secret && <FieldError>{errors.secret.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="headers">Custom HTTP headers</FieldLabel>
              <Textarea
                id="headers"
                placeholder={`{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}`}
                rows={3}
                disabled={isPending}
                className="font-mono text-sm"
                defaultValue={
                  defaultHeaders
                    ? JSON.stringify(defaultHeaders, null, 2)
                    : ""
                }
                {...register("headers", {
                  setValueAs: (val) => {
                    if (!val) return undefined
                    try {
                      return JSON.parse(val)
                    } catch {
                      return val
                    }
                  },
                })}
              />

              <FieldDescription>
                JSON format
              </FieldDescription>

              {errors.headers && <FieldError>Invalid JSON format</FieldError>}
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}


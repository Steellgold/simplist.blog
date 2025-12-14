"use client"

import Link from "next/link"
import { FC } from "react"

import { Discord, MicrosoftTeams, Slack } from "@ridemountainpig/svgl-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Field, FieldDescription, FieldGroup, FieldSet } from "@simplist/ui/components/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@simplist/ui/components/input-group"
import { Code } from "lucide-react"

type PayloadSectionProps = {
  isPending: boolean
  customPayloadText: string
  onCustomPayloadChange: (value: string) => void
  setCustomPayloadText: (value: string) => void
}

export const PayloadSection: FC<PayloadSectionProps> = ({
  onCustomPayloadChange, setCustomPayloadText,
  isPending, customPayloadText
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      // Get the current line
      const textBeforeCursor = value.substring(0, start)
      const lines = textBeforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]

      // Calculate indentation (count spaces at the start of the line)
      const indentMatch = currentLine.match(/^(\s*)/)
      const currentIndent = indentMatch ? indentMatch[1] : ""

      // Check if we're after an opening brace or bracket (add extra indent)
      const trimmedLine = currentLine.trim()
      const endsWithOpenBrace = trimmedLine.endsWith("{") || trimmedLine.endsWith("[")
      const extraIndent = endsWithOpenBrace ? "  " : ""
      const newIndent = currentIndent + extraIndent

      // Insert newline with indentation
      const textAfterCursor = value.substring(end)
      const newValue =
        value.substring(0, start) +
        "\n" +
        newIndent +
        textAfterCursor

      setCustomPayloadText(newValue)

      // Set cursor position after the indentation
      const newCursorPos = start + 1 + newIndent.length
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)

      e.preventDefault()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payload</CardTitle>
        <CardDescription>
          Customize the JSON payload sent to your webhook. Use our{" "}
          <Link
            href={`${process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.simplist.blog"}/webhooks`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            interactive webhook builder
          </Link>{" "}
          or see the official documentation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <InputGroup>
                <InputGroupAddon align="block-start">
                  <InputGroupButton variant="secondary" asChild>
                    <Link href="https://docs.simplist.blog/webhooks" target="_blank" rel="noopener noreferrer">
                      <Code />
                    </Link>
                  </InputGroupButton>

                  <InputGroupButton variant="secondary" asChild>
                    <Link href="https://discord.com/developers/docs/resources/webhook#execute-webhook" target="_blank" rel="noopener noreferrer">
                      <Discord />
                    </Link>
                  </InputGroupButton>

                  <InputGroupButton variant="secondary" asChild>
                    <Link href="https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/" target="_blank" rel="noopener noreferrer">
                      <Slack />
                    </Link>
                  </InputGroupButton>

                  <InputGroupButton variant="secondary" asChild>
                    <Link href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" target="_blank" rel="noopener noreferrer">
                      <MicrosoftTeams />
                    </Link>
                  </InputGroupButton>
                </InputGroupAddon>

                <InputGroupTextarea
                  id="customPayload"
                  value={customPayloadText}
                  onChange={(e) => onCustomPayloadChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='{"content": "New article: {title}"}'
                  rows={10}
                  disabled={isPending}
                  className="font-mono text-sm"
                />
              </InputGroup>

              <FieldDescription>
                Leave empty to use the default generic payload. Variables: {"{title}"}, {"{slug}"}, {"{excerpt}"}, {"{author}"}, {"{tags}"}, {"{publishedAt}"}, {"{url}"}, {"{event}"}, {"{coverImage}"}, {"{wordCount}"}, {"{characterCount}"}, {"{lineCount}"}, {"{readTimeMinutes}"}, {"{variantCount}"}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}


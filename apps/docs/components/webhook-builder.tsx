"use client"

import { Discord, MicrosoftTeams, Slack } from "@ridemountainpig/svgl-react"
import { Button } from "@simplist/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Checkbox } from "@simplist/ui/components/checkbox"
import { Input } from "@simplist/ui/components/input"
import { ColorPickerInputGroup } from "@simplist/ui/components/input-color-picker"
import { Label } from "@simplist/ui/components/label"
import { toast } from "@simplist/ui/components/sonner"
import { Switch } from "@simplist/ui/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplist/ui/components/tabs"
import { Textarea } from "@simplist/ui/components/textarea"
import { Check, Copy } from "lucide-react"
import { FC, useState } from "react"

type DiscordEmbedField = {
  name: string
  value: string
  inline: boolean
}

type DiscordFormData = {
  content: string
  title: string
  description: string
  color: string
  url: string
  authorName: string
  authorIconUrl: string
  authorUrl: string
  footerText: string
  footerIconUrl: string
  thumbnailUrl: string
  imageUrl: string
  fields: DiscordEmbedField[]
  includeTimestamp: boolean
}

type SlackFormData = {
  fallbackText: string
  headerText: string
  sectionText: string
  contextText: string
  buttonText: string
  buttonUrl: string
  includeAuthor: boolean
  includeTags: boolean
}

type TeamsFormData = {
  summary: string
  title: string
  description: string
  authorName: string
  includeTags: boolean
  buttonText: string
  buttonUrl: string
}

const defaultDiscordData: DiscordFormData = {
  content: "",
  title: "{title}",
  description: "{excerpt}",
  color: "#5865F2",
  url: "{url}",
  authorName: "{author}",
  authorIconUrl: "",
  authorUrl: "",
  footerText: "Published via Simplist",
  footerIconUrl: "",
  thumbnailUrl: "",
  imageUrl: "",
  fields: [],
  includeTimestamp: true,
}

const defaultSlackData: SlackFormData = {
  fallbackText: "New article: {title}",
  headerText: "{title}",
  sectionText: "{excerpt}",
  contextText: "By {author}",
  buttonText: "Read Article",
  buttonUrl: "{url}",
  includeAuthor: true,
  includeTags: false,
}

const defaultTeamsData: TeamsFormData = {
  summary: "New article: {title}",
  title: "{title}",
  description: "{excerpt}",
  authorName: "{author}",
  includeTags: false,
  buttonText: "Read Article",
  buttonUrl: "{url}",
}

type Tab = "discord" | "slack" | "teams"

export const WebhookBuilder: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("discord")
  const [copied, setCopied] = useState(false)
  const [discordMessageType, setDiscordMessageType] = useState<"simple" | "embed">("embed")

  const [discordData, setDiscordData] = useState<DiscordFormData>(defaultDiscordData)
  const [slackData, setSlackData] = useState<SlackFormData>(defaultSlackData)
  const [teamsData, setTeamsData] = useState<TeamsFormData>(defaultTeamsData)

  const hexToNumber = (hex: string): number => {
    const clean = hex.replace("#", "")
    return Number.parseInt(clean, 16)
  }

  const generateDiscordPayload = (): string => {
    if (discordMessageType === "simple") {
      const payload: any = {}
      if (discordData.content) {
        payload.content = discordData.content
      } else {
        payload.content = ""
      }
      return JSON.stringify(payload, null, 2)
    }

    // Embed mode
    const embed: any = {}

    if (discordData.title) embed.title = discordData.title
    if (discordData.description) embed.description = discordData.description
    if (discordData.color) embed.color = hexToNumber(discordData.color)
    if (discordData.url) embed.url = discordData.url

    if (discordData.authorName) {
      embed.author = { name: discordData.authorName }
      if (discordData.authorIconUrl) embed.author.icon_url = discordData.authorIconUrl
      if (discordData.authorUrl) embed.author.url = discordData.authorUrl
    }

    if (discordData.footerText) {
      embed.footer = { text: discordData.footerText }
      if (discordData.footerIconUrl) embed.footer.icon_url = discordData.footerIconUrl
    }

    if (discordData.thumbnailUrl) embed.thumbnail = { url: discordData.thumbnailUrl }
    if (discordData.imageUrl) embed.image = { url: discordData.imageUrl }

    if (discordData.fields.length > 0) {
      embed.fields = discordData.fields.map((f) => ({
        name: f.name,
        value: f.value,
        inline: f.inline,
      }))
    }

    if (discordData.includeTimestamp) {
      embed.timestamp = new Date().toISOString()
    }

    const payload: any = {
      embeds: [embed],
    }

    if (discordData.content) {
      payload.content = discordData.content
    }

    return JSON.stringify(payload, null, 2)
  }

  const generateSlackPayload = (): string => {
    const blocks: any[] = []

    if (slackData.headerText) {
      blocks.push({
        type: "header",
        text: { type: "plain_text", text: slackData.headerText, emoji: true },
      })
    }

    if (slackData.sectionText) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: slackData.sectionText },
      })
    }

    const contextElements: any[] = []
    if (slackData.includeAuthor && slackData.contextText) {
      contextElements.push({ type: "mrkdwn", text: slackData.contextText })
    }
    if (slackData.includeTags) {
      contextElements.push({ type: "mrkdwn", text: "Tags: {tags}" })
    }
    if (contextElements.length > 0) {
      blocks.push({ type: "context", elements: contextElements })
    }

    if (slackData.buttonText && slackData.buttonUrl) {
      blocks.push({ type: "divider" })
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: slackData.buttonText, emoji: true },
            url: slackData.buttonUrl,
            action_id: "read_article",
          },
        ],
      })
    }

    const payload = {
      text: slackData.fallbackText,
      blocks,
    }

    return JSON.stringify(payload, null, 2)
  }

  const generateTeamsPayload = (): string => {
    const body: any[] = []

    if (teamsData.title) {
      body.push({
        type: "TextBlock",
        text: teamsData.title,
        weight: "bolder",
        size: "large",
        wrap: true,
      })
    }

    if (teamsData.description) {
      body.push({
        type: "TextBlock",
        text: teamsData.description,
        wrap: true,
      })
    }

    const facts: any[] = []
    if (teamsData.authorName) {
      facts.push({ title: "Author", value: teamsData.authorName })
    }
    if (teamsData.includeTags) {
      facts.push({ title: "Tags", value: "{tags}" })
    }
    if (facts.length > 0) {
      body.push({ type: "FactSet", facts })
    }

    const content: any = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.4",
      body,
    }

    if (teamsData.buttonText && teamsData.buttonUrl) {
      content.actions = [
        {
          type: "Action.OpenUrl",
          title: teamsData.buttonText,
          url: teamsData.buttonUrl,
        },
      ]
    }

    const payload = {
      type: "message",
      summary: teamsData.summary,
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content,
        },
      ],
    }

    return JSON.stringify(payload, null, 2)
  }

  const getGeneratedJson = (): string => {
    switch (activeTab) {
      case "discord":
        return generateDiscordPayload()
      case "slack":
        return generateSlackPayload()
      case "teams":
        return generateTeamsPayload()
    }
  }

  const handleCopy = () => {
    const json = getGeneratedJson()
    navigator.clipboard.writeText(json)
    setCopied(true)
    toast.success("JSON copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const addDiscordField = () => {
    setDiscordData({
      ...discordData,
      fields: [...discordData.fields, { name: "", value: "", inline: false }],
    })
  }

  const updateDiscordField = (index: number, updates: Partial<DiscordEmbedField>) => {
    const newFields = [...discordData.fields]
    newFields[index] = { ...newFields[index], ...updates }
    setDiscordData({ ...discordData, fields: newFields })
  }

  const removeDiscordField = (index: number) => {
    setDiscordData({
      ...discordData,
      fields: discordData.fields.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "discord" | "slack" | "teams")}
      >
        <TabsList className="inline-flex">
          <TabsTrigger value="discord" className="flex items-center gap-2">
            <Discord />
            <span>Discord</span>
          </TabsTrigger>
          <TabsTrigger value="slack" className="flex items-center gap-2">
            <Slack />
            <span>Slack</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <MicrosoftTeams />
            <span>Teams</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discord" className="mt-4 data-[state=inactive]:hidden flex-none!">
          <Card>
            <CardHeader>
              <CardTitle>Discord {discordMessageType === "embed" ? "Embed" : "Message"} Builder</CardTitle>
              <CardDescription>Configure your Discord webhook payload</CardDescription>

              <CardAction className="flex items-center gap-2">
                <Label htmlFor="discord-type-toggle" className="text-sm font-normal cursor-pointer">
                  Simple Message
                </Label>

                <Switch
                  id="discord-type-toggle"
                  checked={discordMessageType === "embed"}
                  onCheckedChange={(checked) => setDiscordMessageType(checked ? "embed" : "simple")}
                />

                <Label htmlFor="discord-type-toggle" className="text-sm font-normal cursor-pointer">
                  Embed
                </Label>
              </CardAction>
            </CardHeader>

            <CardContent>
              {discordMessageType === "simple" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea
                      value={discordData.content}
                      onChange={(e) => setDiscordData({ ...discordData, content: e.target.value })}
                      placeholder="Your message text..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">Enter the message content to send</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message (above embed)</Label>
                    <Textarea
                      value={discordData.content}
                      onChange={(e) => setDiscordData({ ...discordData, content: e.target.value })}
                      placeholder="Optional message before the embed..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={discordData.title}
                      onChange={(e) => setDiscordData({ ...discordData, title: e.target.value })}
                      placeholder="Embed title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title URL</Label>
                    <Input
                      value={discordData.url}
                      onChange={(e) => setDiscordData({ ...discordData, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={discordData.description}
                      onChange={(e) => setDiscordData({ ...discordData, description: e.target.value })}
                      placeholder="Embed description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <ColorPickerInputGroup
                        value={discordData.color}
                        onValueChange={(value) => setDiscordData({ ...discordData, color: value })}
                        defaultValue="#5865F2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Include timestamp</Label>
                      <Label
                        htmlFor="includeTimestamp"
                        className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-[9.5px] has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950 cursor-pointer"
                      >
                        <Checkbox
                          id="includeTimestamp"
                          checked={discordData.includeTimestamp}
                          onCheckedChange={(checked) =>
                            setDiscordData({ ...discordData, includeTimestamp: checked === true })
                          }
                          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                        />

                        <div className="grid gap-1.5 font-normal">
                          <p className="text-sm leading-none font-medium">
                            Include timestamp
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Author name</Label>
                    <Input
                      value={discordData.authorName}
                      onChange={(e) => setDiscordData({ ...discordData, authorName: e.target.value })}
                      placeholder="Author name..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Author icon URL</Label>
                      <Input
                        value={discordData.authorIconUrl}
                        onChange={(e) => setDiscordData({ ...discordData, authorIconUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Author URL</Label>
                      <Input
                        value={discordData.authorUrl}
                        onChange={(e) => setDiscordData({ ...discordData, authorUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Footer text</Label>
                    <Input
                      value={discordData.footerText}
                      onChange={(e) => setDiscordData({ ...discordData, footerText: e.target.value })}
                      placeholder="Footer text..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Footer icon URL</Label>
                    <Input
                      value={discordData.footerIconUrl}
                      onChange={(e) => setDiscordData({ ...discordData, footerIconUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Thumbnail URL</Label>
                    <Input
                      value={discordData.thumbnailUrl}
                      onChange={(e) => setDiscordData({ ...discordData, thumbnailUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={discordData.imageUrl}
                      onChange={(e) => setDiscordData({ ...discordData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Fields ({discordData.fields.length})</Label>
                      <Button variant="outline" size="sm" onClick={addDiscordField}>
                        Add field
                      </Button>
                    </div>

                    {discordData.fields.map((field, index) => (
                      <div key={index} className="space-y-2 rounded-lg border p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateDiscordField(index, { name: e.target.value })}
                              placeholder="Field name..."
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input
                              value={field.value}
                              onChange={(e) => updateDiscordField(index, { value: e.target.value })}
                              placeholder="Field value..."
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`inline-${index}`}
                              checked={field.inline}
                              onCheckedChange={(checked) => updateDiscordField(index, { inline: checked === true })}
                            />
                            <Label htmlFor={`inline-${index}`} className="text-xs cursor-pointer">
                              Display inline
                            </Label>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeDiscordField(index)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack" className="mt-4 data-[state=inactive]:hidden flex-none!">
          <Card>
            <CardHeader>
              <CardTitle>Slack Blocks Builder</CardTitle>
              <CardDescription>Configure your Slack webhook payload</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Fallback text *</Label>
                    <Input
                      value={slackData.fallbackText}
                      onChange={(e) => setSlackData({ ...slackData, fallbackText: e.target.value })}
                      placeholder="Notification text..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown in notifications and when blocks can't be displayed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Header</Label>
                    <Input
                      value={slackData.headerText}
                      onChange={(e) => setSlackData({ ...slackData, headerText: e.target.value })}
                      placeholder="Message header..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={slackData.sectionText}
                      onChange={(e) => setSlackData({ ...slackData, sectionText: e.target.value })}
                      placeholder="Main content..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includeAuthor"
                        checked={slackData.includeAuthor}
                        onCheckedChange={(checked) => setSlackData({ ...slackData, includeAuthor: checked === true })}
                      />
                      <Label htmlFor="includeAuthor" className="cursor-pointer">
                        Include author
                      </Label>
                    </div>

                    {slackData.includeAuthor && (
                      <div className="space-y-2 pl-6">
                        <Label>Author text</Label>
                        <Input
                          value={slackData.contextText}
                          onChange={(e) => setSlackData({ ...slackData, contextText: e.target.value })}
                          placeholder="By {author}"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includeTags"
                        checked={slackData.includeTags}
                        onCheckedChange={(checked) => setSlackData({ ...slackData, includeTags: checked === true })}
                      />
                      <Label htmlFor="includeTags" className="cursor-pointer">
                        Include tags
                      </Label>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Button text</Label>
                      <Input
                        value={slackData.buttonText}
                        onChange={(e) => setSlackData({ ...slackData, buttonText: e.target.value })}
                        placeholder="Read Article"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input
                        value={slackData.buttonUrl}
                        onChange={(e) => setSlackData({ ...slackData, buttonUrl: e.target.value })}
                        placeholder="{url}"
                      />
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-4 data-[state=inactive]:hidden flex-none!">
          <Card>
            <CardHeader>
              <CardTitle>Teams Adaptive Card Builder</CardTitle>
              <CardDescription>Configure your Microsoft Teams webhook payload</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Summary *</Label>
                    <Input
                      value={teamsData.summary}
                      onChange={(e) => setTeamsData({ ...teamsData, summary: e.target.value })}
                      placeholder="Notification summary..."
                    />
                    <p className="text-xs text-muted-foreground">Shown in activity feed and notifications</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={teamsData.title}
                      onChange={(e) => setTeamsData({ ...teamsData, title: e.target.value })}
                      placeholder="Card title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={teamsData.description}
                      onChange={(e) => setTeamsData({ ...teamsData, description: e.target.value })}
                      placeholder="Card description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input
                      value={teamsData.authorName}
                      onChange={(e) => setTeamsData({ ...teamsData, authorName: e.target.value })}
                      placeholder="{author}"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeTags"
                      checked={teamsData.includeTags}
                      onCheckedChange={(checked) => setTeamsData({ ...teamsData, includeTags: checked === true })}
                    />
                    <Label htmlFor="includeTags" className="cursor-pointer">
                      Include tags
                    </Label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Button text</Label>
                      <Input
                        value={teamsData.buttonText}
                        onChange={(e) => setTeamsData({ ...teamsData, buttonText: e.target.value })}
                        placeholder="Read Article"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input
                        value={teamsData.buttonUrl}
                        onChange={(e) => setTeamsData({ ...teamsData, buttonUrl: e.target.value })}
                        placeholder="{url}"
                      />
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Generated JSON</CardTitle>
          <CardDescription>Copy this JSON to your webhook payload field</CardDescription>

          <CardAction>
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">
            <code>{getGeneratedJson()}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}


// Webhook template identifiers
export const webhookTemplateIds = [
  "discord-message",
  "discord-embed",
  "slack-blocks",
  "teams-card",
] as const

export type WebhookTemplateId = (typeof webhookTemplateIds)[number]

export type WebhookPlatform = "discord" | "slack" | "teams"

// Template metadata for UI display
export const templateMetadata: Record<
  WebhookTemplateId,
  {
    name: string
    platform: WebhookPlatform
    description: string
  }
> = {
  "discord-message": {
    name: "Discord Message",
    platform: "discord",
    description: "Simple text message",
  },
  "discord-embed": {
    name: "Discord Embed",
    platform: "discord",
    description: "Rich embed with title, description, fields, and more",
  },
  "slack-blocks": {
    name: "Slack Blocks",
    platform: "slack",
    description: "Block Kit formatted message",
  },
  "teams-card": {
    name: "Teams Adaptive Card",
    platform: "teams",
    description: "Microsoft Teams Adaptive Card",
  },
}

// Available variables for message customization
export const availableVariables = [
  { name: "title", description: "Article title" },
  { name: "slug", description: "Article slug" },
  { name: "excerpt", description: "Article excerpt/summary" },
  { name: "author", description: "Author name" },
  { name: "tags", description: "Comma-separated tags" },
  { name: "publishedAt", description: "Publication date" },
  { name: "url", description: "Article URL" },
  { name: "event", description: "Event type (e.g. article.published)" },
  { name: "coverImage", description: "Cover image URL" },
  { name: "wordCount", description: "Number of words" },
  { name: "characterCount", description: "Number of characters" },
  { name: "lineCount", description: "Number of lines" },
  { name: "readTimeMinutes", description: "Estimated reading time in minutes" },
  { name: "variantCount", description: "Number of language variants" },
] as const

export type VariableName = (typeof availableVariables)[number]["name"]

// ============================================================================
// Discord Payloads
// ============================================================================

export type DiscordMessagePayload = {
  content: string
}

export type DiscordEmbedField = {
  name: string
  value: string
  inline?: boolean
}

export type DiscordEmbed = {
  title?: string
  description?: string
  color?: number
  url?: string
  author?: {
    name: string
    icon_url?: string
    url?: string
  }
  footer?: {
    text: string
    icon_url?: string
  }
  thumbnail?: {
    url: string
  }
  image?: {
    url: string
  }
  fields?: DiscordEmbedField[]
  timestamp?: string
}

export type DiscordEmbedPayload = {
  content?: string
  embeds: DiscordEmbed[]
}

// ============================================================================
// Slack Payloads
// ============================================================================

export type SlackTextObject = {
  type: "plain_text" | "mrkdwn"
  text: string
  emoji?: boolean
}

export type SlackHeaderBlock = {
  type: "header"
  text: SlackTextObject
}

export type SlackSectionBlock = {
  type: "section"
  text?: SlackTextObject
  fields?: SlackTextObject[]
  accessory?: SlackButtonElement
}

export type SlackContextBlock = {
  type: "context"
  elements: SlackTextObject[]
}

export type SlackDividerBlock = {
  type: "divider"
}

export type SlackButtonElement = {
  type: "button"
  text: SlackTextObject
  url?: string
  action_id: string
}

export type SlackActionsBlock = {
  type: "actions"
  elements: SlackButtonElement[]
}

export type SlackBlock =
  | SlackHeaderBlock
  | SlackSectionBlock
  | SlackContextBlock
  | SlackDividerBlock
  | SlackActionsBlock

export type SlackBlocksPayload = {
  text: string // Fallback text for notifications
  blocks: SlackBlock[]
}

// ============================================================================
// Microsoft Teams Payloads (Adaptive Cards)
// ============================================================================

export type TeamsTextBlock = {
  type: "TextBlock"
  text: string
  weight?: "default" | "bolder" | "lighter"
  size?: "default" | "small" | "medium" | "large" | "extraLarge"
  wrap?: boolean
  color?: "default" | "dark" | "light" | "accent" | "good" | "warning" | "attention"
}

export type TeamsImage = {
  type: "Image"
  url: string
  size?: "auto" | "stretch" | "small" | "medium" | "large"
  altText?: string
}

export type TeamsFact = {
  title: string
  value: string
}

export type TeamsFactSet = {
  type: "FactSet"
  facts: TeamsFact[]
}

export type TeamsOpenUrlAction = {
  type: "Action.OpenUrl"
  title: string
  url: string
}

export type TeamsAdaptiveCard = {
  type: "AdaptiveCard"
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json"
  version: "1.4"
  body: (TeamsTextBlock | TeamsImage | TeamsFactSet)[]
  actions?: TeamsOpenUrlAction[]
}

export type TeamsCardPayload = {
  type: "message"
  summary: string
  attachments: Array<{
    contentType: "application/vnd.microsoft.card.adaptive"
    content: TeamsAdaptiveCard
  }>
}

// ============================================================================
// Union type for all payloads
// ============================================================================

export type WebhookPayload =
  | DiscordMessagePayload
  | DiscordEmbedPayload
  | SlackBlocksPayload
  | TeamsCardPayload

// ============================================================================
// Form data types for dialogs
// ============================================================================

export type DiscordMessageFormData = {
  content: string
}

export type DiscordEmbedFormData = {
  content?: string
  title?: string
  description?: string
  color?: string // Hex color string
  url?: string
  authorName?: string
  authorIconUrl?: string
  authorUrl?: string
  footerText?: string
  footerIconUrl?: string
  thumbnailUrl?: string
  imageUrl?: string
  fields: DiscordEmbedField[]
  includeTimestamp: boolean
}

export type SlackBlocksFormData = {
  fallbackText: string
  headerText?: string
  sectionText?: string
  contextText?: string
  buttonText?: string
  buttonUrl?: string
  includeAuthor: boolean
  includeTags: boolean
}

export type TeamsCardFormData = {
  summary: string
  title?: string
  description?: string
  authorName?: string
  includeTags: boolean
  buttonText?: string
  buttonUrl?: string
}

// ============================================================================
// Helper functions
// ============================================================================

export function isValidTemplateId(id: string | null | undefined): id is WebhookTemplateId {
  if (!id) return false
  return webhookTemplateIds.includes(id as WebhookTemplateId)
}

export function getTemplatePlatform(templateId: WebhookTemplateId): WebhookPlatform {
  return templateMetadata[templateId].platform
}


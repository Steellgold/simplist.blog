/**
 * Bot detection utilities for analytics filtering
 */

// Known bot user agents (partial matches)
const BOT_USER_AGENTS = [
  // Search engine bots
  "googlebot",
  "bingbot",
  "slurp", // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  
  // SEO tools
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "screaming frog",
  "seobilitybot",
  
  // Monitoring/uptime bots
  "pingdom",
  "uptimerobot",
  "monitor",
  "nagios",
  "zabbix",
  
  // Generic bot indicators
  "bot",
  "crawler",
  "spider",
  "scraper",
  "fetch",
  "curl",
  "wget",
  "python-requests",
  "go-http-client",
  "axios",
  "http",
  "node",
  
  // Headless browsers often used by bots
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright"
]

// Known bot IP ranges or identifiers
const BOT_IDENTIFIERS = [
  // Empty or missing user agents are often bots
  "",
  "unknown",
  "-",
  
  // Very short user agents (likely automated)
  /^.{1,10}$/,
  
  // Common automated tools patterns
  /^[a-z]+-[0-9.]+$/i, // Tool-version patterns
  /^[A-Z]+\/[0-9.]+$/  // CAPS/version patterns
]

/**
 * Detect if a user agent belongs to a bot
 */
export const isBot = (userAgent: string): boolean => {
  if (!userAgent || typeof userAgent !== "string") {
    return true // No user agent = likely bot
  }

  const ua = userAgent.toLowerCase().trim()
  
  // Check against known bot user agents
  for (const botUA of BOT_USER_AGENTS) {
    if (ua.includes(botUA)) {
      return true
    }
  }
  
  // Check against bot identifier patterns
  for (const identifier of BOT_IDENTIFIERS) {
    if (typeof identifier === "string") {
      if (ua === identifier) {
        return true
      }
    } else if (identifier instanceof RegExp) {
      if (identifier.test(userAgent)) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Additional heuristics for bot detection
 */
export const isLikelyBot = (userAgent: string, additionalChecks?: {
  hasJavaScript?: boolean
  screenDimensions?: { width: number; height: number }
  timing?: number
}): boolean => {
  // First check basic bot detection
  if (isBot(userAgent)) {
    return true
  }
  
  if (!additionalChecks) {
    return false
  }
  
  const { hasJavaScript, screenDimensions, timing } = additionalChecks
  
  // No JavaScript support is often a bot
  if (hasJavaScript === false) {
    return true
  }
  
  // Suspicious screen dimensions
  if (screenDimensions) {
    const { width, height } = screenDimensions
    
    // Common headless browser default dimensions
    if ((width === 1920 && height === 1080) ||
        (width === 1280 && height === 720) ||
        (width === 800 && height === 600) ||
        width === 0 || height === 0) {
      return true
    }
  }
  
  // Extremely fast page load times (< 100ms) can indicate automated access
  if (timing && timing < 100) {
    return true
  }
  
  return false
}

/**
 * Get bot information for logging/debugging
 */
export const getBotInfo = (userAgent: string): { isBot: boolean; reason?: string } => {
  if (!userAgent || typeof userAgent !== "string") {
    return { isBot: true, reason: "Missing or invalid user agent" }
  }

  const ua = userAgent.toLowerCase().trim()
  
  // Check against known bot user agents
  for (const botUA of BOT_USER_AGENTS) {
    if (ua.includes(botUA)) {
      return { isBot: true, reason: `Matches bot pattern: ${botUA}` }
    }
  }
  
  // Check against bot identifier patterns
  for (const identifier of BOT_IDENTIFIERS) {
    if (typeof identifier === "string") {
      if (ua === identifier) {
        return { isBot: true, reason: `Matches bot identifier: ${identifier}` }
      }
    } else if (identifier instanceof RegExp) {
      if (identifier.test(userAgent)) {
        return { isBot: true, reason: `Matches bot pattern: ${identifier.source}` }
      }
    }
  }
  
  return { isBot: false }
}
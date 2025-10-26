# Simplist SDK Documentation

The Simplist SDK is a TypeScript library that provides a type-safe, easy-to-use interface for interacting with the Simplist API. It features automatic retry logic, comprehensive error handling, and support for all Simplist API endpoints.

## Installation

```bash
npm install @simplist.blog/sdk
```

## Quick Start

```typescript
import { SimplistClient } from '@simplist.blog/sdk'

// Initialize client with API key
const client = new SimplistClient({
  apiKey: 'sk_your_api_key_here'
})

// Get articles
const articles = await client.articles.list()

// Get specific article
const article = await client.articles.get('article-slug')

// Track analytics
await client.analytics.track({
  articleSlug: 'article-slug',
  timeOnPage: 120,
  scrollDepth: 75
})
```

## Configuration

### SimplistClientOptions

The SDK client accepts the following configuration options:

```typescript
interface SimplistClientOptions {
  /**
   * API key for authentication (optional if SIMPLIST_API_KEY env var is set)
   */
  apiKey?: string
  
  /**
   * Base URL for the API (default: https://api.simplist.blog)
   */
  baseUrl?: string
  
  /**
   * Request timeout in milliseconds (default: 10000)
   */
  timeout?: number
  
  /**
   * Number of retries for failed requests (default: 3)
   */
  retries?: number
  
  /**
   * Delay between retries in milliseconds (default: 1000)
   */
  retryDelay?: number
}
```

### Environment Variables

The SDK automatically detects API keys from environment variables:

```bash
# Set in your environment
export SIMPLIST_API_KEY=sk_your_api_key_here

# Or in .env file
SIMPLIST_API_KEY=sk_your_api_key_here
```

### Client Initialization Examples

```typescript
// Basic initialization with API key
const client = new SimplistClient({
  apiKey: 'sk_your_api_key'
})

// Custom configuration
const client = new SimplistClient({
  apiKey: 'sk_your_api_key',
  baseUrl: 'https://api.simplist.blog',
  timeout: 15000,
  retries: 5,
  retryDelay: 2000
})

// Using environment variable (automatic detection)
const client = new SimplistClient()
```

## API Key Types

The SDK supports two types of API keys:

- **Secret Keys** (`sk_...`) - Full access with all permissions
- **Public Keys** (`pk_...`) - Limited access for analytics tracking only

```typescript
// Secret key - full access
const clientSecret = new SimplistClient({
  apiKey: 'sk_your_secret_key'
})

// Public key - analytics only
const clientPublic = new SimplistClient({
  apiKey: 'pk_your_public_key'
})
```

## Articles Resource

The articles resource provides access to blog content with comprehensive filtering and search capabilities.

### list(params?)

Retrieve a paginated list of articles.

```typescript
interface ArticleListParams {
  page?: number              // Page number (default: 1)
  limit?: number            // Items per page (default: 20)
  sort?: string             // Sort field (default: "createdAt")
  order?: 'asc' | 'desc'    // Sort order (default: "desc")
  published?: boolean       // Filter by published status
  search?: string           // Search in title, excerpt, content
  status?: string           // Filter by article status
}

// Basic usage
const articles = await client.articles.list()

// With parameters
const articles = await client.articles.list({
  page: 1,
  limit: 10,
  search: 'javascript',
  published: true,
  sort: 'createdAt',
  order: 'desc'
})
```

**Response:**
```typescript
interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ArticleListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  status: string
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}
```

### get(slug)

Retrieve a single article by slug.

```typescript
// Get article
const article = await client.articles.get('getting-started-javascript')
```

**Response:**
```typescript
interface Article extends ArticleListItem {
  content: string
  variants?: ArticleVariant[]
}

interface ArticleVariant {
  id: string
  lang: string
  title: string
  excerpt: string | null
  content: string
  createdAt: string
  updatedAt: string
}
```

### search(query, params?)

Search articles by query string.

```typescript
// Search articles
const results = await client.articles.search('javascript tutorial', {
  limit: 5,
  published: true
})

// Search with additional filters
const results = await client.articles.search('react', {
  page: 2,
  limit: 10,
  sort: 'viewCount',
  order: 'desc'
})
```

### published(params?)

Get only published articles.

```typescript
// Get published articles
const publishedArticles = await client.articles.published({
  limit: 10,
  sort: 'publishedAt',
  order: 'desc'
})
```

### latest(limit?)

Get the latest articles (shorthand for published with recent sorting).

```typescript
// Get 10 latest articles
const latestArticles = await client.articles.latest(10)

// Get 5 latest articles (default)
const latestArticles = await client.articles.latest()
```

### popular(limit?)

Get popular articles (currently returns default sorting, viewCount sorting planned).

```typescript
// Get 10 popular articles
const popularArticles = await client.articles.popular(10)
```

### rss(options)

Generate RSS feed XML client-side.

```typescript
interface RssOptions {
  hostname: string      // Base URL for article links
  title?: string        // Feed title (default: "Blog Feed")
  description?: string  // Feed description (default: "Latest articles")
  limit?: number        // Number of articles (default: 50)
}

// Generate RSS feed
const rssXml = await client.articles.rss({
  hostname: 'https://myblog.com',
  title: 'My Tech Blog',
  description: 'Latest posts about web development',
  limit: 20
})

// Use in Next.js API route
export async function GET() {
  const rssXml = await client.articles.rss({
    hostname: 'https://myblog.com'
  })
  
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
}
```

## Project Resource

The project resource provides information about the current project and its statistics.

### get()

Get project information and statistics.

```typescript
const projectInfo = await client.project.get()
```

**Response:**
```typescript
interface ProjectInfo {
  project: Project
  stats: ProjectStats
}

interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectStats {
  totalArticles: number
  publishedArticles: number
  totalViews: number
}
```

**Example:**
```typescript
const { project, stats } = await client.project.get()

console.log(`Project: ${project.name}`)
console.log(`Published Articles: ${stats.publishedArticles}`)
console.log(`Total Views: ${stats.totalViews}`)
```

## Analytics Resource

The analytics resource provides comprehensive page view tracking and analytics data retrieval with automatic bot detection and visitor deduplication.

### track(data)

Track a page view with detailed metrics and events.

```typescript
interface PageViewData {
  articleSlug: string           // Required: Article slug
  sessionId?: string           // Session identifier
  pageUrl?: string             // Full page URL
  pageTitle?: string           // Page title
  referrer?: string            // Referrer URL
  utmSource?: string           // UTM parameters
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  screenWidth?: number         // Screen dimensions
  screenHeight?: number
  timeOnPage?: number          // Time spent (seconds)
  scrollDepth?: number         // Scroll percentage (0-100)
  exitPosition?: number        // Exit scroll position
  bounced?: boolean            // Whether user bounced
  timestamp?: string           // Custom timestamp
  events?: PageEvent[]         // Custom events
  fetchGeo?: boolean           // Whether to fetch geo data
}

interface PageEvent {
  type: string                 // Event type
  data?: Record<string, any>   // Event data
  position?: number            // Scroll position
  element?: string             // Element identifier
  timestamp?: string           // Event timestamp
  timeOffset?: number          // Time from page load
}

// Basic tracking
const result = await client.analytics.track({
  articleSlug: 'getting-started-javascript',
  timeOnPage: 120,
  scrollDepth: 75
})

// Advanced tracking with events
const result = await client.analytics.track({
  articleSlug: 'getting-started-javascript',
  sessionId: 'session_123456789',
  pageUrl: 'https://myblog.com/articles/getting-started-javascript',
  pageTitle: 'Getting Started with JavaScript - My Blog',
  referrer: 'https://google.com',
  utmSource: 'google',
  utmMedium: 'organic',
  screenWidth: 1920,
  screenHeight: 1080,
  timeOnPage: 300,
  scrollDepth: 95,
  bounced: false,
  events: [
    {
      type: 'click',
      data: { element: 'cta-button' },
      position: 45,
      element: 'button',
      timeOffset: 90
    },
    {
      type: 'scroll',
      data: { milestone: '50%' },
      position: 50,
      timeOffset: 60
    }
  ]
})
```

**Response:**
```typescript
interface PageViewResponse {
  success: boolean
  pageViewId: string    // Use for updates
  visitorId: string     // Unique visitor ID
  sessionId: string     // Session ID
}
```

### update(pageViewId, data)

Update an existing page view with final metrics.

```typescript
// Update page view when user leaves
await client.analytics.update('pageview_123', {
  timeOnPage: 300,
  scrollDepth: 95,
  exitPosition: 80,
  bounced: false
})
```

### getStats(options?)

Get analytics statistics for the project.

**Requires:** API key with `read` permission

```typescript
// Get default stats (30 days)
const stats = await client.analytics.getStats()

// Get stats for specific period
const weekStats = await client.analytics.getStats({ days: 7 })
const yearStats = await client.analytics.getStats({ days: 365 })
```

**Response:**
```typescript
interface AnalyticsStats {
  period: {
    days: number
    startDate: string
    endDate: string
  }
  summary: {
    totalViews: number
    uniqueVisitors: number
    avgViewsPerVisitor: number
  }
  topArticles: Array<{
    articleId: string
    title: string
    slug: string
    views: number
  }>
  topCountries: Array<{
    country: string
    views: number
  }>
}
```

### Complete Analytics Implementation Example

```typescript
// Client-side analytics tracking
class AnalyticsTracker {
  private client: SimplistClient
  private sessionId: string
  private pageViewId: string | null = null
  private startTime: number
  
  constructor(apiKey: string) {
    this.client = new SimplistClient({ apiKey })
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.startTime = Date.now()
  }
  
  async trackPageView(articleSlug: string) {
    try {
      const result = await this.client.analytics.track({
        articleSlug,
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        screenWidth: screen.width,
        screenHeight: screen.height,
        timestamp: new Date().toISOString()
      })
      
      this.pageViewId = result.pageViewId
      
      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.updatePageView()
      })
      
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }
  
  private async updatePageView() {
    if (!this.pageViewId) return
    
    const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000)
    const scrollDepth = Math.floor(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    )
    
    try {
      await this.client.analytics.update(this.pageViewId, {
        timeOnPage,
        scrollDepth,
        bounced: timeOnPage < 10 // Less than 10 seconds = bounce
      })
    } catch (error) {
      console.error('Analytics update failed:', error)
    }
  }
}

// Usage
const tracker = new AnalyticsTracker('pk_your_public_key')
tracker.trackPageView('article-slug')
```

## SEO Resource

The SEO resource provides comprehensive SEO metadata generation, sitemap creation, and structured data for optimal search engine optimization.

### getArticle(articleSlug, baseUrl?)

Get complete SEO metadata for a specific article.

```typescript
// Get SEO metadata
const articleWithSeo = await client.seo.getArticle(
  'getting-started-javascript',
  'https://myblog.com'
)

// Use in Next.js metadata
export async function generateMetadata({ params }) {
  const { seo } = await client.seo.getArticle(params.slug, 'https://myblog.com')
  
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      type: seo.ogType
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: seo.twitterImage ? [seo.twitterImage] : undefined
    },
    alternates: {
      canonical: seo.canonicalUrl
    }
  }
}
```

**Response:**
```typescript
interface ArticleWithSeo {
  // All article fields
  id: string
  title: string
  slug: string
  content: string
  // ... other article fields
  
  // SEO metadata
  seo: SeoMetadata
  project: {
    name: string
    slug: string
    description: string | null
  }
}

interface SeoMetadata {
  metaTitle: string
  metaDescription: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard: 'summary' | 'summary_large_image'
  canonicalUrl?: string
  structuredData?: Record<string, any>
  keywords?: string[]
  language: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  readingTime?: number
}
```

### getSitemap(baseUrl, format?)

Generate sitemap for the project.

```typescript
// Get XML sitemap
const sitemapXml = await client.seo.getSitemap('https://myblog.com', 'xml')

// Get JSON sitemap
const sitemapJson = await client.seo.getSitemap('https://myblog.com', 'json')

// Use in Next.js sitemap
export async function GET() {
  const sitemapXml = await client.seo.getSitemap('https://myblog.com', 'xml')
  
  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

**Response Types:**
```typescript
// XML format returns string
type SitemapXml = string

// JSON format returns structured data
interface Sitemap {
  entries: SitemapEntry[]
  generatedAt: string
}

interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}
```

### getRssFeed(baseUrl, limit?)

Generate RSS feed for the project.

```typescript
// Generate RSS feed
const rssXml = await client.seo.getRssFeed('https://myblog.com', 20)

// Use in Next.js RSS route
export async function GET() {
  const rssXml = await client.seo.getRssFeed('https://myblog.com', 50)
  
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
}
```

### getStructuredData(baseUrl?)

Get Schema.org structured data for all articles.

```typescript
const structuredData = await client.seo.getStructuredData('https://myblog.com')

// Use in Next.js page
export default function ArticlePage({ article, structuredData }) {
  const articleStructuredData = structuredData.articles.find(
    a => a.slug === article.slug
  )?.structuredData
  
  return (
    <>
      {articleStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData)
          }}
        />
      )}
      <article>{article.content}</article>
    </>
  )
}
```

**Response:**
```typescript
interface StructuredDataResponse {
  project: {
    name: string
    slug: string
    description: string | null
  }
  articles: Array<{
    slug: string
    structuredData: Record<string, any>
  }>
  generatedAt: string
}
```

### getRobotsTxt(baseUrl?)

Generate robots.txt content.

```typescript
// Generate robots.txt
const robotsTxt = await client.seo.getRobotsTxt('https://myblog.com')

// Use in Next.js robots.txt route
export async function GET() {
  const robotsTxt = await client.seo.getRobotsTxt('https://myblog.com')
  
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
```

## Utility Functions

The SDK includes various utility functions for language detection, variant handling, and multilingual support.

### Language Detection

```typescript
import { 
  detectUserLanguage,
  isValidLanguageCode,
  getAllLanguageCodes,
  POPULAR_LANGUAGES 
} from '@simplist.blog/sdk'

// Detect user's preferred language
const userLang = detectUserLanguage() // Returns browser language

// Validate language code
const isValid = isValidLanguageCode('en') // true
const isValid = isValidLanguageCode('invalid') // false

// Get all supported language codes
const allLanguages = getAllLanguageCodes() // ['en', 'fr', 'es', ...]

// Popular languages for UI
console.log(POPULAR_LANGUAGES) // ['en', 'es', 'fr', 'de', 'it', ...]
```

### Variant Helpers

```typescript
import {
  getVariantOrDefault,
  getBestMatchingVariant,
  hasVariant,
  getAllLanguages,
  getVariantCount,
  isMultilingual,
  getVariantMetadata
} from '@simplist.blog/sdk'

// Example article with variants
const article = {
  id: 'article_123',
  title: 'Hello World',
  content: 'Content in English...',
  variants: [
    { lang: 'fr', title: 'Bonjour le monde', content: 'Contenu en français...' },
    { lang: 'es', title: 'Hola mundo', content: 'Contenido en español...' }
  ]
}

// Get variant or default to main article
const frenchVersion = getVariantOrDefault(article, 'fr')
const germanVersion = getVariantOrDefault(article, 'de') // Falls back to main article

// Get best matching variant based on user preferences
const userPreferences = ['de', 'fr', 'en']
const bestMatch = getBestMatchingVariant(article, userPreferences)

// Check if article has specific variant
const hasFrench = hasVariant(article, 'fr') // true
const hasGerman = hasVariant(article, 'de') // false

// Get all available languages for article
const languages = getAllLanguages(article) // ['en', 'fr', 'es']

// Get variant count
const count = getVariantCount(article) // 2 (not including main article)

// Check if article is multilingual
const multilingual = isMultilingual(article) // true

// Get variant metadata
const metadata = getVariantMetadata(article)
// Returns: { totalVariants: 2, languages: ['en', 'fr', 'es'], isMultilingual: true }
```

### VariantSelector Component Helper

```typescript
import { VariantSelector } from '@simplist.blog/sdk'

// React component helper for language selection
function ArticlePage({ article }) {
  const [selectedLang, setSelectedLang] = useState('en')
  
  const currentContent = getVariantOrDefault(article, selectedLang)
  const availableLanguages = getAllLanguages(article)
  
  return (
    <div>
      <VariantSelector
        article={article}
        selectedLanguage={selectedLang}
        onLanguageChange={setSelectedLang}
        className="language-selector"
      />
      
      <h1>{currentContent.title}</h1>
      <div>{currentContent.content}</div>
    </div>
  )
}
```

## Error Handling

The SDK includes comprehensive error handling with automatic retry logic and detailed error information.

### SimplistApiError

```typescript
import { SimplistApiError } from '@simplist.blog/sdk'

try {
  const article = await client.articles.get('non-existent-slug')
} catch (error) {
  if (error instanceof SimplistApiError) {
    console.log('API Error:', error.message)
    console.log('Status Code:', error.statusCode)
    console.log('Error Type:', error.error)
    
    // Handle specific errors
    if (error.statusCode === 404) {
      console.log('Article not found')
    } else if (error.statusCode === 401) {
      console.log('Invalid API key')
    } else if (error.statusCode === 429) {
      console.log('Rate limit exceeded')
    }
  } else {
    console.log('Network or other error:', error)
  }
}
```

### Retry Logic

The SDK automatically retries failed requests with exponential backoff:

```typescript
const client = new SimplistClient({
  apiKey: 'sk_your_key',
  retries: 3,           // Number of retries (default: 3)
  retryDelay: 1000,     // Initial delay in ms (default: 1000)
  timeout: 10000        // Request timeout in ms (default: 10000)
})

// The SDK will automatically retry:
// - Network errors
// - 5xx server errors
// - Timeout errors
// 
// It will NOT retry:
// - 4xx client errors (except 429 rate limit)
// - Authentication errors
```

### Error Response Format

```typescript
interface ApiError {
  error: string      // Error type
  message: string    // Human-readable message
  statusCode: number // HTTP status code
}

// Example error responses
{
  "error": "Not Found",
  "message": "Article not found or not published",
  "statusCode": 404
}

{
  "error": "Unauthorized", 
  "message": "Invalid API key",
  "statusCode": 401
}

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later.",
  "statusCode": 429
}
```

## Type Definitions

The SDK exports comprehensive TypeScript types for all API responses and parameters.

### Core Types

```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Error types
interface ApiError {
  error: string
  message: string
  statusCode: number
}
```

### Article Types

```typescript
interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
  status: string
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  variants?: ArticleVariant[]
}

interface ArticleListItem extends Omit<Article, 'content' | 'variants'> {}

interface ArticleVariant {
  id: string
  lang: string
  title: string
  excerpt: string | null
  content: string
  createdAt: string
  updatedAt: string
}

interface ArticleListParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  published?: boolean
  search?: string
  status?: string
}
```

### Project Types

```typescript
interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectStats {
  totalArticles: number
  publishedArticles: number
  totalViews: number
}

interface ProjectInfo {
  project: Project
  stats: ProjectStats
}
```

### Analytics Types

```typescript
interface PageViewData {
  articleSlug: string
  sessionId?: string
  pageUrl?: string
  pageTitle?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  screenWidth?: number
  screenHeight?: number
  timeOnPage?: number
  scrollDepth?: number
  exitPosition?: number
  bounced?: boolean
  timestamp?: string
  events?: PageEvent[]
  fetchGeo?: boolean
}

interface PageEvent {
  type: string
  data?: Record<string, any>
  position?: number
  element?: string
  timestamp?: string
  timeOffset?: number
}

interface PageViewResponse {
  success: boolean
  pageViewId: string
  visitorId: string
  sessionId: string
}

interface AnalyticsStats {
  period: {
    days: number
    startDate: string
    endDate: string
  }
  summary: {
    totalViews: number
    uniqueVisitors: number
    avgViewsPerVisitor: number
  }
  topArticles: Array<{
    articleId: string
    title: string
    slug: string
    views: number
  }>
  topCountries: Array<{
    country: string
    views: number
  }>
}
```

### SEO Types

```typescript
interface SeoMetadata {
  metaTitle: string
  metaDescription: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard: 'summary' | 'summary_large_image'
  canonicalUrl?: string
  structuredData?: Record<string, any>
  keywords?: string[]
  language: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  readingTime?: number
}

interface ArticleWithSeo extends Article {
  seo: SeoMetadata
  project: {
    name: string
    slug: string
    description: string | null
  }
}

interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

interface Sitemap {
  entries: SitemapEntry[]
  generatedAt: string
}

interface StructuredDataResponse {
  project: {
    name: string
    slug: string
    description: string | null
  }
  articles: Array<{
    slug: string
    structuredData: Record<string, any>
  }>
  generatedAt: string
}
```

### Language Types

```typescript
interface Language {
  code: string
  name: string
  nativeName: string
}

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'pl' | 'tr' | 'he' | 'th' | 'vi' | 'cs' | 'hu' | 'ro' | 'bg' | 'hr' | 'sk' | 'sl' | 'et' | 'lv' | 'lt' | 'mt' | 'ga' | 'cy' | 'is' | 'mk' | 'sq' | 'eu' | 'ca' | 'gl' | 'br' | 'co' | 'sm' | 'lb' | 'fo' | 'kl'

const POPULAR_LANGUAGES: LanguageCode[] = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
```

## Usage Examples

### Next.js Blog Implementation

```typescript
// app/articles/[slug]/page.tsx
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY
})

export async function generateMetadata({ params }) {
  try {
    const { seo } = await client.seo.getArticle(
      params.slug,
      'https://myblog.com'
    )
    
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      openGraph: {
        title: seo.ogTitle,
        description: seo.ogDescription,
        images: seo.ogImage ? [seo.ogImage] : undefined,
        type: seo.ogType
      },
      twitter: {
        card: seo.twitterCard,
        title: seo.twitterTitle,
        description: seo.twitterDescription,
        images: seo.twitterImage ? [seo.twitterImage] : undefined
      },
      alternates: {
        canonical: seo.canonicalUrl
      }
    }
  } catch (error) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }
}

export default async function ArticlePage({ params }) {
  try {
    const { data: article } = await client.articles.get(params.slug)
    
    return (
      <article>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="excerpt">{article.excerpt}</p>}
        <div className="content">{article.content}</div>
        <div className="meta">
          <span>Reading time: {article.readTimeMinutes} min</span>
          <span>Views: {article.viewCount}</span>
        </div>
      </article>
    )
  } catch (error) {
    return <div>Article not found</div>
  }
}
```

### Articles List Page

```typescript
// app/articles/page.tsx
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY
})

export default async function ArticlesPage({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  
  try {
    const { data: articles, meta } = await client.articles.list({
      page,
      limit: 12,
      search,
      published: true,
      sort: 'publishedAt',
      order: 'desc'
    })
    
    return (
      <div>
        <h1>Articles</h1>
        
        {/* Search form */}
        <form>
          <input
            type="search"
            name="search"
            placeholder="Search articles..."
            defaultValue={search}
          />
          <button type="submit">Search</button>
        </form>
        
        {/* Articles grid */}
        <div className="articles-grid">
          {articles.map(article => (
            <article key={article.id} className="article-card">
              {article.coverImage && (
                <img src={article.coverImage} alt={article.title} />
              )}
              <h2>{article.title}</h2>
              {article.excerpt && <p>{article.excerpt}</p>}
              <div className="meta">
                <span>{article.readTimeMinutes} min read</span>
                <span>{article.viewCount} views</span>
                <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
              </div>
              <a href={`/articles/${article.slug}`}>Read more</a>
            </article>
          ))}
        </div>
        
        {/* Pagination */}
        {meta && (
          <div className="pagination">
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <a
                key={i + 1}
                href={`/articles?page=${i + 1}${search ? `&search=${search}` : ''}`}
                className={page === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    return <div>Failed to load articles</div>
  }
}
```

### RSS Feed Generation

```typescript
// app/rss.xml/route.ts
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY
})

export async function GET() {
  try {
    const rssXml = await client.seo.getRssFeed('https://myblog.com', 50)
    
    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
    })
  } catch (error) {
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
```

### Sitemap Generation

```typescript
// app/sitemap.xml/route.ts
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY
})

export async function GET() {
  try {
    const sitemapXml = await client.seo.getSitemap('https://myblog.com', 'xml')
    
    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    })
  } catch (error) {
    return new Response('Error generating sitemap', { status: 500 })
  }
}
```

### Client-Side Analytics

```typescript
// components/AnalyticsTracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { SimplistClient } from '@simplist.blog/sdk'

interface AnalyticsTrackerProps {
  articleSlug: string
  apiKey: string
}

export function AnalyticsTracker({ articleSlug, apiKey }: AnalyticsTrackerProps) {
  const client = useRef(new SimplistClient({ apiKey }))
  const pageViewId = useRef<string | null>(null)
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    // Track initial page view
    const trackPageView = async () => {
      try {
        const result = await client.current.analytics.track({
          articleSlug,
          sessionId: getSessionId(),
          pageUrl: window.location.href,
          pageTitle: document.title,
          referrer: document.referrer,
          screenWidth: screen.width,
          screenHeight: screen.height,
          timestamp: new Date().toISOString()
        })
        
        pageViewId.current = result.pageViewId
      } catch (error) {
        console.error('Analytics tracking failed:', error)
      }
    }
    
    trackPageView()
    
    // Update on page unload
    const handleBeforeUnload = async () => {
      if (pageViewId.current) {
        const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000)
        const scrollDepth = Math.floor(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        )
        
        try {
          await client.current.analytics.update(pageViewId.current, {
            timeOnPage,
            scrollDepth,
            bounced: timeOnPage < 10
          })
        } catch (error) {
          console.error('Analytics update failed:', error)
        }
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [articleSlug])
  
  return null // This component doesn't render anything
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('simplist_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('simplist_session_id', sessionId)
  }
  return sessionId
}
```

## Best Practices

### API Key Security

```typescript
// ✅ Good: Store API keys in environment variables
const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY
})

// ❌ Bad: Hard-coding API keys
const client = new SimplistClient({
  apiKey: 'sk_123456789abcdef' // Never do this!
})

// ✅ Good: Use public keys for client-side analytics
const analyticsClient = new SimplistClient({
  apiKey: process.env.NEXT_PUBLIC_SIMPLIST_PUBLIC_KEY // pk_ key
})

// ✅ Good: Validate API key format
if (!apiKey?.startsWith('sk_')) {
  throw new Error('Invalid secret API key format')
}
```

### Error Handling Patterns

```typescript
// ✅ Good: Comprehensive error handling
async function getArticle(slug: string) {
  try {
    const { data } = await client.articles.get(slug)
    return data
  } catch (error) {
    if (error instanceof SimplistApiError) {
      switch (error.statusCode) {
        case 404:
          return null // Article not found
        case 401:
          throw new Error('Invalid API key')
        case 429:
          throw new Error('Rate limit exceeded')
        default:
          throw new Error(`API error: ${error.message}`)
      }
    }
    throw new Error('Network error')
  }
}

// ✅ Good: Retry with exponential backoff for transient errors
const client = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY,
  retries: 3,
  retryDelay: 1000,
  timeout: 15000
})
```

### Performance Optimization

```typescript
// ✅ Good: Use pagination for large datasets
async function getAllArticles() {
  const allArticles = []
  let page = 1
  let hasMore = true
  
  while (hasMore) {
    const { data, meta } = await client.articles.list({
      page,
      limit: 50 // Reasonable page size
    })
    
    allArticles.push(...data)
    hasMore = page < meta.totalPages
    page++
  }
  
  return allArticles
}

// ✅ Good: Cache responses on the client side
const cache = new Map()

async function getCachedArticle(slug: string) {
  if (cache.has(slug)) {
    return cache.get(slug)
  }
  
  const article = await client.articles.get(slug)
  cache.set(slug, article)
  
  // Auto-expire cache after 5 minutes
  setTimeout(() => cache.delete(slug), 5 * 60 * 1000)
  
  return article
}

// ✅ Good: Use specific field selection when available
// (Note: This API doesn't support field selection yet, but it's a good practice)
```

### Analytics Best Practices

```typescript
// ✅ Good: Respect user privacy
class PrivacyAwareAnalytics {
  private hasConsent = false
  
  constructor(private client: SimplistClient) {
    this.checkConsent()
  }
  
  private checkConsent() {
    // Check user's cookie consent
    this.hasConsent = getCookieConsent() === 'accepted'
  }
  
  async track(data: PageViewData) {
    if (!this.hasConsent) {
      console.log('Analytics tracking skipped - no consent')
      return
    }
    
    try {
      return await this.client.analytics.track(data)
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }
}

// ✅ Good: Debounce scroll tracking
function createScrollTracker(callback: (depth: number) => void) {
  let ticking = false
  
  const updateScrollDepth = () => {
    const scrollDepth = Math.floor(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    )
    callback(scrollDepth)
    ticking = false
  }
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollDepth)
      ticking = true
    }
  }
}
```

### Multilingual Content

```typescript
// ✅ Good: Handle language variants gracefully
import { 
  getVariantOrDefault, 
  detectUserLanguage, 
  getBestMatchingVariant 
} from '@simplist.blog/sdk'

function useLocalizedArticle(article: Article) {
  const userLanguage = detectUserLanguage()
  const userPreferences = [userLanguage, 'en'] // Fallback to English
  
  const localizedArticle = getBestMatchingVariant(article, userPreferences)
  
  return {
    article: localizedArticle,
    availableLanguages: getAllLanguages(article),
    isTranslated: localizedArticle.lang !== 'en'
  }
}

// ✅ Good: SEO for multilingual content
export async function generateMetadata({ params, searchParams }) {
  const lang = searchParams.lang || 'en'
  
  try {
    const { seo } = await client.seo.getArticle(
      params.slug,
      'https://myblog.com'
    )
    
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: {
        canonical: seo.canonicalUrl,
        languages: {
          'en': `https://myblog.com/articles/${params.slug}`,
          'fr': `https://myblog.com/articles/${params.slug}?lang=fr`,
          'es': `https://myblog.com/articles/${params.slug}?lang=es`
        }
      }
    }
  } catch (error) {
    return { title: 'Article Not Found' }
  }
}
```

## Migration Guide

If you're migrating from direct API calls to the SDK:

### Before (Direct API)

```typescript
// Old way: Direct fetch calls
const response = await fetch('https://api.simplist.blog/v1/articles', {
  headers: {
    'X-API-Key': 'sk_your_key'
  }
})

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}

const { data, meta } = await response.json()
```

### After (SDK)

```typescript
// New way: SDK with automatic error handling and retries
const client = new SimplistClient({
  apiKey: 'sk_your_key'
})

try {
  const { data, meta } = await client.articles.list()
} catch (error) {
  if (error instanceof SimplistApiError) {
    console.log('API Error:', error.statusCode, error.message)
  }
}
```

### Benefits of Migration

1. **Type Safety** - Full TypeScript support with IntelliSense
2. **Error Handling** - Comprehensive error types and automatic retry logic
3. **Simplified API** - Cleaner, more intuitive method names
4. **Built-in Features** - Automatic retries, timeout handling, response parsing
5. **Future-Proof** - Automatic compatibility with API updates

The Simplist SDK provides a robust, type-safe interface to the Simplist API with comprehensive error handling, automatic retries, and extensive TypeScript support. It's designed to make integrating Simplist into your applications as simple and reliable as possible.
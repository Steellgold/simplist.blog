# @simplist.blog/sdk

TypeScript SDK for the Simplist API - easily access your blog content programmatically.

## Installation

```bash
npm install @simplist.blog/sdk
# or
pnpm add @simplist.blog/sdk
# or
yarn add @simplist.blog/sdk
```

## Quick Start

```typescript
import { SimplistClient } from '@simplist.blog/sdk'

// Method 1: Auto-detect API key from environment (recommended)
const client = new SimplistClient() // Uses SIMPLIST_API_KEY env var

// Method 2: With configuration
const client = new SimplistClient({
  apiKey: 'prj_your_api_key_here', // Get this from your Simplist dashboard
  path: 'blog' // All SEO URLs will use /blog/article-slug
})

// Get all published articles
const articles = await client.articles.published()

// Get a specific article
const response = await client.articles.get('my-article-slug')
const article = response.data

// Get project information
const project_res = await client.project.get()
const project = project_res.data

// Track page views (analytics)
await client.analytics.track({
  slug: 'my-article-slug',
  referrer: 'https://example.com'
})

// Get SEO metadata
const seoData = await client.seo.getArticle('my-article-slug', 'https://myblog.com')

// Get RSS feed (uses global path automatically)
const rss = await client.seo.getRssFeed('https://myblog.com', 50)

// Get sitemap (uses global path automatically)
const sitemap = await client.seo.getSitemap('https://myblog.com', 'xml')
```

## Authentication

You need an API key to use the Simplist API. The SDK supports two authentication methods:

### Method 1: Environment Variable (Recommended)

Set the `SIMPLIST_API_KEY` environment variable:

```bash
# .env
SIMPLIST_API_KEY=prj_your_api_key_here
```

```typescript
// SDK auto-detects the key
const client = new SimplistClient()
```

### Method 2: Explicit API Key

```typescript
const client = new SimplistClient({
  apiKey: 'prj_your_api_key_here'
})
```

### Method 3: With Global Path Configuration

```typescript
const client = new SimplistClient({
  apiKey: 'prj_your_api_key_here',
  path: 'blog' // All SEO URLs will use /blog/article-slug
})

// Now all SEO methods use the global path automatically
const sitemap = await client.seo.getSitemap('https://myblog.com', 'xml')
const rss = await client.seo.getRssFeed('https://myblog.com', 50)
// URLs will be: https://myblog.com/blog/article-slug
```

### Getting an API Key

1. Go to your Simplist dashboard
2. Navigate to "API Keys"
3. Create a new API key (prefixed with `prj_`)
4. Copy the key

## API Reference

### Client Options

```typescript
const client = new SimplistClient({
  apiKey: 'prj_xxx',          // Optional: Your API key (auto-detected from SIMPLIST_API_KEY if not provided)
  baseUrl: 'https://api.simplist.blog', // Optional: API base URL
  apiVersion: '1',            // Optional: API version (default: '1')
  path: 'blog',               // Optional: Global article path for SEO URLs
  timeout: 10000,             // Optional: Request timeout (ms)
  retries: 3,                 // Optional: Number of retries
  retryDelay: 1000            // Optional: Delay between retries (ms)
})
```

### Articles

#### List Articles

```typescript
// Get all articles with pagination
const response = await client.articles.list({
  page: 1,
  limit: 20,
  sort: 'createdAt',       // 'createdAt' | 'updatedAt' | 'title'
  order: 'desc',           // 'asc' | 'desc'
  published: true,
  status: 'published',     // 'draft' | 'published'
  search: 'search term'
})

console.log(response.data) // Array of articles
console.log(response.meta) // Pagination info: { page, limit, total, totalPages }
```

#### Filter by Tags

```typescript
// Get articles with at least one of these tags (OR logic)
const response = await client.articles.list({
  tags: ['javascript', 'typescript']
})

// Get articles with ALL of these tags (AND logic)
const response = await client.articles.list({
  tagsAll: ['tutorial', 'beginner']
})

// Exclude articles with certain tags
const response = await client.articles.list({
  excludeTags: ['archived', 'draft']
})

// Combine filters
const response = await client.articles.list({
  tags: ['javascript'],
  excludeTags: ['outdated'],
  published: true
})
```

#### Optional Fields

```typescript
// Include tag colors and icons in response
const response = await client.articles.list({
  optionalFields: {
    tagColor: true,  // Include hex color codes for tags
    tagIcon: true    // Include icon identifiers for tags
  }
})

// Single article with optional fields
const article = await client.articles.get('my-slug', {
  optionalFields: {
    tagColor: true,
    tagIcon: true
  }
})
```

#### Get Single Article

```typescript
const response = await client.articles.get('article-slug')
const article = response.data

// Full article with content
console.log(article.title)
console.log(article.content)
console.log(article.excerpt)
console.log(article.coverImage)
console.log(article.wordCount)
console.log(article.readTimeMinutes)

// Author information
console.log(article.author.name)        // Author's full name
console.log(article.author.firstName)   // Author's first name (if set)
console.log(article.author.lastName)    // Author's last name (if set)
console.log(article.author.image)       // Author's profile picture URL (if set)

// Last editor information (null if article was never updated)
if (article.lastUpdatedBy) {
  console.log(article.lastUpdatedBy.name) // Last editor's name
}

// Tags
article.tags.forEach(tag => {
  console.log(tag.name)
  console.log(tag.color)  // Hex color (if optionalFields.tagColor was true)
  console.log(tag.icon)   // Icon identifier (if optionalFields.tagIcon was true)
})

// Variants (multilingual)
if (article.variants) {
  console.log(article.variants.fr?.title) // French title
  console.log(article.variants.es?.content) // Spanish content
}
```

#### Convenience Methods

```typescript
// Get only published articles
const published = await client.articles.published()
console.log(published.data) // Array of articles

// Search articles
const results = await client.articles.search('react hooks')
console.log(results.data) // Array of search results

// Get latest articles
const latest = await client.articles.latest(5)
console.log(latest.data) // Array of latest articles

// Get popular articles (most viewed)
const popular = await client.articles.popular(10)
console.log(popular.data) // Array of popular articles

// Generate RSS feed directly from articles
const rssXml = await client.articles.rss({
  hostname: 'https://myblog.com',
  title: 'My Blog Feed',
  description: 'Latest articles from my blog',
  limit: 50
})
```

### Tags

#### List All Tags

```typescript
// Get all tags with article counts
const response = await client.tags.list()
console.log(response.data) // Array of tags

response.data.forEach(tag => {
  console.log(tag.name)          // Tag name
  console.log(tag.color)         // Hex color code (e.g., "#EF4444")
  console.log(tag.icon)          // Icon identifier
  console.log(tag.articleCount)  // Number of articles with this tag
})
```

#### Get Single Tag

```typescript
const response = await client.tags.get('javascript')
const tag = response.data

console.log(tag.name)          // 'javascript'
console.log(tag.articleCount)  // Number of articles
```

#### Convenience Methods

```typescript
// Get just tag names
const names = await client.tags.names()
console.log(names) // ['javascript', 'typescript', 'react']

// Get popular tags (sorted by article count)
const popular = await client.tags.popular(5)
console.log(popular) // Top 5 tags by article count
```

### Project

#### Get Project Info

```typescript
// Get full project info with stats
const response = await client.project.get()
console.log(response.data.project) // Project details
console.log(response.data.stats)   // Article stats

// Get just project info
const project = await client.project.getInfo()
console.log(project.name)
console.log(project.slug)

// Get just stats
const stats = await client.project.getStats()
console.log(stats.totalArticles)
console.log(stats.publishedArticles)
console.log(stats.totalViews)
console.log(stats.storageUsed)
console.log(stats.storageLimit)
```

### Analytics

The SDK provides **server-side analytics tracking** which is more privacy-friendly and reliable than client-side scripts.

#### Why Server-side Analytics?

**Advantages:**
- **Never blocked** by adblockers
- **Privacy-friendly** - No cookies or client tracking
- **Better performance** - No additional JavaScript loaded
- **SSR compatible** - Works with Next.js App Router
- **More reliable** data collection

| Feature | Server-side (SDK) | Client-side Script |
|---------|------------------|-------------------|
| Adblocker-proof | Yes | Often blocked |
| Privacy compliance | GDPR-friendly | Requires consent |
| Performance impact | None | Additional JS |
| Data accuracy | Reliable | Can be inconsistent |
| Implementation | Manual | Automatic |

#### Track Page Views

```typescript
// Track a page view (initial tracking)
const result = await client.analytics.track({
  slug: 'article-slug',
  referrer: 'https://google.com',
  sessionId: 'session_123',
  pageUrl: 'https://example.com/article',
  pageTitle: 'My Article',
  // UTM parameters
  utmSource: 'twitter',
  utmMedium: 'social',
  utmCampaign: 'launch',
  // Device info
  screenWidth: 1920,
  screenHeight: 1080,
  // Initial engagement
  timeOnPage: 0,
  scrollDepth: 0,
  bounced: true,
  // Enable geo detection
  fetchGeo: true
})

console.log(result.pageViewId) // Use this to update metrics later
console.log(result.visitorId)
console.log(result.sessionId)

// Update page view with engagement metrics (when user leaves)
await client.analytics.update(result.pageViewId, {
  timeOnPage: 120,      // seconds
  scrollDepth: 75,      // percentage
  exitPosition: 80,     // percentage
  bounced: false,
  events: [
    {
      type: 'click',
      element: 'cta-button',
      timestamp: new Date().toISOString()
    }
  ]
})

// Get analytics data (requires API key with read permission)
const stats = await client.analytics.getStats({ days: 7 })
console.log(stats.period)                // { days, startDate, endDate }
console.log(stats.summary.totalViews)
console.log(stats.summary.uniqueVisitors)
console.log(stats.summary.avgViewsPerVisitor)
console.log(stats.requestSource)         // { sdk: {...}, direct: {...} }
console.log(stats.topArticles)
console.log(stats.topCountries)
```

#### Integration Examples

**Next.js App Router:**
```tsx
// app/articles/[slug]/page.tsx
import { headers } from 'next/headers'

export default async function ArticlePage({ params }) {
  const client = new SimplistClient()

  // Track the page view server-side
  await client.analytics.track({
    slug: params.slug,
    referrer: headers().get('referer') || undefined
  })

  const response = await client.articles.get(params.slug)
  return <ArticleComponent article={response.data} />
}
```

**React with useEffect:**
```tsx
function ArticlePage({ slug }) {
  useEffect(() => {
    const client = new SimplistClient()
    client.analytics.track({
      slug: slug,
      referrer: document.referrer || undefined
    })
  }, [slug])

  return <Article />
}
```

### SEO

#### Get Article SEO Data

```typescript
// Get SEO metadata for an article
const article = await client.seo.getArticle('article-slug', 'https://yourblog.com')

console.log(article.seo.metaTitle)
console.log(article.seo.metaDescription)
console.log(article.seo.ogTitle)
console.log(article.seo.ogDescription)
console.log(article.seo.ogImage)
console.log(article.seo.twitterCard)     // 'summary' | 'summary_large_image'
console.log(article.seo.canonicalUrl)
console.log(article.seo.structuredData)
console.log(article.seo.keywords)
console.log(article.seo.author)
console.log(article.seo.publishedTime)
console.log(article.seo.modifiedTime)
console.log(article.seo.readingTime)

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

#### Generate Sitemap

```typescript
// Get XML sitemap (uses global path if configured)
const xmlSitemap = await client.seo.getSitemap('https://yourblog.com', 'xml')

// Get XML sitemap with custom path (overrides global path)
const xmlSitemap = await client.seo.getSitemap('https://yourblog.com', 'xml', 'articles')

// Get JSON sitemap for programmatic access
const jsonSitemap = await client.seo.getSitemap('https://yourblog.com', 'json')
jsonSitemap.entries.forEach(entry => {
  console.log(entry.url)
  console.log(entry.lastModified)
  console.log(entry.changeFrequency) // 'daily' | 'weekly' | etc.
  console.log(entry.priority)
})
```

#### Generate RSS Feed

```typescript
// Generate RSS feed (uses global path if configured)
const rss = await client.seo.getRssFeed('https://yourblog.com', 20)

// Generate RSS feed with custom path (overrides global path)
const rss = await client.seo.getRssFeed('https://yourblog.com', 20, 'blog')
```

#### Get Structured Data

```typescript
const structuredData = await client.seo.getStructuredData('https://yourblog.com')

console.log(structuredData.project)    // Project info
console.log(structuredData.articles)   // Array of articles with JSON-LD
console.log(structuredData.generatedAt)

// Use in Next.js page
export default function ArticlePage({ article, structuredData }) {
  const articleData = structuredData.articles.find(a => a.slug === article.slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData?.structuredData)
        }}
      />
      <article>{article.content}</article>
    </>
  )
}
```

### Health Check

```typescript
// Test API connection
const health = await client.ping()
console.log(health.status)    // 'ok'
console.log(health.timestamp)
```

## Error Handling

The SDK throws `SimplistApiError` for API errors:

```typescript
import { SimplistApiError } from '@simplist.blog/sdk'

try {
  const response = await client.articles.get('non-existent-slug')
  const article = response.data
} catch (error) {
  if (error instanceof SimplistApiError) {
    console.log(error.statusCode) // 404
    console.log(error.message)    // "Article not found"
    console.log(error.error)      // "Not Found"
  }
}
```

## Multilingual Support

The SDK includes built-in support for multilingual articles with language variants.

### Language Types

```typescript
import {
  Language,
  type LanguageCode,
  isValidLanguageCode,
  getAllLanguageCodes,
  POPULAR_LANGUAGES
} from '@simplist.blog/sdk'

// Check if a language code is valid
if (isValidLanguageCode('fr')) {
  console.log('French is supported!')
}

// Get all supported language codes
const allLanguages = getAllLanguageCodes()

// Get list of popular languages
console.log(POPULAR_LANGUAGES) // ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi']
```

### Variant Helpers

```typescript
import {
  detectUserLanguage,
  getVariantOrDefault,
  getBestMatchingVariant,
  hasVariant,
  getAllLanguages,
  getVariantCount,
  isMultilingual,
  getVariantMetadata
} from '@simplist.blog/sdk'

// Get article with variants
const response = await client.articles.get('my-article')
const article = response.data

// Detect user's preferred language from browser
const userLang = detectUserLanguage() // 'en', 'fr', etc.

// Get the best matching variant for user's language
const variant = getBestMatchingVariant(article, userLang)

// Or get variant with fallback to default
const content = getVariantOrDefault(article, 'fr')

// Check if article has a specific language variant
if (hasVariant(article, 'es')) {
  console.log('Spanish version available!')
}

// Get all available languages for an article
const languages = getAllLanguages(article) // ['en', 'fr', 'es']

// Check if article is multilingual
if (isMultilingual(article)) {
  console.log(`Article has ${getVariantCount(article)} language versions`)
}

// Get metadata about variants
const metadata = getVariantMetadata(article)
console.log(metadata.languages)      // ['en', 'fr', 'es']
console.log(metadata.count)          // 3
console.log(metadata.isMultilingual) // true
console.log(metadata.hasVariants)    // true
```

### VariantSelector Class

For more complex use cases, use the `VariantSelector` class:

```typescript
import { VariantSelector } from '@simplist.blog/sdk'

// Create a selector with default configuration
const selector = new VariantSelector({
  defaultLanguage: 'en',
  userLanguage: 'fr' // or auto-detect with detectUserLanguage()
})

// Get content in user's preferred language
const content = selector.getContent(article)
const title = selector.getTitle(article)
const excerpt = selector.getExcerpt(article)
const fullContent = selector.getFullContent(article)
const coverImage = selector.getCoverImage(article)

// Get which language was selected
const selectedLang = selector.getSelectedLanguage(article)

// Update language preference dynamically
selector.setUserLanguage('de')
selector.setDefaultLanguage('es')
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  // API types
  ApiResponse,
  ApiError,

  // Article types
  Article,
  ArticleVariant,
  ArticleListItem,
  ArticleListParams,
  ArticleOptionalFields,
  Author,
  Tag,
  TagListItem,

  // Project types
  Project,
  ProjectStats,
  ProjectInfo,

  // Analytics types
  PageViewData,
  PageEvent,
  PageViewResponse,
  AnalyticsStats,

  // SEO types
  SeoMetadata,
  ArticleWithSeo,
  Sitemap,
  SitemapEntry,
  StructuredDataResponse,

  // Language types
  LanguageCode
} from '@simplist.blog/sdk'

// Example usage
const articles: ArticleListItem[] = response.data
const article: Article = singleResponse.data
const analytics: AnalyticsStats = analyticsResponse

// Author information
const author: Author = article.author
console.log(author.name)
console.log(author.firstName, author.lastName)
console.log(author.image)

// Variant types
const variant: ArticleVariant = article.variants?.fr
```

## Rate Limiting

The API has rate limits (100 requests per minute per API key). The SDK will automatically retry failed requests with exponential backoff.

## Examples

### Static Site Generation

```tsx
// Next.js getStaticProps - API key auto-detected from environment
export async function getStaticProps() {
  const client = new SimplistClient() // Uses SIMPLIST_API_KEY env var

  const articles = await client.articles.published({ limit: 10 })

  return {
    props: { articles: articles.data },
    revalidate: 60 // Revalidate every minute
  }
}
```

### SEO Routes with Global Path

```tsx
// app/sitemap.xml/route.ts - Uses global path configuration
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient({
  path: 'blog' // All URLs will use /blog/article-slug
})

export async function GET() {
  const sitemap = await client.seo.getSitemap('https://myblog.com', 'xml')

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

// app/rss.xml/route.ts - Uses global path configuration
export async function GET() {
  const rss = await client.seo.getRssFeed('https://myblog.com', 50)

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
}
```

### Blog Widget

```tsx
// React component - API key auto-detected from environment
import { SimplistClient } from '@simplist.blog/sdk'

const client = new SimplistClient() // Uses SIMPLIST_API_KEY env var

function BlogWidget() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    client.articles.latest(3).then(response => {
      setArticles(response.data)
    })
  }, [])

  return (
    <div>
      {articles.map(article => (
        <article key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <div>
            {article.tags.map(tag => (
              <span key={tag.name} style={{ color: tag.color }}>
                {tag.name}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
```

### Environment Variables

The SDK automatically detects the API key from the environment:

```bash
# Server-side (Node.js, Next.js API routes)
SIMPLIST_API_KEY=prj_your_api_key

# Client-side (Browser)
# Set via globalThis.SIMPLIST_API_KEY or pass directly to constructor
```

## License

MIT

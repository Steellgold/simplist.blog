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

// Method 2: With global path configuration (recommended)
const client = new SimplistClient({
  apiKey: 'sk_your_api_key_here', // Get this from your Simplist dashboard
  path: 'blog' // All SEO URLs will use /blog/article-slug
})

// Get all published articles
const articles = await client.articles.published()

// Get a specific article
const response = await client.articles.get('my-article-slug')
const article = response.data

// Get project information
const response = await client.project.get()
const project = response.data

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
SIMPLIST_API_KEY=sk_your_api_key_here
```

```typescript
// SDK auto-detects the key
const client = new SimplistClient()
```

### Method 2: Explicit API Key

```typescript
const client = new SimplistClient({
  apiKey: 'sk_your_api_key_here'
})
```

### Method 3: With Global Path Configuration (Recommended)

```typescript
const client = new SimplistClient({
  apiKey: 'sk_your_api_key_here',
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
3. Create a new API key
4. Choose the appropriate type:
   - **Secret Key (sk_)**: For server-side use (full access)
   - **Public Key (pk_)**: For client-side use (analytics only)
5. Copy the key

## API Reference

### Client Options

```typescript
const client = new SimplistClient({
  apiKey: 'sk_xxx',           // Optional: Your API key (auto-detected from SIMPLIST_API_KEY if not provided)
  baseUrl: 'https://api.simplist.blog', // Optional: API base URL
  path: 'blog',               // Optional: Global article path (e.g., "blog", "articles") - auto-adds trailing slash
  timeout: 10000,             // Optional: Request timeout (ms)
  retries: 3,                 // Optional: Number of retries
  retryDelay: 1000           // Optional: Delay between retries (ms)
})
```

### Articles

#### List Articles

```typescript
// Get all articles with pagination
const response = await client.articles.list({
  page: 1,
  limit: 20,
  sort: 'createdAt',
  order: 'desc',
  published: true,
  search: 'search term'
})

console.log(response.data) // Array of articles
console.log(response.meta) // Pagination info
```

#### Get Single Article

```typescript
const response = await client.articles.get('article-slug')
const article = response.data

// Full article with content
console.log(article.title)
console.log(article.content)

// Author information
console.log(article.author.name)        // Author's full name
console.log(article.author.firstName)   // Author's first name (if set)
console.log(article.author.lastName)    // Author's last name (if set)
console.log(article.author.image)       // Author's profile picture URL (if set)

// Last editor information (null if article was never updated)
if (article.lastUpdatedBy) {
  console.log(article.lastUpdatedBy.name) // Last editor's name
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

// Get just stats
const stats = await client.project.getStats()
```

### Analytics

The SDK provides **server-side analytics tracking** which is more privacy-friendly and reliable than client-side scripts.

#### Why Server-side Analytics?

**✅ Advantages:**
- **Never blocked** by adblockers
- **Privacy-friendly** - No cookies or client tracking
- **Better performance** - No additional JavaScript loaded
- **SSR compatible** - Works with Next.js App Router
- **More reliable** data collection

**📊 vs Client-side Scripts:**
| Feature | Server-side (SDK) | Client-side Script |
|---------|------------------|-------------------|
| Adblocker-proof | ✅ Yes | ❌ Often blocked |
| Privacy compliance | ✅ GDPR-friendly | ⚠️ Requires consent |
| Performance impact | ✅ None | ❌ Additional JS |
| Data accuracy | ✅ Reliable | ⚠️ Can be inconsistent |
| Implementation | Manual | Automatic |

#### Track Page Views

```typescript
// Track a page view (initial tracking)
const result = await client.analytics.track({
  slug: 'article-slug',
  referrer: 'https://google.com',
  sessionId: 'session_123',
  pageUrl: 'https://example.com/article',
  pageTitle: 'My Article'
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

// Get analytics data
const stats = await client.analytics.getStats({ days: 7 })
console.log(stats.summary.totalViews)
console.log(stats.summary.uniqueVisitors)
console.log(stats.topArticles)
console.log(stats.topCountries)
```

#### Integration Examples

**Next.js App Router:**
```tsx
// app/articles/[slug]/page.tsx
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
console.log(article.seo.structuredData)
```

#### Generate Sitemap

```typescript
// Get XML sitemap (uses global path if configured)
const xmlSitemap = await client.seo.getSitemap('https://yourblog.com', 'xml')

// Get XML sitemap with custom path (overrides global path)
const xmlSitemap = await client.seo.getSitemap('https://yourblog.com', 'xml', 'articles')

// Get JSON sitemap
const jsonSitemap = await client.seo.getSitemap('https://yourblog.com', 'json')
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
```


### Health Check

```typescript
// Test API connection
const health = await client.ping()
console.log(health.status) // 'ok'
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

// Detect user's preferred language
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

// Get metadata about a variant
const metadata = getVariantMetadata(article, 'fr')
console.log(metadata.wordCount)
console.log(metadata.readTimeMinutes)
```

### Variant Selector Component (React)

```tsx
import { VariantSelector } from '@simplist.blog/sdk'

function ArticlePage({ article }) {
  const [selectedLang, setSelectedLang] = useState('en')

  return (
    <div>
      <VariantSelector
        article={article}
        currentLanguage={selectedLang}
        onLanguageChange={setSelectedLang}
        className="language-switcher"
      />

      <article>
        <h1>{getVariantOrDefault(article, selectedLang).title}</h1>
        <div>{getVariantOrDefault(article, selectedLang).content}</div>
      </article>
    </div>
  )
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  Article,
  ArticleVariant,
  ArticleListItem,
  Author,
  ProjectInfo,
  PageViewData,
  PageEvent,
  SeoMetadata,
  AnalyticsStats,
  Sitemap,
  SitemapEntry,
  StructuredDataResponse
} from '@simplist.blog/sdk'

const articles: ArticleListItem[] = response.data
const article: Article = singleResponse.data
const analytics: AnalyticsStats = analyticsResponse

// Author information
const author: Author = article.author
console.log(author.name)
console.log(author.firstName, author.lastName)
console.log(author.image)

// Last updated by (may be null if never updated)
const lastEditor: Author | null = article.lastUpdatedBy

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
SIMPLIST_API_KEY=sk_your_secret_key

# Client-side (Browser)
# Set via globalThis.SIMPLIST_API_KEY or pass directly to constructor
```

## License

MIT
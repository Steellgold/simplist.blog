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
const article = await client.articles.get('my-article-slug')

// Get project information
const project = await client.project.get()

// Track page views (analytics)
await client.analytics.track({
  slug: 'my-article-slug',
  referrer: 'https://example.com'
})

// Get SEO metadata
const seoData = await client.seo.getArticle('my-article-slug')

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
console.log(response.data) // Full article with content
```

#### Convenience Methods

```typescript
// Get only published articles
const published = await client.articles.published()

// Search articles
const results = await client.articles.search('react hooks')

// Get latest articles
const latest = await client.articles.latest(5)
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
// Track a page view
await client.analytics.track({
  slug: 'article-slug',
  referrer: 'https://google.com'
})

// Get analytics data
const analytics = await client.analytics.get('article-slug')
console.log(analytics.data.totalViews)
console.log(analytics.data.uniqueVisitors)
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
  
  const article = await client.articles.get(params.slug)
  return <ArticleComponent article={article} />
}
```

**React with useEffect:**
```tsx
function ArticlePage({ slug }) {
  useEffect(() => {
    const client = new SimplistClient()
    client.analytics.track({
      slug,
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
const response = await client.seo.getArticle('article-slug', {
  baseUrl: 'https://yourblog.com'
})

console.log(response.data.seo.metaTitle)
console.log(response.data.seo.structuredData)
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
const structuredData = await client.seo.getStructuredData({
  baseUrl: 'https://yourblog.com'
})
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
  const article = await client.articles.get('non-existent-slug')
} catch (error) {
  if (error instanceof SimplistApiError) {
    console.log(error.statusCode) // 404
    console.log(error.message)    // "Article not found"
    console.log(error.error)      // "Not Found"
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type { 
  Article, 
  ArticleListItem, 
  ProjectInfo,
  PageViewData,
  SeoMetadata,
  AnalyticsStats 
} from '@simplist.blog/sdk'

const articles: ArticleListItem[] = response.data
const article: Article = singleResponse.data
const analytics: AnalyticsStats = analyticsResponse.data
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

const client = new SimplistClient() // Uses SIMPLIST_API_KEY or REACT_APP_SIMPLIST_API_KEY

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

For different environments, you can use:

```bash
# Server-side (Node.js, Next.js API routes)
SIMPLIST_API_KEY=sk_your_secret_key

# Client-side (React, Vue.js)  
REACT_APP_SIMPLIST_API_KEY=pk_your_public_key
VITE_SIMPLIST_API_KEY=pk_your_public_key
NEXT_PUBLIC_SIMPLIST_API_KEY=pk_your_public_key
```

## License

MIT
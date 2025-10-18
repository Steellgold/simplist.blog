# @simplist/sdk

TypeScript SDK for the Simplist API - easily access your blog content programmatically.

## Installation

```bash
npm install @simplist/sdk
# or
pnpm add @simplist/sdk
# or
yarn add @simplist/sdk
```

## Quick Start

```typescript
import { SimplistClient } from '@simplist/sdk'

const client = new SimplistClient({
  apiKey: 'sk_your_api_key_here' // Get this from your Simplist dashboard
})

// Get all published articles
const articles = await client.articles.published()

// Get a specific article
const article = await client.articles.get('my-article-slug')

// Get project information
const project = await client.project.get()
```

## Authentication

You need an API key to use the Simplist API. Get one from your Simplist dashboard:

1. Go to your Simplist dashboard
2. Navigate to "API Keys"
3. Create a new API key
4. Copy the key (it starts with `sk_`)

## API Reference

### Client Options

```typescript
const client = new SimplistClient({
  apiKey: 'sk_xxx',           // Required: Your API key
  baseUrl: 'https://api.simplist.blog', // Optional: API base URL
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

### Health Check

```typescript
// Test API connection
const health = await client.ping()
console.log(health.status) // 'ok'
```

## Error Handling

The SDK throws `SimplistApiError` for API errors:

```typescript
import { SimplistApiError } from '@simplist/sdk'

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
import type { Article, ArticleListItem, ProjectInfo } from '@simplist/sdk'

const articles: ArticleListItem[] = response.data
const article: Article = singleResponse.data
```

## Rate Limiting

The API has rate limits (100 requests per minute per API key). The SDK will automatically retry failed requests with exponential backoff.

## Examples

### Static Site Generation

```typescript
// Next.js getStaticProps
export async function getStaticProps() {
  const client = new SimplistClient({
    apiKey: process.env.SIMPLIST_API_KEY!
  })
  
  const articles = await client.articles.published({ limit: 10 })
  
  return {
    props: { articles: articles.data },
    revalidate: 60 // Revalidate every minute
  }
}
```

### Blog Widget

```typescript
// React component
import { SimplistClient } from '@simplist/sdk'

const client = new SimplistClient({
  apiKey: 'sk_your_api_key'
})

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

## License

MIT
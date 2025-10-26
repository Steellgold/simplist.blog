# Simplist API Documentation

The Simplist API is a high-performance REST API built with Fastify that provides programmatic access to blog content, analytics, and SEO features. This API serves as the backbone for content consumption and analytics tracking in the Simplist ecosystem.

## Base Information

- **Base URL**: `https://api.simplist.blog`
- **API Version**: `v1`
- **Protocol**: HTTPS only
- **Format**: JSON
- **Framework**: Fastify with TypeScript

## Architecture

The API is built with:
- **Fastify** - High-performance web framework
- **Prisma** - Database ORM with PostgreSQL
- **Redis** - Caching layer (Upstash Redis)
- **Zod** - Schema validation
- **Rate limiting** - 100 requests/minute per API key
- **Compression** - Response compression enabled
- **Security** - Helmet security headers and CORS

## Authentication

### API Key Types

The API supports two types of API keys:

- **Secret Keys** (`sk_...`) - Full access with read permissions
- **Public Keys** (`pk_...`) - Limited access for analytics tracking only

### Headers

All authenticated requests must include:

```http
X-API-Key: your_api_key_here
```

### Permissions

API keys have granular permissions:
- `read` - Access to content and analytics data
- `analytics` - Ability to track page views and events

## Rate Limiting & Security

- **Rate Limit**: 100 requests per minute per API key
- **CORS**: Configurable per project with allowed domains
- **Security Headers**: Helmet middleware for security
- **Bot Detection**: Automatic bot filtering for analytics endpoints
- **Input Validation**: Zod schema validation on all endpoints

## Health Check

### GET /health

Basic health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### GET /

API information endpoint.

**Response:**
```json
{
  "name": "Simplist API",
  "version": "1.0.0",
  "health": "/health"
}
```

## Articles

### GET /v1/articles

Retrieve a paginated list of articles with filtering and search capabilities.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20) - Number of articles per page
- `sort` (string, default: "createdAt") - Sort field
- `order` (string, default: "desc") - Sort order (asc/desc)
- `published` (boolean, default: true) - Filter by published status
- `search` (string) - Search in title, excerpt, and content
- `status` (string) - Filter by article status

**Example Request:**
```http
GET /v1/articles?page=1&limit=10&search=javascript&published=true
X-API-Key: sk_your_api_key
```

**Response:**
```json
{
  "data": [
    {
      "id": "article_123",
      "title": "Getting Started with JavaScript",
      "slug": "getting-started-javascript",
      "excerpt": "Learn the basics of JavaScript programming",
      "coverImage": "https://cdn.simplist.blog/images/cover.jpg",
      "published": true,
      "status": "published",
      "viewCount": 1250,
      "wordCount": 1500,
      "characterCount": 8750,
      "lineCount": 120,
      "readTimeMinutes": 8,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T15:30:00.000Z",
      "publishedAt": "2023-12-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Caching:**
- Articles are cached in Redis with a 5-minute TTL
- Cache key includes project ID and query parameters
- Automatic cache invalidation on content updates

### GET /v1/articles/:slug

Retrieve a single article by its slug.

**Path Parameters:**
- `slug` (string) - Article slug

**Query Parameters:**
- `includeSeo` (boolean, default: false) - Include SEO metadata
- `baseUrl` (string) - Base URL for SEO metadata generation

**Example Request:**
```http
GET /v1/articles/getting-started-javascript?includeSeo=true&baseUrl=https://myblog.com
X-API-Key: sk_your_api_key
```

**Response:**
```json
{
  "data": {
    "id": "article_123",
    "title": "Getting Started with JavaScript",
    "slug": "getting-started-javascript",
    "excerpt": "Learn the basics of JavaScript programming",
    "content": "# Getting Started with JavaScript\n\nJavaScript is...",
    "coverImage": "https://cdn.simplist.blog/images/cover.jpg",
    "published": true,
    "status": "published",
    "viewCount": 1250,
    "wordCount": 1500,
    "characterCount": 8750,
    "lineCount": 120,
    "readTimeMinutes": 8,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T15:30:00.000Z",
    "publishedAt": "2023-12-01T12:00:00.000Z",
    "variants": [],
    "seo": {
      "metaTitle": "Getting Started with JavaScript - My Blog",
      "metaDescription": "Learn the basics of JavaScript programming",
      "ogTitle": "Getting Started with JavaScript",
      "ogDescription": "Learn the basics of JavaScript programming",
      "ogImage": "https://cdn.simplist.blog/images/cover.jpg",
      "ogType": "article",
      "twitterCard": "summary_large_image",
      "canonicalUrl": "https://myblog.com/articles/getting-started-javascript",
      "structuredData": {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Getting Started with JavaScript",
        "description": "Learn the basics of JavaScript programming"
      }
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Article not found or not published
- `500 Internal Server Error` - Server error

## Projects

### GET /v1/project

Retrieve project information and statistics.

**Example Request:**
```http
GET /v1/project
X-API-Key: sk_your_api_key
```

**Response:**
```json
{
  "data": {
    "project": {
      "id": "project_123",
      "name": "My Tech Blog",
      "slug": "my-tech-blog",
      "description": "A blog about web development and technology",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    },
    "stats": {
      "totalArticles": 25,
      "publishedArticles": 20,
      "totalViews": 15750
    }
  }
}
```

## Analytics

The analytics endpoints provide comprehensive tracking and reporting capabilities with automatic bot detection and visitor deduplication.

### POST /v1/analytics/track

Track a page view with detailed metrics and events.

**Request Body:**
```json
{
  "articleSlug": "getting-started-javascript",
  "sessionId": "session_123456789",
  "pageUrl": "https://myblog.com/articles/getting-started-javascript",
  "pageTitle": "Getting Started with JavaScript - My Blog",
  "referrer": "https://google.com",
  "utmSource": "google",
  "utmMedium": "organic",
  "utmCampaign": null,
  "utmTerm": "javascript tutorial",
  "utmContent": null,
  "screenWidth": 1920,
  "screenHeight": 1080,
  "timeOnPage": 120,
  "scrollDepth": 75,
  "exitPosition": 80,
  "bounced": false,
  "timestamp": "2023-12-01T10:00:00.000Z",
  "country": "United States",
  "countryCode": "US",
  "region": "California",
  "city": "San Francisco",
  "timezone": "America/Los_Angeles",
  "events": [
    {
      "type": "click",
      "data": { "element": "cta-button" },
      "position": 45,
      "element": "button",
      "timestamp": "2023-12-01T10:01:30.000Z",
      "timeOffset": 90
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "pageViewId": "pv_123456789",
  "visitorId": "visitor_abcdef123",
  "sessionId": "session_123456789"
}
```

**Features:**
- **Bot Detection**: Automatic filtering of bot traffic
- **Visitor Deduplication**: Intelligent visitor ID management
- **User Agent Parsing**: Device, browser, and OS detection
- **Geo Data**: Country, region, city tracking (IP not stored)
- **Event Tracking**: Custom events with metadata
- **Privacy-Focused**: No IP address storage

### PUT /v1/analytics/track/:pageViewId

Update an existing page view with final engagement metrics.

**Path Parameters:**
- `pageViewId` (string) - Page view ID from track response

**Request Body:**
```json
{
  "timeOnPage": 300,
  "scrollDepth": 95,
  "exitPosition": 90,
  "bounced": false
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /v1/analytics/stats

Retrieve analytics statistics for the project.

**Permission Required:** `read`

**Query Parameters:**
- `days` (number, default: 30) - Number of days to include in stats

**Example Request:**
```http
GET /v1/analytics/stats?days=7
X-API-Key: sk_your_api_key
```

**Response:**
```json
{
  "period": {
    "days": 7,
    "startDate": "2023-11-24T10:00:00.000Z",
    "endDate": "2023-12-01T10:00:00.000Z"
  },
  "summary": {
    "totalViews": 1250,
    "uniqueVisitors": 890,
    "avgViewsPerVisitor": 1.40
  },
  "topArticles": [
    {
      "articleId": "article_123",
      "title": "Getting Started with JavaScript",
      "slug": "getting-started-javascript",
      "views": 450
    }
  ],
  "topCountries": [
    {
      "country": "United States",
      "views": 650
    },
    {
      "country": "United Kingdom",
      "views": 200
    }
  ]
}
```

## SEO

The SEO endpoints provide comprehensive metadata generation, sitemap creation, and structured data for optimal search engine optimization.

### GET /v1/seo/article/:articleSlug

Get complete SEO metadata for a specific article.

**Path Parameters:**
- `articleSlug` (string) - Article slug

**Query Parameters:**
- `baseUrl` (string) - Base URL for canonical URLs and Open Graph

**Example Request:**
```http
GET /v1/seo/article/getting-started-javascript?baseUrl=https://myblog.com
X-API-Key: sk_your_api_key
```

**Response:**
```json
{
  "id": "article_123",
  "title": "Getting Started with JavaScript",
  "slug": "getting-started-javascript",
  "excerpt": "Learn the basics of JavaScript programming",
  "content": "# Getting Started with JavaScript\n\nJavaScript is...",
  "coverImage": "https://cdn.simplist.blog/images/cover.jpg",
  "published": true,
  "viewCount": 1250,
  "wordCount": 1500,
  "characterCount": 8750,
  "lineCount": 120,
  "readTimeMinutes": 8,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T15:30:00.000Z",
  "publishedAt": "2023-12-01T12:00:00.000Z",
  "seo": {
    "metaTitle": "Getting Started with JavaScript - My Tech Blog",
    "metaDescription": "Learn the basics of JavaScript programming with this comprehensive guide",
    "ogTitle": "Getting Started with JavaScript",
    "ogDescription": "Learn the basics of JavaScript programming",
    "ogImage": "https://cdn.simplist.blog/images/cover.jpg",
    "ogType": "article",
    "twitterTitle": "Getting Started with JavaScript",
    "twitterDescription": "Learn the basics of JavaScript programming",
    "twitterImage": "https://cdn.simplist.blog/images/cover.jpg",
    "twitterCard": "summary_large_image",
    "canonicalUrl": "https://myblog.com/my-tech-blog/getting-started-javascript",
    "structuredData": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Getting Started with JavaScript",
      "description": "Learn the basics of JavaScript programming",
      "image": "https://cdn.simplist.blog/images/cover.jpg",
      "author": {
        "@type": "Organization",
        "name": "My Tech Blog"
      },
      "publisher": {
        "@type": "Organization",
        "name": "My Tech Blog"
      },
      "datePublished": "2023-12-01T12:00:00.000Z",
      "dateModified": "2023-12-01T15:30:00.000Z"
    },
    "keywords": ["javascript", "programming", "tutorial"],
    "language": "en",
    "publishedTime": "2023-12-01T12:00:00.000Z",
    "modifiedTime": "2023-12-01T15:30:00.000Z",
    "readingTime": 8
  },
  "project": {
    "name": "My Tech Blog",
    "slug": "my-tech-blog",
    "description": "A blog about web development and technology"
  }
}
```

### GET /v1/seo/article/:articleSlug/:lang

Get SEO metadata for a specific article variant (multilingual support).

**Path Parameters:**
- `articleSlug` (string) - Article slug
- `lang` (string) - Language code (e.g., "fr", "es", "de")

**Query Parameters:**
- `baseUrl` (string) - Base URL for canonical URLs

### GET /v1/seo/sitemap

Generate a sitemap for the project with support for custom URL structures.

**Query Parameters:**
- `baseUrl` (string, required) - Base URL for generating article URLs
- `format` (string, default: "xml") - Response format ("xml" or "json")
- `lang` (string) - Language filter for variants
- `customPath` (string) - Custom URL path pattern using `{slug}` placeholder

**Example Request (XML with default structure):**
```http
GET /v1/seo/sitemap?baseUrl=https://myblog.com&format=xml
X-API-Key: sk_your_api_key
```

**Example Request (XML with custom path):**
```http
GET /v1/seo/sitemap?baseUrl=https://gaetanhus.fr&format=xml&customPath=blog/{slug}
X-API-Key: sk_your_api_key
```

**Response (XML with default structure):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://myblog.com/my-tech-blog</loc>
    <lastmod>2023-12-01T10:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://myblog.com/my-tech-blog/getting-started-javascript</loc>
    <lastmod>2023-12-01T15:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Response (XML with custom path):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gaetanhus.fr/blog/getting-started-javascript</loc>
    <lastmod>2023-12-01T15:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Example Request (JSON):**
```http
GET /v1/seo/sitemap?baseUrl=https://myblog.com&format=json
X-API-Key: sk_your_api_key
```

**Response (JSON):**
```json
{
  "entries": [
    {
      "url": "https://myblog.com/my-tech-blog",
      "lastModified": "2023-12-01T10:00:00.000Z",
      "changeFrequency": "daily",
      "priority": 1.0
    },
    {
      "url": "https://myblog.com/my-tech-blog/getting-started-javascript",
      "lastModified": "2023-12-01T15:30:00.000Z",
      "changeFrequency": "weekly",
      "priority": 0.8
    }
  ],
  "generatedAt": "2023-12-01T16:00:00.000Z"
}
```

### GET /v1/seo/rss

Generate an RSS feed for the project.

**Query Parameters:**
- `baseUrl` (string, required) - Base URL for generating article URLs
- `limit` (number, default: 20, max: 100) - Number of articles to include
- `lang` (string) - Language filter for variants

**Example Request:**
```http
GET /v1/seo/rss?baseUrl=https://myblog.com&limit=10
X-API-Key: sk_your_api_key
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[My Tech Blog]]></title>
    <description><![CDATA[A blog about web development and technology]]></description>
    <link>https://myblog.com</link>
    <lastBuildDate>Fri, 01 Dec 2023 16:00:00 GMT</lastBuildDate>
    <generator>Simplist API</generator>
    <item>
      <title><![CDATA[Getting Started with JavaScript]]></title>
      <description><![CDATA[Learn the basics of JavaScript programming]]></description>
      <link>https://myblog.com/my-tech-blog/getting-started-javascript</link>
      <guid>https://myblog.com/my-tech-blog/getting-started-javascript</guid>
      <pubDate>Fri, 01 Dec 2023 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

### GET /v1/seo/structured-data

Get Schema.org structured data for all articles in the project.

**Query Parameters:**
- `baseUrl` (string) - Base URL for generating article URLs

**Response:**
```json
{
  "project": {
    "name": "My Tech Blog",
    "slug": "my-tech-blog",
    "description": "A blog about web development and technology"
  },
  "articles": [
    {
      "slug": "getting-started-javascript",
      "structuredData": {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Getting Started with JavaScript",
        "description": "Learn the basics of JavaScript programming"
      }
    }
  ],
  "generatedAt": "2023-12-01T16:00:00.000Z"
}
```


## Cron Jobs

### POST /v1/cron/publish-scheduled

Publish articles that are scheduled and ready for publication.

**Headers Required:**
- `x-cron-secret` (string) - Cron job secret for authentication

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "timestamp": "2023-12-01T16:00:00.000Z",
  "results": {
    "processed": 3,
    "published": 2,
    "errors": [
      "Failed to publish article article_456: Database connection error"
    ]
  }
}
```

## Caching Strategy

The API implements a comprehensive Redis-based caching strategy:

### Article Caching
- **Cache TTL**: 5 minutes
- **Cache Keys**: Include project ID, slug, and query parameters
- **Invalidation**: Automatic on content updates
- **Scope**: Both individual articles and article lists

### Analytics Caching
- **Cache TTL**: Variable based on data freshness requirements
- **Invalidation**: On new page views and events
- **Multi-period caching**: 7, 30, 90-day periods cached separately

### Cache Headers
The API includes appropriate cache headers in responses:
- `Cache-Control` headers for client-side caching
- `ETag` headers for conditional requests
- `Last-Modified` headers for freshness validation

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid request parameters or body
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Examples

**Invalid API Key:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "statusCode": 401
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later.",
  "statusCode": 429
}
```

**Article Not Found:**
```json
{
  "error": "Not Found",
  "message": "Article not found or not published",
  "statusCode": 404
}
```

**Insufficient Permissions:**
```json
{
  "error": "Forbidden",
  "message": "API key does not have read permissions",
  "statusCode": 403
}
```

## Performance & Monitoring

### Response Times
- **Average Response Time**: < 100ms for cached requests
- **P99 Response Time**: < 500ms
- **Database Queries**: Optimized with proper indexing

### Monitoring
- Health check endpoint for uptime monitoring
- Structured logging for debugging and analytics
- Error tracking and alerting

### Optimization Features
- **Compression**: Gzip compression for all responses
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Prisma-optimized database queries
- **Caching**: Multi-layer caching strategy

## Best Practices

### API Key Security
- Store API keys securely in environment variables
- Use public keys (`pk_`) only for client-side analytics tracking
- Rotate API keys regularly
- Monitor API key usage for suspicious activity

### Request Optimization
- Use pagination for large datasets
- Implement client-side caching where appropriate
- Batch requests when possible
- Use specific field selection to reduce payload size

### Error Handling
- Implement proper retry logic with exponential backoff
- Handle rate limiting gracefully
- Log errors for debugging
- Provide meaningful error messages to users

### Analytics Implementation
- Implement bot detection on the client side
- Use session IDs for better user journey tracking
- Respect user privacy preferences
- Implement proper consent management
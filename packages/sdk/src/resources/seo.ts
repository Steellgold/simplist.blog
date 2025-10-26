import { HttpClient } from '../utils/http.js'

export interface SeoMetadata {
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

export interface ArticleWithSeo {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  seo: SeoMetadata
  project: {
    name: string
    slug: string
    description: string | null
  }
}

export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export interface Sitemap {
  entries: SitemapEntry[]
  generatedAt: string
}

export interface StructuredDataResponse {
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

/**
 * SEO Resource - Provides SEO-related functionality
 */
export class SeoResource {
  constructor(private http: HttpClient, private globalPath?: string) {}

  /**
   * Get SEO metadata for a specific article
   * 
   * @param articleSlug - Article slug
   * @param baseUrl - Base URL for canonical URLs and Open Graph
   * @returns Article with complete SEO metadata
   * 
   * @example
   * ```typescript
   * const articleSeo = await client.seo.getArticle('my-article', 'https://myblog.com')
   * 
   * // Use in Next.js metadata
   * export async function generateMetadata({ params }) {
   *   const { seo } = await client.seo.getArticle(params.slug, 'https://myblog.com')
   *   
   *   return {
   *     title: seo.metaTitle,
   *     description: seo.metaDescription,
   *     openGraph: {
   *       title: seo.ogTitle,
   *       description: seo.ogDescription,
   *       images: seo.ogImage ? [seo.ogImage] : undefined,
   *       type: seo.ogType
   *     },
   *     twitter: {
   *       card: seo.twitterCard,
   *       title: seo.twitterTitle,
   *       description: seo.twitterDescription,
   *       images: seo.twitterImage ? [seo.twitterImage] : undefined
   *     },
   *     alternates: {
   *       canonical: seo.canonicalUrl
   *     }
   *   }
   * }
   * ```
   */
  async getArticle(articleSlug: string, baseUrl?: string): Promise<ArticleWithSeo> {
    const params = new URLSearchParams()
    if (baseUrl) params.set('baseUrl', baseUrl)
    
    const query = params.toString()
    const url = `/v1/seo/article/${articleSlug}${query ? `?${query}` : ''}`
    
    return this.http.get(url) as Promise<ArticleWithSeo>
  }

  /**
   * Generate sitemap for a project with support for custom URL structures
   * 
   * @param baseUrl - Base URL for generating article URLs
   * @param format - Response format ('xml' or 'json')
   * @param path - Article path (e.g., "blog", "articles", "posts") - auto-adds trailing slash
   * @returns Sitemap in requested format
   * 
   * @example
   * ```typescript
   * // Get XML sitemap with default structure (no project slug)
   * export async function GET() {
   *   const sitemapXml = await client.seo.getSitemap('https://myblog.com', 'xml')
   *   
   *   return new Response(sitemapXml, {
   *     headers: {
   *       'Content-Type': 'application/xml',
   *     },
   *   })
   * }
   * 
   * // Get XML sitemap with custom path
   * export async function GET() {
   *   const sitemapXml = await client.seo.getSitemap('https://gaetanhus.fr', 'xml', 'blog')
   *   // Generates: https://gaetanhus.fr/blog/article-slug
   *   
   *   return new Response(sitemapXml, {
   *     headers: {
   *       'Content-Type': 'application/xml',
   *     },
   *   })
   * }
   * 
   * // Get JSON sitemap for processing
   * const sitemap = await client.seo.getSitemap('https://myblog.com', 'json')
   * sitemap.entries.forEach(entry => {
   *   console.log(`URL: ${entry.url}, Last Modified: ${entry.lastModified}`)
   * })
   * ```
   */
  async getSitemap(baseUrl: string, format: 'xml' | 'json' = 'xml', path?: string): Promise<string | Sitemap> {
    const params = new URLSearchParams({
      baseUrl,
      format
    })
    
    // Use provided path or fall back to global path
    const effectivePath = path || this.globalPath
    if (effectivePath) {
      // Auto-add trailing slash if not present
      const normalizedPath = effectivePath.endsWith('/') ? effectivePath : `${effectivePath}/`
      params.set('customPath', `${normalizedPath}{slug}`)
    }
    
    const response = await this.http.get(`/v1/seo/sitemap?${params}`, {
      headers: format === 'xml' ? { Accept: 'application/xml' } : undefined
    })
    
    if (format === 'xml') {
      return response as string
    } else {
      return response as Sitemap
    }
  }

  /**
   * Generate RSS feed for a project
   * 
   * @param baseUrl - Base URL for generating article URLs
   * @param limit - Maximum number of articles to include
   * @param path - Article path (e.g., "blog", "articles", "posts") - auto-adds trailing slash
   * @returns RSS feed XML
   * 
   * @example
   * ```typescript
   * // Generate RSS feed for Next.js
   * export async function GET() {
   *   const rssXml = await client.seo.getRssFeed('https://myblog.com', 20)
   *   
   *   return new Response(rssXml, {
   *     headers: {
   *       'Content-Type': 'application/rss+xml',
   *     },
   *   })
   * }
   * 
   * // Generate RSS feed with custom path
   * export async function GET() {
   *   const rssXml = await client.seo.getRssFeed('https://gaetanhus.fr', 20, 'blog')
   *   // Generates: https://gaetanhus.fr/blog/article-slug
   *   
   *   return new Response(rssXml, {
   *     headers: {
   *       'Content-Type': 'application/rss+xml',
   *     },
   *   })
   * }
   * ```
   */
  async getRssFeed(baseUrl: string, limit = 20, path?: string): Promise<string> {
    const params = new URLSearchParams({
      baseUrl,
      limit: limit.toString()
    })
    
    // Use provided path or fall back to global path
    const effectivePath = path || this.globalPath
    if (effectivePath) {
      // Auto-add trailing slash if not present
      const normalizedPath = effectivePath.endsWith('/') ? effectivePath : `${effectivePath}/`
      params.set('customPath', `${normalizedPath}{slug}`)
    }
    
    return this.http.get(`/v1/seo/rss?${params}`) as Promise<string>
  }

  /**
   * Get structured data for all articles
   * 
   * @param baseUrl - Base URL for generating article URLs
   * @returns Structured data for all articles
   * 
   * @example
   * ```typescript
   * const structuredData = await client.seo.getStructuredData('https://myblog.com')
   * 
   * // Use in Next.js page
   * export default function ArticlePage({ article, structuredData }) {
   *   return (
   *     <>
   *       <script
   *         type="application/ld+json"
   *         dangerouslySetInnerHTML={{
   *           __html: JSON.stringify(structuredData.articles.find(a => a.slug === article.slug)?.structuredData)
   *         }}
   *       />
   *       <article>{article.content}</article>
   *     </>
   *   )
   * }
   * ```
   */
  async getStructuredData(baseUrl?: string): Promise<StructuredDataResponse> {
    const params = new URLSearchParams()
    if (baseUrl) params.set('baseUrl', baseUrl)
    
    const query = params.toString()
    const url = `/v1/seo/structured-data${query ? `?${query}` : ''}`
    
    return this.http.get(url) as Promise<StructuredDataResponse>
  }

}
import { AnalyticsResource } from './resources/analytics'
import { ArticlesResource } from './resources/articles'
import { ProjectsResource } from './resources/projects'
import { SeoResource } from './resources/seo'
import { HttpClient, HttpClientOptions } from './utils/http'

export interface SimplistClientOptions {
  /**
   * API key for authentication (optional if SIMPLIST_API_KEY env var is set)
   */
  apiKey?: string

  /**
   * Base URL for the API (default: https://api.simplist.blog)
   */
  baseUrl?: string

  /**
   * API version to use (default: '1')
   * This will be used as /v{apiVersion}/ prefix for all requests
   * @example '1' -> /v1/articles, '2' -> /v2/articles
   */
  apiVersion?: string

  /**
   * Article path for SEO URLs (e.g., "blog", "articles", "posts") - auto-adds trailing slash
   */
  path?: string

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

/**
 * Simplist API Client
 * 
 * @example
 * ```typescript
 * const client = new SimplistClient({
 *   apiKey: 'sk_your_api_key_here',
 *   path: 'blog' // Global path for all SEO URLs
 * })
 * 
 * // Get articles
 * const articles = await client.articles.list()
 * 
 * // Get specific article
 * const article = await client.articles.get('article-slug')
 * 
 * // Get project info
 * const project = await client.project.get()
 * 
 * // Track analytics (requires analytics permission)
 * const result = await client.analytics.track({
 *   articleSlug: 'my-article',
 *   timeOnPage: 120,
 *   scrollDepth: 75
 * })
 * 
 * // Get analytics stats (requires read permission)
 * const stats = await client.analytics.getStats({ days: 7 })
 * 
 * // Generate RSS feed (uses global path: blog/)
 * const rssXml = await client.seo.getRssFeed('https://yourblog.com', 20)
 * 
 * // Generate sitemap (uses global path: blog/)
 * const sitemap = await client.seo.getSitemap('https://yourblog.com', 'xml')
 * ```
 */
export class SimplistClient {
  private http: HttpClient
  private path?: string
  
  public readonly articles: ArticlesResource
  public readonly project: ProjectsResource
  public readonly analytics: AnalyticsResource
  public readonly seo: SeoResource

  constructor(options: SimplistClientOptions = {}) {
    // Auto-detect API key from environment if not provided
    const apiKey = options.apiKey || 
                   (typeof process !== 'undefined' && process.env?.SIMPLIST_API_KEY) ||
                   (typeof globalThis !== 'undefined' && (globalThis as any).SIMPLIST_API_KEY)
    
    if (!apiKey) {
      throw new Error('API key is required. Provide it via options.apiKey or set SIMPLIST_API_KEY environment variable.')
    }

    if (!apiKey.includes('prj_')) {
      throw new Error('Invalid API key format. API key should contain an underscore (e.g., "prj_your_api_key_here")')
    }

    const httpOptions: HttpClientOptions = {
      baseUrl: options.baseUrl || 'https://api.simplist.blog',
      apiKey: apiKey,
      apiVersion: options.apiVersion || '1',
      timeout: options.timeout,
      retries: options.retries,
      retryDelay: options.retryDelay
    }

    this.http = new HttpClient(httpOptions)
    this.path = options.path
    
    this.articles = new ArticlesResource(this.http)
    this.project = new ProjectsResource(this.http)
    this.analytics = new AnalyticsResource(this.http)
    this.seo = new SeoResource(this.http, this.path)
  }

  /**
   * Test the API connection and authentication
   */
  async ping(): Promise<{ status: 'ok', timestamp: string }> {
    return this.http.get('/health')
  }
}
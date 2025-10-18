import { HttpClient, HttpClientOptions } from './utils/http.js'
import { ArticlesResource } from './resources/articles.js'
import { ProjectsResource } from './resources/projects.js'

export interface SimplistClientOptions {
  /**
   * API key for authentication (required)
   */
  apiKey: string
  
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

/**
 * Simplist API Client
 * 
 * @example
 * ```typescript
 * const client = new SimplistClient({
 *   apiKey: 'sk_your_api_key_here'
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
 * ```
 */
export class SimplistClient {
  private http: HttpClient
  
  public readonly articles: ArticlesResource
  public readonly project: ProjectsResource

  constructor(options: SimplistClientOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required')
    }

    if (!options.apiKey.startsWith('sk_')) {
      throw new Error('Invalid API key format. API key should start with "sk_"')
    }

    const httpOptions: HttpClientOptions = {
      baseUrl: options.baseUrl || 'https://api.simplist.blog',
      apiKey: options.apiKey,
      timeout: options.timeout,
      retries: options.retries,
      retryDelay: options.retryDelay
    }

    this.http = new HttpClient(httpOptions)
    this.articles = new ArticlesResource(this.http)
    this.project = new ProjectsResource(this.http)
  }

  /**
   * Test the API connection and authentication
   */
  async ping(): Promise<{ status: 'ok', timestamp: string }> {
    return this.http.get('/health')
  }
}
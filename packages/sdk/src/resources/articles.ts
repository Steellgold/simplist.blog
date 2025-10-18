import { HttpClient } from '../utils/http'
import type {
  ApiResponse,
  Article,
  ArticleListItem,
  ArticleListParams
} from '../types/api.js'

export class ArticlesResource {
  constructor(private http: HttpClient) {}

  /**
   * List articles with pagination and filtering
   */
  async list(params?: ArticleListParams): Promise<ApiResponse<ArticleListItem[]>> {
    return this.http.get<ApiResponse<ArticleListItem[]>>('/v1/articles', params)
  }

  /**
   * Get a single article by slug
   */
  async get(slug: string): Promise<ApiResponse<Article>> {
    return this.http.get<ApiResponse<Article>>(`/v1/articles/${encodeURIComponent(slug)}`)
  }

  /**
   * Search articles by query
   */
  async search(query: string, params?: Omit<ArticleListParams, 'search'>): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      ...params,
      search: query
    })
  }

  /**
   * Get published articles only
   */
  async published(params?: Omit<ArticleListParams, 'published'>): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      ...params,
      published: true
    })
  }

  /**
   * Get latest articles
   */
  async latest(limit: number = 10): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      limit,
      sort: 'createdAt',
      order: 'desc',
      published: true
    })
  }

  /**
   * Get popular articles (by view count)
   * Note: This requires sorting by viewCount which might need to be added to the API
   */
  async popular(limit: number = 10): Promise<ApiResponse<ArticleListItem[]>> {
    // For now, we'll use the default sorting as the API doesn't support viewCount sorting yet
    return this.list({
      limit,
      published: true
    })
  }

  /**
   * Generate RSS feed XML
   */
  async rss(options: {
    hostname: string
    title?: string
    description?: string
    limit?: number
  }): Promise<string> {
    const { hostname, title = 'Blog Feed', description = 'Latest articles', limit = 50 } = options
    
    // Get published articles for RSS
    const response = await this.published({ limit })
    const articles = response.data

    // Build RSS XML
    const rssItems = articles.map(article => {
      const pubDate = new Date(article.createdAt).toUTCString()
      const link = `${hostname.replace(/\/$/, '')}/articles/${article.slug}`
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`
    }).join('')

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${hostname}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Simplist SDK</generator>${rssItems}
  </channel>
</rss>`

    return rssXml
  }
}
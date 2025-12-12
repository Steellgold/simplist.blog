import { HttpClient } from '../utils/http'

export interface PageViewData {
  slug: string
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

export interface PageEvent {
  type: string
  data?: Record<string, any>
  position?: number
  element?: string
  timestamp?: string
  timeOffset?: number
}

export interface PageViewResponse {
  success: boolean
  pageViewId: string
  visitorId: string
  sessionId: string
}

export interface AnalyticsStats {
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
  requestSource: {
    sdk: {
      count: number
      percentage: number
    }
    direct: {
      count: number
      percentage: number
    }
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

/**
 * Analytics resource for tracking page views and getting analytics data
 */
export class AnalyticsResource {
  constructor(private http: HttpClient) {}

  /**
   * Track a page view
   * 
   * @param data Page view data
   * @returns Promise resolving to page view tracking response
   * 
   * @example
   * ```typescript
   * const result = await client.analytics.track({
   *   slug: 'my-article',
   *   sessionId: 'session_123',
   *   pageUrl: 'https://example.com/article',
   *   timeOnPage: 120,
   *   scrollDepth: 75
   * })
   * ```
   */
  async track(data: PageViewData): Promise<PageViewResponse> {
    return this.http.post('/analytics/track', data)
  }

  /**
   * Update an existing page view with final metrics
   * 
   * @param pageViewId The page view ID to update
   * @param data Updated metrics data
   * @returns Promise resolving to success response
   * 
   * @example
   * ```typescript
   * await client.analytics.update('pageview_123', {
   *   timeOnPage: 300,
   *   scrollDepth: 95,
   *   exitPosition: 80,
   *   bounced: false
   * })
   * ```
   */
  async update(pageViewId: string, data: {
    timeOnPage?: number
    scrollDepth?: number
    exitPosition?: number
    bounced?: boolean
    events?: PageEvent[]
  }): Promise<{ success: boolean }> {
    return this.http.put(`/analytics/track/${pageViewId}`, data)
  }

  /**
   * Get analytics statistics for the project
   * 
   * @param options Query options
   * @returns Promise resolving to analytics statistics
   * 
   * @example
   * ```typescript
   * // Get last 30 days stats
   * const stats = await client.analytics.getStats()
   * 
   * // Get last 7 days stats
   * const weekStats = await client.analytics.getStats({ days: 7 })
   * ```
   */
  async getStats(options: { days?: number } = {}): Promise<AnalyticsStats> {
    const params = new URLSearchParams()
    if (options.days) {
      params.append('days', options.days.toString())
    }
    
    const query = params.toString()
    const url = query ? `/analytics/stats?${query}` : '/analytics/stats'

    return this.http.get(url)
  }
}
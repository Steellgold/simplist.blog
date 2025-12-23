import "@/types/fastify";

export interface TrackAnalyticsBody {
  articleSlug: string;
  visitorId?: string | null;
  sessionId?: string;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  country?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  screenWidth?: number;
  screenHeight?: number;
  timeOnPage?: number;
  scrollDepth?: number;
  exitPosition?: number;
  bounced?: boolean;
  timestamp?: string | Date;
  events?: Array<{
    type: string;
    data?: Record<string, unknown>;
    position?: number;
    element?: string;
    timestamp?: string | Date;
    timeOffset?: number;
  }>;
}

export interface TrackEventBody {
  articleSlug: string;
  eventType: string;
  eventData?: Record<string, unknown>;
}

export interface AnalyticsQuery {
  days?: string;
  slug?: string;
}

export interface UpdatePageViewBody {
  timeOnPage?: number;
  scrollDepth?: number;
  exitPosition?: number;
  bounced?: boolean;
}

export interface ArticlesListQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
  published?: string | boolean;
  search?: string;
  status?: string;
  tags?: string | string[];
  tagsAll?: string | string[];
  excludeTags?: string | string[];
  optionalFields?: string;
}

export interface ArticleBySlugQuery {
  includeSeo?: boolean;
  baseUrl?: string;
  optionalFields?: string;
}

export interface TagsListQuery {
  sort?: string;
  order?: string;
  limit?: string;
}

export interface SeoQuery {
  baseUrl?: string;
}

export interface SeoSitemapQuery {
  baseUrl: string;
  format?: "xml" | "json";
  lang?: string;
  customPath?: string;
}

export interface SeoRssQuery {
  baseUrl: string;
  limit?: number;
  lang?: string;
  customPath?: string;
}

export interface SeoStructuredDataQuery {
  baseUrl?: string;
  limit?: number;
  offset?: number;
}

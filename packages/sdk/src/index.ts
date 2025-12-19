// Main exports
export { SimplistClient } from "./client";
export type { SimplistClientOptions } from "./client";

// Error classes
export { SimplistApiError } from "./utils/http";

// Type exports
export type {
  ApiResponse,
  ApiError,
  Article,
  ArticleVariant,
  ArticleListItem,
  ArticleListParams,
  ArticleOptionalFields,
  Author,
  Tag,
  TagListItem,
  Project,
  ProjectStats,
  ProjectInfo,
} from "./types/api";

// Language types and utilities
export {
  Language,
  type LanguageCode,
  isValidLanguageCode,
  getAllLanguageCodes,
  POPULAR_LANGUAGES,
} from "./types/languages";

// Variant helpers
export {
  detectUserLanguage,
  getVariantOrDefault,
  getBestMatchingVariant,
  hasVariant,
  getAllLanguages,
  getVariantCount,
  isMultilingual,
  getVariantMetadata,
  VariantSelector,
} from "./utils/variant-helpers";

// Analytics types
export type {
  PageViewData,
  PageEvent,
  PageViewResponse,
  AnalyticsStats,
  AnalyticsFunnel,
} from "./resources/analytics";

// SEO types
export type {
  SeoMetadata,
  ArticleWithSeo,
  SitemapEntry,
  Sitemap,
  StructuredDataResponse,
} from "./resources/seo";

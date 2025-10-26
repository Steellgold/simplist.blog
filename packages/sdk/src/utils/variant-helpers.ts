import { Article, ArticleVariant } from '../types/api'
import { LanguageCode, Language, isValidLanguageCode } from '../types/languages'

/**
 * Detect user's preferred language from browser
 */
export const detectUserLanguage = (): LanguageCode => {
  if (typeof navigator === 'undefined') {
    return Language.ENGLISH // Server-side fallback
  }

  // Get browser language
  const browserLang = navigator.language || navigator.languages?.[0] || Language.ENGLISH
  
  // Extract language code (remove region if present, e.g., "en-US" -> "en")
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Validate and return
  return isValidLanguageCode(langCode) ? langCode as LanguageCode : Language.ENGLISH
}

/**
 * Get variant for a specific language, with fallback logic
 */
export const getVariantOrDefault = (
  article: Article, 
  lang: LanguageCode,
  fallbackLang: LanguageCode = Language.ENGLISH
): ArticleVariant | Article => {
  // If no variants, return main article
  if (!article.variants || Object.keys(article.variants).length === 0) {
    return article
  }

  // Check if requested language exists
  if (article.variants[lang]) {
    return article.variants[lang]
  }

  // Check if fallback language exists
  if (article.variants[fallbackLang]) {
    return article.variants[fallbackLang]
  }

  // Return first available variant
  const firstVariant = Object.values(article.variants)[0]
  if (firstVariant) {
    return firstVariant
  }

  // Final fallback to main article
  return article
}

/**
 * Get the best matching variant based on user's browser language
 */
export const getBestMatchingVariant = (
  article: Article,
  defaultLang?: LanguageCode
): ArticleVariant | Article => {
  const userLang = detectUserLanguage()
  const fallback = defaultLang || Language.ENGLISH
  
  return getVariantOrDefault(article, userLang, fallback)
}

/**
 * Check if article has a variant in a specific language
 */
export const hasVariant = (article: Article, lang: LanguageCode): boolean => {
  return Boolean(article.variants?.[lang])
}

/**
 * Get all available languages for an article
 */
export const getAllLanguages = (article: Article): LanguageCode[] => {
  if (!article.variants) return []
  return Object.keys(article.variants) as LanguageCode[]
}

/**
 * Get total number of variants for an article
 */
export const getVariantCount = (article: Article): number => {
  return article.variants ? Object.keys(article.variants).length : 0
}

/**
 * Check if article is multilingual (has variants)
 */
export const isMultilingual = (article: Article): boolean => {
  return getVariantCount(article) > 0
}

/**
 * Get variant metadata (language info)
 */
export const getVariantMetadata = (article: Article) => {
  const languages = getAllLanguages(article)
  const count = getVariantCount(article)
  const isMultiLang = isMultilingual(article)
  
  return {
    languages,
    count,
    isMultilingual: isMultiLang,
    hasVariants: isMultiLang,
  }
}

/**
 * Smart content selector that returns the appropriate content based on user preference
 */
export class VariantSelector {
  private defaultLanguage: LanguageCode
  private userLanguage: LanguageCode

  constructor(options: {
    defaultLanguage?: LanguageCode
    userLanguage?: LanguageCode
  } = {}) {
    this.defaultLanguage = options.defaultLanguage || Language.ENGLISH
    this.userLanguage = options.userLanguage || detectUserLanguage()
  }

  /**
   * Get the best content for an article
   */
  getContent(article: Article): ArticleVariant | Article {
    return getVariantOrDefault(article, this.userLanguage, this.defaultLanguage)
  }

  /**
   * Get title in user's preferred language
   */
  getTitle(article: Article): string {
    const content = this.getContent(article)
    return content.title
  }

  /**
   * Get excerpt in user's preferred language
   */
  getExcerpt(article: Article): string | null {
    const content = this.getContent(article)
    return content.excerpt
  }

  /**
   * Get full content in user's preferred language
   */
  getFullContent(article: Article): string {
    const content = this.getContent(article)
    return content.content
  }

  /**
   * Get cover image in user's preferred language (if variant supports it)
   */
  getCoverImage(article: Article): string | null {
    const content = this.getContent(article)
    return content.coverImage
  }

  /**
   * Get language of the selected content
   */
  getSelectedLanguage(article: Article): LanguageCode {
    const content = this.getContent(article)
    
    // If it's a variant, return its language
    if ('lang' in content) {
      return content.lang
    }
    
    // If it's the main article, assume default language
    return this.defaultLanguage
  }

  /**
   * Update user language preference
   */
  setUserLanguage(lang: LanguageCode): void {
    this.userLanguage = lang
  }

  /**
   * Update default language
   */
  setDefaultLanguage(lang: LanguageCode): void {
    this.defaultLanguage = lang
  }
}
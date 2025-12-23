import { Article, ArticleVariant } from "../types/api";
import {
  LanguageCode,
  Language,
  isValidLanguageCode,
} from "../types/languages";

/**
 * Detect user's preferred language from browser or provided language
 * @param serverLang - Optional language code from server (e.g., from Accept-Language header or cookies)
 */
export const detectUserLanguage = (serverLang?: LanguageCode): LanguageCode => {
  // Server-side with provided language
  if (typeof navigator === "undefined") {
    return serverLang && isValidLanguageCode(serverLang)
      ? serverLang
      : Language.ENGLISH;
  }

  // Client-side browser detection
  const browserLang =
    navigator.language || navigator.languages?.[0] || Language.ENGLISH;

  // Extract language code (remove region if present, e.g., "en-US" -> "en")
  const langCode = browserLang.split("-")[0].toLowerCase();

  // Validate and return
  return isValidLanguageCode(langCode)
    ? (langCode as LanguageCode)
    : Language.ENGLISH;
};

/**
 * Get variant for a specific language, with fallback logic
 *
 * NOTE: The main article is assumed to be in the fallback language.
 * If lang matches fallback and no variant exists for it, the main article is returned.
 */
export const getVariantOrDefault = (
  article: Article,
  lang: LanguageCode,
  fallbackLang: LanguageCode = Language.ENGLISH,
): ArticleVariant | Article => {
  // Validate language codes
  if (!isValidLanguageCode(lang)) {
    console.warn(
      `[Simplist SDK] Invalid language code: "${lang}", falling back to "${fallbackLang}"`,
    );
    lang = fallbackLang;
  }

  if (!isValidLanguageCode(fallbackLang)) {
    console.warn(
      `[Simplist SDK] Invalid fallback language: "${fallbackLang}", using English`,
    );
    fallbackLang = Language.ENGLISH;
  }

  // If no variants, return main article
  if (!article.variants || Object.keys(article.variants).length === 0) {
    return article;
  }

  // If requested language matches fallback and no variant exists, return main article
  // This assumes the main article is in the fallback language
  if (lang === fallbackLang && !article.variants[lang]) {
    return article;
  }

  // Check if requested language exists
  if (article.variants[lang]) {
    return article.variants[lang];
  }

  // Fallback to main article (assumed to be in fallback language)
  return article;
};

/**
 * Get the best matching variant based on user's browser language
 */
export const getBestMatchingVariant = (
  article: Article,
  userLang?: LanguageCode,
  fallbackLang?: LanguageCode,
): ArticleVariant | Article => {
  const lang =
    userLang !== undefined && userLang !== null
      ? userLang
      : detectUserLanguage();
  const fallback = fallbackLang || Language.ENGLISH;

  return getVariantOrDefault(article, lang, fallback);
};

/**
 * Check if article has a variant in a specific language
 */
export const hasVariant = (article: Article, lang: LanguageCode): boolean => {
  return Boolean(article.variants?.[lang]);
};

/**
 * Get all available languages for an article
 */
export const getAllLanguages = (article: Article): LanguageCode[] => {
  if (!article.variants) return [];
  return Object.keys(article.variants) as LanguageCode[];
};

/**
 * Get total number of variants for an article
 */
export const getVariantCount = (article: Article): number => {
  return article.variants ? Object.keys(article.variants).length : 0;
};

/**
 * Check if article is multilingual (has variants)
 */
export const isMultilingual = (article: Article): boolean => {
  return getVariantCount(article) > 0;
};

/**
 * Get variant metadata (language info)
 */
export const getVariantMetadata = (article: Article) => {
  const languages = getAllLanguages(article);
  const count = getVariantCount(article);
  const isMultiLang = isMultilingual(article);

  return {
    languages,
    count,
    isMultilingual: isMultiLang,
    hasVariants: isMultiLang,
  };
};

/**
 * Smart content selector that returns the appropriate content based on user preference
 */
export class VariantSelector {
  private defaultLanguage: LanguageCode;
  private userLanguage: LanguageCode;

  constructor(
    options: {
      defaultLanguage?: LanguageCode;
      userLanguage?: LanguageCode;
    } = {},
  ) {
    this.defaultLanguage = options.defaultLanguage || Language.ENGLISH;
    this.userLanguage = options.userLanguage || detectUserLanguage();
  }

  /**
   * Get the best content for an article
   */
  getContent(article: Article): ArticleVariant | Article {
    return getVariantOrDefault(
      article,
      this.userLanguage,
      this.defaultLanguage,
    );
  }

  /**
   * Get title in user's preferred language
   */
  getTitle(article: Article): string {
    const content = this.getContent(article);
    return content.title;
  }

  /**
   * Get excerpt in user's preferred language
   */
  getExcerpt(article: Article): string | null {
    const content = this.getContent(article);
    return content.excerpt;
  }

  /**
   * Get full content in user's preferred language
   */
  getFullContent(article: Article): string {
    const content = this.getContent(article);
    return content.content;
  }

  /**
   * Get cover image in user's preferred language (if variant supports it)
   */
  getCoverImage(article: Article): string | null {
    const content = this.getContent(article);
    return content.coverImage;
  }

  /**
   * Get language of the selected content
   *
   * NOTE: If the main article is returned (no variant), this first checks
   * if the article has a `lang` property. If not, it assumes the main article
   * is in the defaultLanguage.
   */
  getSelectedLanguage(article: Article): LanguageCode {
    const content = this.getContent(article);

    // If it's a variant, return its language
    if ("lang" in content && content.lang) {
      return content.lang;
    }

    // If main article, use defaultLanguage
    return this.defaultLanguage;
  }

  /**
   * Update user language preference
   */
  setUserLanguage(lang: LanguageCode): void {
    this.userLanguage = lang;
  }

  /**
   * Update default language
   */
  setDefaultLanguage(lang: LanguageCode): void {
    this.defaultLanguage = lang;
  }
}

"use client"

import { type LanguageCode } from "@/lib/types/languages"

export interface ArticleVariant {
  lang: LanguageCode
  title: string
  excerpt: string
  content: string
  coverImage?: string
}

/**
 * Hook for variant operations - all the logic you need
 */
export const useVariantOperations = (variants: ArticleVariant[], onVariantsUpdate: (variants: ArticleVariant[]) => void, defaultLanguage: LanguageCode) => {
  
  // Add a new variant
  const addVariant = (lang: LanguageCode): boolean => {
    // Check if language already exists
    if (variants.some(v => v.lang === lang)) {
      return false // Already exists
    }

    const newVariant: ArticleVariant = {
      lang,
      title: "",
      excerpt: "",
      content: "",
    }

    onVariantsUpdate([...variants, newVariant])
    return true
  }

  // Remove a variant
  const removeVariant = (lang: LanguageCode): boolean => {
    if (lang === defaultLanguage) {
      return false // Cannot remove default
    }

    onVariantsUpdate(variants.filter(v => v.lang !== lang))
    return true
  }

  // Update a specific variant
  const updateVariant = (lang: LanguageCode, updates: Partial<Omit<ArticleVariant, 'lang'>>) => {
    onVariantsUpdate(variants.map(variant => 
      variant.lang === lang 
        ? { ...variant, ...updates }
        : variant
    ))
  }

  // Get a specific variant
  const getVariant = (lang: LanguageCode): ArticleVariant | undefined => {
    return variants.find(v => v.lang === lang)
  }

  // Get all languages currently used
  const getUsedLanguages = (): LanguageCode[] => {
    return variants.map(v => v.lang)
  }

  // Get non-default variants
  const getNonDefaultVariants = (): ArticleVariant[] => {
    return variants.filter(v => v.lang !== defaultLanguage)
  }

  // Get default variant
  const getDefaultVariant = (): ArticleVariant | undefined => {
    return variants.find(v => v.lang === defaultLanguage)
  }

  // Check if a language exists
  const hasLanguage = (lang: LanguageCode): boolean => {
    return variants.some(v => v.lang === lang)
  }

  return {
    // Operations
    addVariant,
    removeVariant,
    updateVariant,
    
    // Getters
    getVariant,
    getUsedLanguages,
    getNonDefaultVariants,
    getDefaultVariant,
    hasLanguage,
    
    // Computed values
    variantCount: variants.length,
    nonDefaultCount: variants.filter(v => v.lang !== defaultLanguage).length,
    hasNonDefaultVariants: variants.some(v => v.lang !== defaultLanguage),
  }
}
